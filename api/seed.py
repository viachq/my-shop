"""
Seed script for TechBox database.
Run with: uv run python seed.py
"""

import random
from datetime import datetime, timedelta, timezone

from app.auth import hash_password
from app.database import Base, engine, SessionLocal
from app.models import (
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductReview,
    PromoCode,
    SiteSetting,
    User,
    UserRole,
)


def seed():
    # Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()
    now = datetime.now(timezone.utc)
    random.seed(42)  # reproducible randomness

    # Helper: random datetime within last N days
    def rand_dt(days_ago_max, days_ago_min=0):
        delta = random.uniform(days_ago_min, days_ago_max)
        return now - timedelta(days=delta)

    # ── Users ─────────────────────────────────────────────────────────
    users = [
        User(
            name="Суперадмін",
            email="admin@techbox.ua",
            phone="+380670000000",
            password_hash=hash_password("admin@techbox.ua"),
            role=UserRole.superadmin,
        ),
        User(
            name="Адміністратор",
            email="admin@techbox.com",
            phone="+380671234567",
            password_hash=hash_password("admin@techbox.com"),
            role=UserRole.admin,
        ),
        User(
            name="Менеджер Олена",
            email="manager@techbox.com",
            phone="+380672345678",
            password_hash=hash_password("manager@techbox.com"),
            role=UserRole.manager,
        ),
        User(
            name="Складський Іван",
            email="warehouse@techbox.com",
            phone="+380673456789",
            password_hash=hash_password("warehouse@techbox.com"),
            role=UserRole.warehouse,
        ),
        # ── Customers (11) ──
        User(
            name="Test User",
            email="test@test.com",
            phone="+380670000001",
            password_hash=hash_password("test@test.com"),
            role=UserRole.customer,
        ),
        User(
            name="Тарас Шевченко",
            email="taras@example.com",
            phone="+380674567890",
            password_hash=hash_password("taras@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Леся Українка",
            email="lesya@example.com",
            phone="+380675678901",
            password_hash=hash_password("lesya@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Іван Франко",
            email="franko@example.com",
            phone="+380676789012",
            password_hash=hash_password("franko@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Оксана Петренко",
            email="oksana.p@example.com",
            phone="+380677890123",
            password_hash=hash_password("oksana.p@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Андрій Коваленко",
            email="andriy.k@example.com",
            phone="+380678901234",
            password_hash=hash_password("andriy.k@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Марія Бондаренко",
            email="maria.b@example.com",
            phone="+380679012345",
            password_hash=hash_password("maria.b@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Дмитро Ткаченко",
            email="dmytro.t@example.com",
            phone="+380670123456",
            password_hash=hash_password("dmytro.t@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Наталія Шевчук",
            email="natalia.sh@example.com",
            phone="+380671234568",
            password_hash=hash_password("natalia.sh@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Олександр Мельник",
            email="oleksandr.m@example.com",
            phone="+380672345679",
            password_hash=hash_password("oleksandr.m@example.com"),
            role=UserRole.customer,
        ),
        User(
            name="Юлія Кравченко",
            email="yulia.kr@example.com",
            phone="+380673456780",
            password_hash=hash_password("yulia.kr@example.com"),
            role=UserRole.customer,
        ),
    ]
    db.add_all(users)
    db.flush()
    print(f"Seeded {len(users)} users.")

    # ── Products (25 items) ───────────────────────────────────────────
    products = [
        # Sale products (5)
        Product(
            name="Apple iPhone 17 256GB White",
            price=41699.00,
            old_price=49699.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/092239/vfgr-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/092239/vfgr-300x300.png.webp"],
            badge="sale",
            category="Смартфони",
            stock=25,
            weight="171 г",
            created_at=rand_dt(85),
        ),
        Product(
            name="AirPods Pro 2 USB-C (2023)",
            price=8799.00,
            old_price=10999.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2022/09/072342/MQD83%20(1)-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2022/09/072342/MQD83%20(1)-300x300.jpg.webp"],
            badge="sale",
            category="Навушники",
            stock=40,
            weight="50 г",
            created_at=rand_dt(80),
        ),
        Product(
            name="MacBook Air 13 M4 Midnight 256GB",
            price=50599.00,
            old_price=51949.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/03/051707/midnight-1-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/03/051707/midnight-1-300x300.png.webp"],
            badge="sale",
            category="Ноутбуки",
            stock=12,
            weight="1240 г",
            created_at=rand_dt(75),
        ),
        Product(
            name="Apple Watch SE 2 GPS 40mm Starlight",
            price=9499.00,
            old_price=10599.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2024/10/161233/12rgfed-300x300.jpeg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2024/10/161233/12rgfed-300x300.jpeg.webp"],
            badge="sale",
            category="Смарт-годинники",
            stock=30,
            weight="33 г",
            created_at=rand_dt(70),
        ),
        Product(
            name="AirPods Max USB-C 2024 Starlight",
            price=23799.00,
            old_price=27999.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2024/09/092318/2-(1)-(1)-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2024/09/092318/2-(1)-(1)-300x300.jpg.webp"],
            badge="sale",
            category="Навушники",
            stock=20,
            weight="384 г",
            created_at=rand_dt(65),
        ),
        # New products (6)
        Product(
            name="Apple iPhone 17 Pro Max 256GB Cosmic Orange",
            price=66699.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/101332/CosmicOrange-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/101332/CosmicOrange-300x300.png.webp"],
            badge="new",
            category="Смартфони",
            stock=15,
            weight="227 г",
            created_at=rand_dt(10),
        ),
        Product(
            name="AirPods Pro 3 (2025)",
            price=10999.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/092358/vbfbg-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/092358/vbfbg-300x300.png.webp"],
            badge="new",
            category="Навушники",
            stock=35,
            weight="50 г",
            created_at=rand_dt(8),
        ),
        Product(
            name="Apple iPad Air 11 M3 128GB Space Gray",
            price=26699.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2024/05/081358/Apple_Air_11_Space_Gray-1-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2024/05/081358/Apple_Air_11_Space_Gray-1-300x300.jpg.webp"],
            badge="new",
            category="Планшети",
            stock=18,
            weight="462 г",
            created_at=rand_dt(20),
        ),
        Product(
            name="Apple iPhone 17 Air 512GB Light Gold",
            price=53399.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/101015/Light%20Gold-(1)-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/101015/Light%20Gold-(1)-300x300.png.webp"],
            badge="new",
            category="Смартфони",
            stock=10,
            weight="155 г",
            created_at=rand_dt(12),
        ),
        Product(
            name="Apple Watch Series 10 GPS 46mm Jet Black",
            price=16499.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2024/09/100858/watch1-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2024/09/100858/watch1-300x300.jpg.webp"],
            badge="new",
            category="Смарт-годинники",
            stock=22,
            weight="36 г",
            created_at=rand_dt(15),
        ),
        Product(
            name="Apple AirPods 4 with ANC",
            price=7599.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/10/221710/derf-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/10/221710/derf-300x300.png.webp"],
            badge="new",
            category="Навушники",
            stock=45,
            weight="44 г",
            created_at=rand_dt(5),
        ),
        # Additional catalogue products (14)
        Product(
            name="MacBook Air 13 M4 Sky Blue 256GB",
            price=50599.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp"],
            category="Ноутбуки",
            stock=14,
            weight="1240 г",
            created_at=rand_dt(88),
        ),
        Product(
            name="MacBook Air 15 M4 Midnight 256GB",
            price=55499.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/03/051702/Midnight-m4-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/03/051702/Midnight-m4-300x300.jpg.webp"],
            category="Ноутбуки",
            stock=10,
            weight="1510 г",
            created_at=rand_dt(82),
        ),
        Product(
            name="Apple iPhone 17 Pro 256GB Deep Blue",
            price=62999.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp"],
            category="Смартфони",
            stock=20,
            weight="199 г",
            created_at=rand_dt(30),
        ),
        Product(
            name="Apple Watch Ultra 2 49mm Black Titanium",
            price=29799.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp"],
            category="Смарт-годинники",
            stock=8,
            weight="61 г",
            created_at=rand_dt(60),
        ),
        Product(
            name="Apple iPad 11 128GB Wi-Fi Silver",
            price=16999.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp"],
            category="Планшети",
            stock=25,
            weight="477 г",
            created_at=rand_dt(87),
        ),
        Product(
            name="Apple iPad 11 128GB Wi-Fi Blue",
            price=16699.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/03/041822/blue1-(1)-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/03/041822/blue1-(1)-300x300.png.webp"],
            category="Планшети",
            stock=20,
            weight="477 г",
            created_at=rand_dt(45),
        ),
        Product(
            name="Apple AirPods 4 (2024)",
            price=5599.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/10/221711/derf-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/10/221711/derf-300x300.png.webp"],
            category="Навушники",
            stock=55,
            weight="40 г",
            created_at=rand_dt(50),
        ),
        Product(
            name="Apple iPhone 17 Pro Max 512GB Deep Blue",
            price=77799.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/101329/deepBlue-(4)-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/101329/deepBlue-(4)-300x300.png.webp"],
            category="Смартфони",
            stock=8,
            weight="227 г",
            created_at=rand_dt(18),
        ),
        Product(
            name="Apple iPhone 17 Air 256GB Space Black",
            price=42399.00,
            img="https://img.jabko.ua/image/cache/catalog/products/2025/09/101014/Space%20Black-300x300.png.webp",
            images=["https://img.jabko.ua/image/cache/catalog/products/2025/09/101014/Space%20Black-300x300.png.webp"],
            category="Смартфони",
            stock=18,
            weight="155 г",
            created_at=rand_dt(22),
        ),
        Product(
            name="JBL Flip 6",
            price=3499.00,
            img="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
            images=["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"],
            category="Акустика",
            stock=35,
            weight="550 г",
            created_at=rand_dt(72),
        ),
        Product(
            name="PlayStation 5 Slim Digital",
            price=18999.00,
            img="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
            images=["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400"],
            category="Ігрові приставки",
            stock=8,
            weight="3200 г",
            created_at=rand_dt(50),
        ),
        Product(
            name="DJI Osmo Action 4",
            price=13999.00,
            img="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
            images=["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400"],
            category="Фото та відео",
            stock=12,
            weight="145 г",
            created_at=rand_dt(62),
        ),
        Product(
            name="TP-Link Archer AX55",
            price=2499.00,
            img="https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400",
            images=["https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400"],
            category="Мережеве обладнання",
            stock=50,
            weight="560 г",
            created_at=rand_dt(78),
        ),
        Product(
            name="Anker PowerCore 20000mAh",
            price=1599.00,
            img="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
            images=["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400"],
            category="Аксесуари",
            stock=55,
            weight="343 г",
            created_at=rand_dt(68),
        ),
    ]
    db.add_all(products)
    db.flush()
    print(f"Seeded {len(products)} products.")

    # Build product lookup by name for order items
    product_lookup = {p.name: p for p in products}
    product_names = list(product_lookup.keys())

    # ── Promo Codes ───────────────────────────────────────────────────
    promo_codes = [
        PromoCode(
            code="WELCOME10",
            discount_percent=10,
            min_order=0,
            is_active=True,
        ),
        PromoCode(
            code="TECH50",
            discount_amount=50,
            min_order=500,
            is_active=True,
        ),
        PromoCode(
            code="SUMMER20",
            discount_percent=20,
            min_order=300,
            is_active=True,
            expires_at=now + timedelta(days=90),
        ),
        PromoCode(
            code="EXPIRED",
            discount_percent=15,
            is_active=True,
            expires_at=now - timedelta(days=30),
        ),
        PromoCode(
            code="MAXED",
            discount_amount=10,
            max_uses=5,
            used_count=5,
            is_active=True,
        ),
    ]
    db.add_all(promo_codes)
    db.flush()
    print(f"Seeded {len(promo_codes)} promo codes.")

    # ── Orders (30 orders with items) ─────────────────────────────────
    # Customer references (indices 4..14 are customers)
    customers = users[4:]  # 11 customers

    cities_addresses = [
        ("Львів", "вул. Франка, 15"),
        ("Львів", "вул. Шевченка, 28"),
        ("Київ", "вул. Хрещатик, 1"),
        ("Київ", "пр. Перемоги, 50"),
        ("Київ", "вул. Саксаганського, 73"),
        ("Одеса", "вул. Дерибасівська, 12"),
        ("Одеса", "пр. Шевченка, 4"),
        ("Харків", "вул. Сумська, 45"),
        ("Харків", "пр. Науки, 14"),
        ("Дніпро", "вул. Яворницького, 66"),
        ("Дніпро", "пр. Гагаріна, 100"),
        ("Запоріжжя", "пр. Соборний, 33"),
        ("Запоріжжя", "вул. Металургів, 19"),
    ]

    comments_pool = [
        None,
        None,
        None,
        None,
        None,
        "Будь ласка, зателефонуйте перед доставкою",
        "Залиште біля дверей",
        "Доставити після 18:00",
        "Подзвоніть за 30 хвилин до доставки",
        "Скасовано за бажанням клієнта",
        "Потрібен чек",
        "Обережно, крихкий товар",
        "Доставка у вихідний день",
    ]

    payment_methods = ["card", "cash"]
    delivery_methods = ["courier", "pickup", "delivery"]

    status_weights = [
        (OrderStatus.delivered, 10),
        (OrderStatus.shipped, 4),
        (OrderStatus.processing, 5),
        (OrderStatus.new, 7),
        (OrderStatus.cancelled, 4),
    ]
    statuses_pool = []
    for status, weight in status_weights:
        statuses_pool.extend([status] * weight)

    orders_data = []
    for i in range(30):
        customer = random.choice(customers)
        city, address = random.choice(cities_addresses)
        status = random.choice(statuses_pool)
        payment = random.choice(payment_methods)
        delivery = random.choice(delivery_methods)
        comment = random.choice(comments_pool)
        created = rand_dt(60, 0)

        num_items = random.randint(1, 4)
        chosen_products = random.sample(product_names, num_items)
        items = []
        for pname in chosen_products:
            p = product_lookup[pname]
            qty = random.randint(1, 3)
            items.append({
                "product_name": pname,
                "qty": qty,
                "price": float(p.price),
            })

        name_parts = customer.name.split(" ", 1)
        first_name = name_parts[0]
        surname = name_parts[1] if len(name_parts) > 1 else ""

        orders_data.append({
            "user": customer,
            "status": status,
            "name": first_name,
            "surname": surname,
            "phone": customer.phone,
            "email": customer.email,
            "city": city,
            "address": address,
            "comment": comment,
            "payment_method": payment,
            "delivery_method": delivery,
            "created_at": created,
            "items": items,
        })

    # ── Site Settings (social links) ────────────────────────────────
    social_defaults = [
        SiteSetting(key="social_facebook", value="https://www.facebook.com/techbox.ua"),
        SiteSetting(key="social_instagram", value="https://www.instagram.com/techbox_ua"),
        SiteSetting(key="social_tiktok", value="https://www.tiktok.com/@techbox_ua"),
        SiteSetting(key="social_telegram", value="https://t.me/techbox_ua"),
    ]
    db.add_all(social_defaults)
    db.flush()
    print(f"Seeded {len(social_defaults)} site settings.")

    for od in orders_data:
        items_data = od.pop("items")
        user = od.pop("user")
        total = sum(i["price"] * i["qty"] for i in items_data)
        order = Order(user_id=user.id, total=total, **od)
        db.add(order)
        db.flush()
        for item in items_data:
            db.add(OrderItem(order_id=order.id, **item))

    db.commit()
    print(f"Seeded {len(orders_data)} orders.")

    # ── Reviews ───────────────────────────────────────────────────────
    reviews_data = [
        # Apple iPhone 17 256GB White
        (1, 4, "Тарас Шевченко",    5, "Чудовий смартфон! Камера просто вражає, батарея тримає весь день. Дуже задоволений покупкою."),
        (1, 6, "Леся Українка",     4, "Гарний телефон, швидкий і зручний. Трохи дорогий, але якість того варта."),
        (1, 8, "Оксана Петренко",   5, "Краща покупка цього року! Все бездоганно."),
        # AirPods Pro 2 USB-C
        (2, 5, "Test User",         5, "Звук неймовірний, шумозаглушення працює відмінно. Дуже комфортно носити."),
        (2, 7, "Іван Франко",       4, "Гарні навушники, але ціна висока. Якість звуку на висоті."),
        (2, 9, "Андрій Коваленко",  5, "Ідеальні навушники для роботи у відкритому офісі. Шумозаглушення 10/10."),
        # MacBook Air 13 M4 Midnight
        (3, 6, "Леся Українка",     5, "Неймовірно швидкий і легкий. Батарея тримає весь робочий день без підзарядки."),
        (3, 8, "Оксана Петренко",   5, "Найкращий ноутбук, яким я користувалась. M4 — це щось неймовірне."),
        (3, 10, "Марія Бондаренко", 4, "Дуже хороший ноутбук. Єдиний мінус — лише 2 порти USB-C."),
        # Apple Watch SE 2
        (4, 5, "Test User",         4, "Зручний годинник, відстежує активність добре. Батарея заряджається досить швидко."),
        (4, 7, "Іван Франко",       5, "Відмінний смарт-годинник для своєї ціни. Рекомендую!"),
        # AirPods Max
        (5, 9, "Андрій Коваленко",  5, "Преміальне звучання. Ці навушники — інший рівень порівняно з усіма іншими."),
        (5, 11, "Дмитро Ткаченко",  4, "Звук чудовий, але важкуваті для тривалого носіння."),
        # iPhone 17 Pro Max Cosmic Orange
        (6, 4, "Тарас Шевченко",    5, "Флагман у всіх сенсах. Titanium корпус відчувається преміально. Камера — шедевр."),
        (6, 12, "Наталія Шевчук",   5, "Купила чоловікові в подарунок, він у захваті! Кольір Cosmic Orange — просто вогонь."),
        # AirPods Pro 3
        (7, 5, "Test User",         5, "Ще краще за попередні! Адаптивний звук — просто магія."),
        (7, 13, "Олександр Мельник", 4, "Хороші навушники, але різниця з Pro 2 не така велика. Все одно рекомендую."),
        # iPad Air M3
        (8, 6, "Леся Українка",     5, "Ідеальний планшет для навчання. Дисплей яскравий, Apple Pencil підтримує."),
        (8, 10, "Марія Бондаренко", 4, "Дуже хороший планшет, але хотілося б більше ОЗП."),
        # iPhone 17 Air Light Gold
        (9, 8, "Оксана Петренко",   5, "Неймовірно тонкий! Найлегший iPhone, що я тримала в руках. Колір Light Gold — розкіш."),
        (9, 14, "Юлія Кравченко",   5, "Просто закохана в цей телефон. Тонкий, легкий, гарний."),
        # Apple Watch Series 10
        (10, 11, "Дмитро Ткаченко", 5, "Великий екран і зручний інтерфейс. Відстеження сну дуже точне."),
        (10, 13, "Олександр Мельник", 4, "Хороший годинник, але хочеться довшої батареї."),
        # Apple AirPods 4 ANC
        (11, 14, "Юлія Кравченко",  5, "За такою ціною — це просто неймовірно. ANC працює чудово."),
        (11, 12, "Наталія Шевчук",  4, "Добре сидять у вухах, звук якісний. Задоволена покупкою."),
        # MacBook Air 13 Sky Blue
        (12, 4, "Тарас Шевченко",   5, "Колір Sky Blue — просто мрія. Продуктивність вражає. Рекомендую всім!"),
        (12, 7, "Іван Франко",      4, "Хороший ноутбук, легкий і потужний. Ідеальний для роботи в дорозі."),
        # MacBook Air 15 Midnight
        (13, 9, "Андрій Коваленко", 5, "Великий екран і при цьому ноутбук залишається легким. Батарея — взагалі топ."),
        (13, 11, "Дмитро Ткаченко", 5, "Замінив старий MacBook Pro — і не шкодую. M4 тягне все."),
        # iPhone 17 Pro Deep Blue
        (14, 12, "Наталія Шевчук",  5, "Deep Blue — шикарний колір. Titanium корпус і потужна камера — це дуже крутий телефон."),
        (14, 14, "Юлія Кравченко",  4, "Чудовий телефон, але хотілося б більшу батарею."),
        # Apple Watch Ultra 2
        (15, 4, "Тарас Шевченко",   5, "Куплено для гірського туризму. GPS точний, батарея тримає 3 дні. Ідеал!"),
        (15, 9, "Андрій Коваленко", 5, "Найкращий годинник для спорту. Titanium корпус і величезний екран — клас."),
        # iPad 11 Silver
        (16, 6, "Леся Українка",    4, "Хороший базовий iPad. Для навчання і розваг — саме те."),
        (16, 13, "Олександр Мельник", 5, "Купив дитині — дуже задоволені. Швидко працює, дисплей яскравий."),
        # iPad 11 Blue
        (17, 8, "Оксана Петренко",  5, "Гарний колір і відмінна продуктивність. Ідеальний для малювання з Apple Pencil."),
        # Apple AirPods 4
        (18, 5, "Test User",        4, "Хороші бюджетні навушники Apple. Звук набагато кращий за AirPods 2 за ту ж ціну."),
        (18, 14, "Юлія Кравченко",  5, "Відмінна покупка! Дуже комфортні і звучать чудово."),
        # iPhone 17 Pro Max 512 Deep Blue
        (19, 7, "Іван Франко",      5, "Максимальна версія — максимальне задоволення. 512GB — більше ніж достатньо."),
        (19, 10, "Марія Бондаренко", 4, "Дорогий, але варто кожної гривні. Камера на рівні профі."),
        # iPhone 17 Air Space Black
        (20, 11, "Дмитро Ткаченко", 5, "Space Black виглядає преміально. Телефон дуже легкий, майже не відчуваєш у кишені."),
        (20, 12, "Наталія Шевчук",  4, "Гарний телефон, але хотілося б кращу основну камеру."),
        # JBL Flip 6
        (21, 5, "Test User",        5, "Гучна і якісна колонка. Водозахист перевірений на пляжі — все ок!"),
        (21, 13, "Олександр Мельник", 4, "Хороший звук для такого розміру. Рекомендую для вечірок на природі."),
        # PlayStation 5 Slim Digital
        (22, 4, "Тарас Шевченко",   5, "Нарешті взяв PS5! Ігри виглядають неймовірно в 4K. Sony молодці."),
        (22, 9, "Андрій Коваленко", 5, "Slim компактніший, тихіший. Дуже задоволений."),
        # DJI Osmo Action 4
        (23, 7, "Іван Франко",      5, "Знімає в 4K/120fps приголомшливо. Стабілізація відео — просто клас!"),
        (23, 6, "Леся Українка",    4, "Хороша камера для активного відпочинку. Трохи складне меню."),
        # TP-Link Archer AX55
        (24, 8, "Оксана Петренко",  4, "Wi-Fi 6 значно покращив швидкість інтернету вдома. Налаштування просте."),
        (24, 10, "Марія Бондаренко", 5, "Покриття по всій квартирі без мертвих зон. Рекомендую!"),
        # Anker PowerCore 20000
        (25, 11, "Дмитро Ткаченко", 5, "Заряджає телефон 4-5 разів. Для подорожей — незамінна річ."),
        (25, 14, "Юлія Кравченко",  4, "Хороший повербанк, але трохи важкий. Ємність виправдовує вагу."),
    ]

    # user_id lookup by name
    user_by_name = {u.name: u for u in users}
    # product index map (seed products are 1-based by insertion order)
    product_list = products  # already ordered

    review_count = 0
    seen = set()  # (product_idx, user_id) to avoid duplicates
    for product_idx, customer_idx, _uname, rating, comment in reviews_data:
        p = product_list[product_idx - 1]
        u = customers[customer_idx - 4]  # customers start at index 4 in users list
        key = (p.id, u.id)
        if key in seen:
            continue
        seen.add(key)
        db.add(ProductReview(
            product_id=p.id,
            user_id=u.id,
            rating=rating,
            comment=comment,
            created_at=rand_dt(45),
        ))
        review_count += 1

    db.commit()
    print(f"Seeded {review_count} reviews.")

    db.close()
    print(f"\nDone! Seed completed successfully.")
    print(f"  Users: {len(users)} (1 superadmin, 1 admin, 1 manager, 1 warehouse, 11 customers)")
    print(f"  Products: {len(products)}")
    print(f"  Promo Codes: {len(promo_codes)}")
    print(f"  Orders: {len(orders_data)}")
    print(f"  Reviews: {review_count}")
    print(f"  Site Settings: {len(social_defaults)}")


if __name__ == "__main__":
    seed()
