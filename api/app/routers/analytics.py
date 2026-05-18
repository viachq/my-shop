from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, aliased

from app.deps import get_db, require_roles
from app.models import Order, OrderItem, Product, User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _resolve_period(days: int, start_date: Optional[str], end_date: Optional[str]):
    now = datetime.now(timezone.utc)
    if start_date and end_date:
        p_start = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        p_end   = datetime.strptime(end_date,   "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1)
    else:
        p_end   = now
        p_start = now - timedelta(days=days)
    return p_start, p_end


@router.get("/summary")
def get_summary(
    days: int = 30,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    now = datetime.now(timezone.utc)
    period_start, period_end = _resolve_period(days, start_date, end_date)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start  = now - timedelta(days=7)

    total_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
        Order.created_at >= period_start, Order.created_at < period_end,
    ).scalar()

    orders_count = db.query(func.count(Order.id)).filter(
        Order.created_at >= period_start, Order.created_at < period_end,
    ).scalar()

    new_customers = (
        db.query(func.count(User.id))
        .filter(User.role == "customer", User.created_at >= period_start, User.created_at < period_end)
        .scalar()
    )
    new_customers_today = (
        db.query(func.count(User.id))
        .filter(User.role == "customer", User.created_at >= today_start)
        .scalar()
    )
    new_customers_week = (
        db.query(func.count(User.id))
        .filter(User.role == "customer", User.created_at >= week_start)
        .scalar()
    )

    average_check = (
        db.query(func.coalesce(func.avg(Order.total), 0))
        .filter(Order.created_at >= period_start, Order.created_at < period_end)
        .scalar()
    )

    top_products_query = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.qty).label("total_qty"),
            func.sum(OrderItem.qty * OrderItem.price).label("total_revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.created_at >= period_start, Order.created_at < period_end)
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.qty * OrderItem.price).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {
            "name": row.product_name,
            "total_qty": int(row.total_qty),
            "total_revenue": float(row.total_revenue),
        }
        for row in top_products_query
    ]

    return {
        "total_revenue": float(total_revenue),
        "orders_count": int(orders_count),
        "new_customers": int(new_customers),
        "new_customers_today": int(new_customers_today),
        "new_customers_week": int(new_customers_week),
        "average_check": round(float(average_check), 2),
        "top_products": top_products,
    }


