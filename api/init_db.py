"""Create all tables and seed initial data."""

from app.database import Base, engine, SessionLocal
from app.models import Product, User, UserRole
from app.auth import hash_password


def init():
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()
    try:
        if db.query(User).first():
            print("Database already seeded, skipping.")
            return

        # --- Users ---
        superadmin = User(
            name="Власник TechBox",
            email="superadmin@techbox.com",
            phone="+380971234500",
            password_hash=hash_password("superadmin@techbox.com"),
            role=UserRole.superadmin,
        )
        admin = User(
            name="Адмін",
            email="admin@techbox.com",
            phone="+380971234567",
            password_hash=hash_password("admin@techbox.com"),
            role=UserRole.admin,
        )
        manager = User(
            name="Менеджер",
            email="manager@techbox.com",
            phone="+380971234568",
            password_hash=hash_password("manager@techbox.com"),
            role=UserRole.manager,
        )
        warehouse = User(
            name="Сергій Комірник",
            email="warehouse@techbox.com",
            phone="+380971234569",
            password_hash=hash_password("warehouse@techbox.com"),
            role=UserRole.warehouse,
        )
        customer = User(
            name="Олена Коваленко",
            email="olena@test.com",
            phone="+380671234567",
            password_hash=hash_password("olena@test.com"),
            role=UserRole.customer,
        )
        db.add_all([superadmin, admin, manager, warehouse, customer])
        db.flush()
        print(f"Users created: superadmin, admin, manager, warehouse, customer")

        # --- Products ---
        products_data = [
            {"name": "iPhone 15 128GB Black", "price": 38999.00, "old_price": 44999.00, "img": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", "badge": "sale", "category": "Смартфони", "stock": 25},
            {"name": "JBL Tune 520BT", "price": 1799.00, "old_price": 2299.00, "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "badge": "sale", "category": "Навушники", "stock": 40},
            {"name": "Xiaomi Redmi Note 13 8/256GB", "price": 8499.00, "old_price": 9999.00, "img": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400", "badge": "sale", "category": "Смартфони", "stock": 60},
            {"name": "Logitech MX Keys Mini", "price": 3299.00, "old_price": 3999.00, "img": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", "badge": "sale", "category": "Аксесуари", "stock": 30},
            {"name": "TP-Link Archer AX55", "price": 2499.00, "old_price": 2999.00, "img": "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400", "badge": "sale", "category": "Мережеве обладнання", "stock": 50},
            {"name": "Samsung Galaxy Watch 6 44mm", "price": 9499.00, "img": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400", "badge": "new", "category": "Смарт-годинники", "stock": 20},
            {"name": "Apple AirPods Pro 2", "price": 9999.00, "img": "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400", "badge": "new", "category": "Навушники", "stock": 35},
            {"name": "Lenovo Tab M11 128GB", "price": 7999.00, "img": "https://images.unsplash.com/photo-1561154464-82e2d8736bee?w=400", "badge": "new", "category": "Планшети", "stock": 15},
            {"name": "Marshall Stanmore III", "price": 12999.00, "img": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "badge": "new", "category": "Акустика", "stock": 10},
            {"name": "GoPro HERO12 Black", "price": 16499.00, "img": "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400", "badge": "new", "category": "Фото та відео", "stock": 18},
            {"name": "Nintendo Switch OLED", "price": 13999.00, "img": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400", "badge": "new", "category": "Ігрові приставки", "stock": 22},
            {"name": 'MacBook Air M2 13" 256GB', "price": 44999.00, "img": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "category": "Ноутбуки", "stock": 12},
            {"name": "Samsung Galaxy A55 5G 8/128GB", "price": 13499.00, "img": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400", "category": "Смартфони", "stock": 45},
            {"name": "Sony WH-1000XM5", "price": 11999.00, "img": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", "category": "Навушники", "stock": 30},
            {"name": "iPad 10 64GB Wi-Fi", "price": 16999.00, "img": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "category": "Планшети", "stock": 20},
            {"name": "ASUS VivoBook 15 OLED", "price": 18999.00, "img": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400", "category": "Ноутбуки", "stock": 14},
            {"name": "Xiaomi Band 8", "price": 1299.00, "img": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400", "category": "Смарт-годинники", "stock": 80},
            {"name": "JBL Flip 6", "price": 3499.00, "img": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", "category": "Акустика", "stock": 35},
            {"name": "PlayStation 5 Slim Digital", "price": 18999.00, "img": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", "category": "Ігрові приставки", "stock": 8},
            {"name": "Anker PowerCore 20000mAh", "price": 1599.00, "img": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "category": "Аксесуари", "stock": 55},
            {"name": "DJI Osmo Action 4", "price": 13999.00, "img": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400", "category": "Фото та відео", "stock": 12},
            {"name": "Google Pixel Watch 2", "price": 12499.00, "img": "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400", "category": "Смарт-годинники", "stock": 15},
        ]
        for p in products_data:
            db.add(Product(**p))
        print(f"Products created: {len(products_data)}")

        db.commit()
        print("Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    init()
