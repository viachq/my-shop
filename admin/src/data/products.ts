export interface Product {
  name: string;
  price: string;
  oldPrice?: string;
  img: string;
  badge?: 'sale' | 'new';
  category?: string;
}

export const saleProducts: Product[] = [
  { name: 'iPhone 15 128GB Black', price: '38999.00', oldPrice: '44999.00', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', badge: 'sale', category: 'Смартфони' },
  { name: 'JBL Tune 520BT', price: '1799.00', oldPrice: '2299.00', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', badge: 'sale', category: 'Навушники' },
  { name: 'Xiaomi Redmi Note 13 8/256GB', price: '8499.00', oldPrice: '9999.00', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', badge: 'sale', category: 'Смартфони' },
  { name: 'Logitech MX Keys Mini', price: '3299.00', oldPrice: '3999.00', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', badge: 'sale', category: 'Аксесуари' },
  { name: 'TP-Link Archer AX55', price: '2499.00', oldPrice: '2999.00', img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400', badge: 'sale', category: 'Мережеве обладнання' },
];

export const newProducts: Product[] = [
  { name: 'Samsung Galaxy Watch 6 44mm', price: '9499.00', img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400', badge: 'new', category: 'Смарт-годинники' },
  { name: 'Apple AirPods Pro 2', price: '9999.00', img: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400', badge: 'new', category: 'Навушники' },
  { name: 'Lenovo Tab M11 128GB', price: '7999.00', img: 'https://images.unsplash.com/photo-1561154464-82e2d8736bee?w=400', badge: 'new', category: 'Планшети' },
  { name: 'Marshall Stanmore III', price: '12999.00', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', badge: 'new', category: 'Акустика' },
  { name: 'GoPro HERO12 Black', price: '16499.00', img: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400', badge: 'new', category: 'Фото та відео' },
  { name: 'Nintendo Switch OLED', price: '13999.00', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', badge: 'new', category: 'Ігрові приставки' },
];

export const topProducts: Product[] = [
  { name: 'MacBook Air M2 13" 256GB', price: '44999.00', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'Ноутбуки' },
  { name: 'Samsung Galaxy A55 5G 8/128GB', price: '13499.00', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'Смартфони' },
  { name: 'Sony WH-1000XM5', price: '11999.00', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Навушники' },
  { name: 'iPad 10 64GB Wi-Fi', price: '16999.00', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'Планшети' },
];

export const catalogProducts: Product[] = [
  ...saleProducts,
  ...newProducts,
  { name: 'MacBook Air M2 13" 256GB', price: '44999.00', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'Ноутбуки' },
  { name: 'ASUS VivoBook 15 OLED', price: '18999.00', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', category: 'Ноутбуки' },
  { name: 'Samsung Galaxy A55 5G 8/128GB', price: '13499.00', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'Смартфони' },
  { name: 'Sony WH-1000XM5', price: '11999.00', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Навушники' },
  { name: 'iPad 10 64GB Wi-Fi', price: '16999.00', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'Планшети' },
  { name: 'Samsung Galaxy Tab A9 64GB', price: '5499.00', img: 'https://images.unsplash.com/photo-1561154464-82e2d8736bee?w=400', category: 'Планшети' },
  { name: 'Xiaomi Band 8', price: '1299.00', img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', category: 'Смарт-годинники' },
  { name: 'JBL Flip 6', price: '3499.00', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'Акустика' },
  { name: 'Anker PowerCore 20000mAh', price: '1599.00', img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', category: 'Аксесуари' },
  { name: 'PlayStation 5 Slim Digital', price: '18999.00', img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', category: 'Ігрові приставки' },
  { name: 'DJI Osmo Action 4', price: '13999.00', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', category: 'Фото та відео' },
  { name: 'Xbox Wireless Controller', price: '2499.00', img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400', category: 'Ігрові приставки' },
  { name: 'Baseus USB-C Hub 7-in-1', price: '1199.00', img: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400', category: 'Мережеве обладнання' },
  { name: 'Google Pixel Watch 2', price: '12499.00', img: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400', category: 'Смарт-годинники' },
];

export const slides = [
  { bg: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400', title: 'Широкий асортимент', text: 'Смартфони, ноутбуки, гаджети та аксесуари від провідних брендів.', btn: 'Дивитись каталог' },
  { bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400', title: 'Найкращі ціни', text: 'Спеціальні пропозиції для бізнесу та оптових покупців.', btn: "Зв'язатись з нами" },
  { bg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400', title: 'Про нашу компанію', text: 'TechBox — надійний партнер у світі технологій. Гарантія та сервіс на всі товари.', btn: 'Дізнатись більше' },
];

export const categories = [
  'Смартфони', 'Ноутбуки', 'Планшети', 'Навушники',
  'Смарт-годинники', 'Аксесуари', 'Акустика', 'Ігрові приставки',
  'Фото та відео', 'Мережеве обладнання',
];