@router.get("/detailed")
def get_detailed(
    days: int = 30,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    now = datetime.now(timezone.utc)
    period_start, period_end = _resolve_period(days, start_date, end_date)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    six_months_ago = now - timedelta(days=180)

    revenue_by_day_query = (
        db.query(
            func.date(Order.created_at).label("date"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(Order.created_at >= period_start, Order.created_at < period_end)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    revenue_by_day = [
        {
            "date": str(row.date),
            "revenue": float(row.revenue),
            "orders": int(row.orders),
        }
        for row in revenue_by_day_query
    ]

    status_query = (
        db.query(
            Order.status,
            func.count(Order.id).label("count"),
        )
        .group_by(Order.status)
        .all()
    )
    status_map = {str(row.status.value if hasattr(row.status, "value") else row.status): int(row.count) for row in status_query}
    all_statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    orders_by_status = [
        {"status": s, "count": status_map.get(s, 0)}
        for s in all_statuses
    ]

    revenue_by_month_query = (
        db.query(
            func.to_char(Order.created_at, "YYYY-MM").label("month"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .filter(Order.created_at >= six_months_ago)
        .group_by(func.to_char(Order.created_at, "YYYY-MM"))
        .order_by(func.to_char(Order.created_at, "YYYY-MM"))
        .all()
    )
    revenue_by_month = [
        {"month": row.month, "revenue": float(row.revenue)}
        for row in revenue_by_month_query
    ]

    top_customers_query = (
        db.query(
            User.name,
            User.email,
            func.count(Order.id).label("orders_count"),
            func.coalesce(func.sum(Order.total), 0).label("total_spent"),
        )
        .join(Order, Order.user_id == User.id)
        .group_by(User.id, User.name, User.email)
        .order_by(func.sum(Order.total).desc())
        .limit(5)
        .all()
    )
    top_customers = [
        {
            "name": row.name,
            "email": row.email,
            "orders_count": int(row.orders_count),
            "total_spent": float(row.total_spent),
        }
        for row in top_customers_query
    ]

    payment_methods_query = (
        db.query(
            Order.payment_method,
            func.count(Order.id).label("count"),
        )
        .group_by(Order.payment_method)
        .order_by(func.count(Order.id).desc())
        .all()
    )
    payment_methods = [
        {"method": row.payment_method, "count": int(row.count)}
        for row in payment_methods_query
    ]

    delivery_methods_query = (
        db.query(
            Order.delivery_method,
            func.count(Order.id).label("count"),
        )
        .group_by(Order.delivery_method)
        .order_by(func.count(Order.id).desc())
        .all()
    )
    delivery_methods = [
        {"method": row.delivery_method, "count": int(row.count)}
        for row in delivery_methods_query
    ]

    low_stock_query = (
        db.query(Product.name, Product.stock, Product.category)
        .filter(Product.stock < 10)
        .order_by(Product.stock.asc())
        .limit(10)
        .all()
    )
    low_stock_products = [
        {"name": row.name, "stock": int(row.stock), "category": row.category}
        for row in low_stock_query
    ]

    current_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
        Order.created_at >= thirty_days_ago
    ).scalar()
    previous_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
        Order.created_at >= sixty_days_ago,
        Order.created_at < thirty_days_ago,
    ).scalar()

    current_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= thirty_days_ago
    ).scalar()
    previous_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= sixty_days_ago,
        Order.created_at < thirty_days_ago,
    ).scalar()

    current_customers = db.query(func.count(User.id)).filter(
        User.role == "customer",
        User.created_at >= thirty_days_ago,
    ).scalar()
    previous_customers = db.query(func.count(User.id)).filter(
        User.role == "customer",
        User.created_at >= sixty_days_ago,
        User.created_at < thirty_days_ago,
    ).scalar()

    def pct_change(current, previous):
        current_f = float(current or 0)
        previous_f = float(previous or 0)
        if previous_f == 0:
            return 0.0
        return round((current_f - previous_f) / previous_f * 100, 1)

    growth = {
        "revenue_change_percent": pct_change(current_revenue, previous_revenue),
        "orders_change_percent": pct_change(current_orders, previous_orders),
        "customers_change_percent": pct_change(current_customers, previous_customers),
    }

    return {
        "revenue_by_day": revenue_by_day,
        "orders_by_status": orders_by_status,
        "revenue_by_month": revenue_by_month,
        "top_customers": top_customers,
        "payment_methods": payment_methods,
        "delivery_methods": delivery_methods,
        "low_stock_products": low_stock_products,
        "growth": growth,
    }


@router.get("/advanced")
def get_advanced(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    three_days_ago = now - timedelta(days=3)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    orders_per_customer_query = (
        db.query(
            Order.user_id,
            func.count(Order.id).label("cnt"),
        )
        .group_by(Order.user_id)
        .all()
    )
    seg_1 = 0
    seg_2_5 = 0
    seg_5_plus = 0
    for row in orders_per_customer_query:
        cnt = int(row.cnt)
        if cnt == 1:
            seg_1 += 1
        elif 2 <= cnt <= 5:
            seg_2_5 += 1
        else:
            seg_5_plus += 1
    customer_segmentation = [
        {"bucket": "1", "count": seg_1},
        {"bucket": "2-5", "count": seg_2_5},
        {"bucket": "5+", "count": seg_5_plus},
    ]

    first_order_subq = (
        db.query(
            Order.user_id.label("user_id"),
            func.min(Order.created_at).label("first_order"),
        )
        .group_by(Order.user_id)
        .subquery()
    )
    new_customers_month = (
        db.query(func.count())
        .select_from(first_order_subq)
        .filter(first_order_subq.c.first_order >= month_start)
        .scalar()
    )
    returning_customers_month = (
        db.query(func.count(func.distinct(Order.user_id)))
        .filter(Order.created_at >= month_start)
        .scalar()
    ) - int(new_customers_month or 0)
    if returning_customers_month < 0:
        returning_customers_month = 0
    new_vs_returning = {
        "new_customers": int(new_customers_month or 0),
        "returning": int(returning_customers_month),
    }

    total_per_customer = (
        db.query(func.sum(Order.total).label("total"))
        .group_by(Order.user_id)
        .subquery()
    )
    clv = db.query(func.coalesce(func.avg(total_per_customer.c.total), 0)).scalar()
    customer_lifetime_value = round(float(clv or 0), 2)

    users_last_30 = {
        row.user_id
        for row in db.query(Order.user_id)
        .filter(Order.created_at >= thirty_days_ago)
        .distinct()
        .all()
    }
    users_31_60 = {
        row.user_id
        for row in db.query(Order.user_id)
        .filter(Order.created_at >= sixty_days_ago, Order.created_at < thirty_days_ago)
        .distinct()
        .all()
    }
    if users_31_60:
        retained = len(users_last_30 & users_31_60)
        retention_rate = round(retained / len(users_31_60) * 100, 1)
    else:
        retention_rate = 0.0

    dow_query = (
        db.query(
            func.extract("dow", Order.created_at).label("dow"),
            func.count(Order.id).label("cnt"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .group_by(func.extract("dow", Order.created_at))
        .all()
    )
    dow_map = {}
    for row in dow_query:
        pg_dow = int(row.dow)
        mon_based = (pg_dow - 1) % 7
        dow_map[mon_based] = {"count": int(row.cnt), "revenue": float(row.revenue)}
    orders_by_weekday = [
        {
            "day": d,
            "count": dow_map.get(d, {"count": 0, "revenue": 0.0})["count"],
            "revenue": dow_map.get(d, {"count": 0, "revenue": 0.0})["revenue"],
        }
        for d in range(7)
    ]

    hour_query = (
        db.query(
            func.extract("hour", Order.created_at).label("hour"),
            func.count(Order.id).label("cnt"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .group_by(func.extract("hour", Order.created_at))
        .all()
    )
    hour_map = {
        int(row.hour): {"count": int(row.cnt), "revenue": float(row.revenue)}
        for row in hour_query
    }
    orders_by_hour = [
        {
            "hour": h,
            "count": hour_map.get(h, {"count": 0, "revenue": 0.0})["count"],
            "revenue": hour_map.get(h, {"count": 0, "revenue": 0.0})["revenue"],
        }
        for h in range(24)
    ]

    status_query = (
        db.query(Order.status, func.count(Order.id).label("cnt"))
        .group_by(Order.status)
        .all()
    )
    status_map = {
        str(row.status.value if hasattr(row.status, "value") else row.status): int(row.cnt)
        for row in status_query
    }
    all_statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    status_funnel = [{"status": s, "count": status_map.get(s, 0)} for s in all_statuses]

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    cancelled_count = status_map.get("cancelled", 0)
    cancellation_rate = (
        round(cancelled_count / total_orders * 100, 1) if total_orders else 0.0
    )

    delivered_avg = (
        db.query(
            func.avg(
                func.extract("epoch", now - Order.created_at) / 86400.0
            )
        )
        .filter(Order.status == "delivered")
        .scalar()
    )
    avg_delivery_days = round(float(delivered_avg or 0), 1)

    new_over_3d = (
        db.query(func.count(Order.id))
        .filter(Order.status == "new", Order.created_at < three_days_ago)
        .scalar()
    ) or 0
    processing_over_3d = (
        db.query(func.count(Order.id))
        .filter(Order.status == "processing", Order.created_at < three_days_ago)
        .scalar()
    ) or 0
    pending_orders = {
        "new_over_3d": int(new_over_3d),
        "processing_over_3d": int(processing_over_3d),
    }

    oi_a = aliased(OrderItem)
    oi_b = aliased(OrderItem)
    pair_query = (
        db.query(
            oi_a.product_name.label("a"),
            oi_b.product_name.label("b"),
            func.count().label("cnt"),
        )
        .join(oi_b, and_(oi_a.order_id == oi_b.order_id, oi_a.product_name < oi_b.product_name))
        .group_by(oi_a.product_name, oi_b.product_name)
        .order_by(func.count().desc())
        .limit(10)
        .all()
    )
    cross_sell_pairs = [
        {"product_a": row.a, "product_b": row.b, "count": int(row.cnt)}
        for row in pair_query
    ]

    sold_names_subq = db.query(OrderItem.product_name).distinct().subquery()
    never_sold_query = (
        db.query(Product.name, Product.category, Product.stock)
        .outerjoin(sold_names_subq, Product.name == sold_names_subq.c.product_name)
        .filter(sold_names_subq.c.product_name.is_(None))
        .order_by(Product.stock.desc())
        .limit(10)
        .all()
    )
    never_sold_products = [
        {"name": row.name, "category": row.category, "stock": int(row.stock)}
        for row in never_sold_query
    ]

    sold_qty_subq = (
        db.query(
            OrderItem.product_name.label("pname"),
            func.sum(OrderItem.qty).label("sold_qty"),
        )
        .group_by(OrderItem.product_name)
        .subquery()
    )
    overstocked_query = (
        db.query(
            Product.name,
            Product.stock,
            func.coalesce(sold_qty_subq.c.sold_qty, 0).label("sold_qty"),
        )
        .outerjoin(sold_qty_subq, Product.name == sold_qty_subq.c.pname)
        .filter(
            Product.stock >= 50,
            func.coalesce(sold_qty_subq.c.sold_qty, 0) <= 5,
        )
        .order_by(Product.stock.desc())
        .limit(10)
        .all()
    )
    overstocked_products = [
        {"name": row.name, "stock": int(row.stock), "sold_qty": int(row.sold_qty)}
        for row in overstocked_query
    ]

    stock_value_val = db.query(
        func.coalesce(func.sum(Product.price * Product.stock), 0)
    ).scalar()
    stock_value = round(float(stock_value_val or 0), 2)

    discount_val = (
        db.query(
            func.coalesce(
                func.sum((Product.old_price - Product.price) * OrderItem.qty), 0
            )
        )
        .select_from(OrderItem)
        .join(Product, Product.name == OrderItem.product_name)
        .filter(Product.old_price.isnot(None), Product.old_price > Product.price)
        .scalar()
    )
    total_discount_given = round(float(discount_val or 0), 2)

    sale_rev_val = (
        db.query(func.coalesce(func.sum(OrderItem.qty * OrderItem.price), 0))
        .select_from(OrderItem)
        .join(Product, Product.name == OrderItem.product_name)
        .filter(Product.badge == "sale")
        .scalar()
    )
    total_oi_rev_val = db.query(
        func.coalesce(func.sum(OrderItem.qty * OrderItem.price), 0)
    ).scalar()
    sale_revenue = round(float(sale_rev_val or 0), 2)
    total_oi_rev = float(total_oi_rev_val or 0)
    regular_revenue = round(total_oi_rev - sale_revenue, 2)
    sale_revenue_percent = (
        round(sale_revenue / total_oi_rev * 100, 1) if total_oi_rev else 0.0
    )
    sale_impact = {
        "total_discount_given": total_discount_given,
        "sale_revenue_percent": sale_revenue_percent,
        "regular_revenue": regular_revenue,
        "sale_revenue": sale_revenue,
    }

    aov_query = (
        db.query(
            func.date(Order.created_at).label("date"),
            func.avg(Order.total).label("aov"),
        )
        .filter(Order.created_at >= thirty_days_ago)
        .group_by(func.date(Order.created_at))
        .all()
    )
    aov_map = {str(row.date): round(float(row.aov or 0), 2) for row in aov_query}
    aov_trend = []
    today = now.date()
    for i in range(29, -1, -1):
        d = today - timedelta(days=i)
        key = str(d)
        aov_trend.append({"date": key, "aov": aov_map.get(key, 0.0)})

    pm_query = (
        db.query(
            Order.payment_method,
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
            func.count(Order.id).label("cnt"),
        )
        .group_by(Order.payment_method)
        .order_by(func.sum(Order.total).desc())
        .all()
    )
    revenue_by_payment_method = [
        {
            "method": row.payment_method,
            "revenue": float(row.revenue),
            "count": int(row.cnt),
        }
        for row in pm_query
    ]

    return {
        "customer_segmentation": customer_segmentation,
        "new_vs_returning": new_vs_returning,
        "customer_lifetime_value": customer_lifetime_value,
        "retention_rate": retention_rate,
        "orders_by_weekday": orders_by_weekday,
        "orders_by_hour": orders_by_hour,
        "status_funnel": status_funnel,
        "cancellation_rate": cancellation_rate,
        "avg_delivery_days": avg_delivery_days,
        "pending_orders": pending_orders,
        "cross_sell_pairs": cross_sell_pairs,
        "never_sold_products": never_sold_products,
        "overstocked_products": overstocked_products,
        "stock_value": stock_value,
        "sale_impact": sale_impact,
        "aov_trend": aov_trend,
        "revenue_by_payment_method": revenue_by_payment_method,
    }
