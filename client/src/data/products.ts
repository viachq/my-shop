export interface Product {
  id?: number;
  name: string;
  price: string;
  oldPrice?: string;
  img: string;
  images?: string[];
  badge?: 'sale' | 'new';
  category?: string;
  weight?: string;
  avgRating?: number;
  reviewCount?: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: number | string;
  old_price: number | string | null;
  img: string | null;
  images: string[];
  badge: string | null;
  category: string;
  stock: number;
  weight: string | null;
  created_at: string;
  avg_rating?: number | null;
  review_count?: number;
}

export function apiToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: parseFloat(String(p.price)).toFixed(2),
    oldPrice: p.old_price != null ? parseFloat(String(p.old_price)).toFixed(2) : undefined,
    img: p.img || '',
    images: p.images?.length ? p.images : undefined,
    badge: p.badge === 'sale' || p.badge === 'new' ? p.badge : undefined,
    category: p.category,
    weight: p.weight || undefined,
    avgRating: p.avg_rating ?? undefined,
    reviewCount: p.review_count ?? 0,
  };
}

export const saleProducts: Product[] = [
  { name: 'Apple iPhone 17 256GB White', price: '41699.00', oldPrice: '49699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/092239/vfgr-300x300.png.webp', badge: 'sale', category: 'Смартфони', weight: '171 г' },
  { name: 'AirPods Pro 2 USB-C (2023)', price: '8799.00', oldPrice: '10999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/09/072342/MQD83%20(1)-300x300.jpg.webp', badge: 'sale', category: 'Навушники', weight: '50 г' },
  { name: 'MacBook Air 13 M4 Midnight 256GB', price: '50599.00', oldPrice: '51949.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051707/midnight-1-300x300.png.webp', badge: 'sale', category: 'Ноутбуки', weight: '1240 г' },
  { name: 'Apple Watch SE 2 GPS 40mm Starlight', price: '9499.00', oldPrice: '10599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/10/161233/12rgfed-300x300.jpeg.webp', badge: 'sale', category: 'Смарт-годинники', weight: '33 г' },
  { name: 'AirPods Max USB-C 2024 Starlight', price: '23799.00', oldPrice: '27999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/092318/2-(1)-(1)-300x300.jpg.webp', badge: 'sale', category: 'Навушники', weight: '384 г' },
];

export const newProducts: Product[] = [
  { name: 'Apple iPhone 17 Pro Max 256GB Cosmic Orange', price: '66699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101332/CosmicOrange-300x300.png.webp', badge: 'new', category: 'Смартфони', weight: '227 г' },
  { name: 'AirPods Pro 3 (2025)', price: '10999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/092358/vbfbg-300x300.png.webp', badge: 'new', category: 'Навушники', weight: '50 г' },
  { name: 'Apple iPad Air 11 M3 128GB Space Gray', price: '26699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/05/081358/Apple_Air_11_Space_Gray-1-300x300.jpg.webp', badge: 'new', category: 'Планшети', weight: '462 г' },
  { name: 'Apple iPhone 17 Air 512GB Light Gold', price: '53399.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101015/Light%20Gold-(1)-300x300.png.webp', badge: 'new', category: 'Смартфони', weight: '155 г' },
  { name: 'Apple Watch Series 10 GPS 46mm Jet Black', price: '16499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/100858/watch1-300x300.jpg.webp', badge: 'new', category: 'Смарт-годинники', weight: '36 г' },
  { name: 'Apple AirPods 4 with ANC', price: '7599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/10/221710/derf-300x300.png.webp', badge: 'new', category: 'Навушники', weight: '44 г' },
];

export const topProducts: Product[] = [
  { name: 'MacBook Air 13 M4 Sky Blue 256GB', price: '50599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp', category: 'Ноутбуки', weight: '1240 г' },
  { name: 'Apple iPhone 17 Pro 256GB Deep Blue', price: '62999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp', category: 'Смартфони', weight: '199 г' },
  { name: 'Apple Watch Ultra 2 49mm Black Titanium', price: '29799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp', category: 'Смарт-годинники', weight: '61 г' },
  { name: 'Apple iPad 11 128GB Wi-Fi Silver', price: '16999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp', category: 'Планшети', weight: '477 г' },
];

export const catalogProducts: Product[] = [
  ...saleProducts,
  ...newProducts,
  { name: 'MacBook Air 13 M4 Sky Blue 256GB', price: '50599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp', category: 'Ноутбуки', weight: '1240 г' },
  { name: 'MacBook Air 15 M4 Midnight 256GB', price: '55499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051702/Midnight-m4-300x300.jpg.webp', category: 'Ноутбуки', weight: '1510 г' },
  { name: 'Apple iPhone 17 Pro 256GB Deep Blue', price: '62999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp', category: 'Смартфони', weight: '199 г' },
  { name: 'Apple Watch Ultra 2 49mm Black Titanium', price: '29799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp', category: 'Смарт-годинники', weight: '61 г' },
  { name: 'Apple iPad 11 128GB Wi-Fi Silver', price: '16999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp', category: 'Планшети', weight: '477 г' },
  { name: 'Apple iPad 11 128GB Wi-Fi Blue', price: '16699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/041822/blue1-(1)-300x300.png.webp', category: 'Планшети', weight: '477 г' },
  { name: 'Apple AirPods 4 (2024)', price: '5599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/10/221711/derf-300x300.png.webp', category: 'Навушники', weight: '40 г' },
  { name: 'Apple iPhone 17 Pro Max 512GB Deep Blue', price: '77799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101329/deepBlue-(4)-300x300.png.webp', category: 'Смартфони', weight: '227 г' },
  { name: 'Apple iPhone 17 Air 256GB Space Black', price: '42399.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101014/Space%20Black-300x300.png.webp', category: 'Смартфони', weight: '155 г' },
  { name: 'JBL Flip 6', price: '3499.00', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'Акустика', weight: '550 г' },
  { name: 'PlayStation 5 Slim Digital', price: '18999.00', img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', category: 'Ігрові приставки', weight: '3200 г' },
  { name: 'DJI Osmo Action 4', price: '13999.00', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', category: 'Фото та відео', weight: '145 г' },
  { name: 'TP-Link Archer AX55', price: '2499.00', img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400', category: 'Мережеве обладнання', weight: '560 г' },
  { name: 'Anker PowerCore 20000mAh', price: '1599.00', img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', category: 'Аксесуари', weight: '343 г' },
];

export const slides = [
  { bg: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400', title: 'Широкий асортимент', text: 'Смартфони, ноутбуки, гаджети та аксесуари від провідних брендів.', btn: 'Дивитись каталог', link: '/catalog' },
  { bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400', title: 'Найкращі ціни', text: 'Спеціальні пропозиції для бізнесу та оптових покупців. Телефонуйте!', btn: "Зв'язатись з нами", link: 'tel:+380972742028' },
  { bg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400', title: 'Про нашу компанію', text: 'TechBox — надійний партнер у світі технологій. Гарантія та сервіс на всі товари.', btn: 'Дізнатись більше', link: '/about' },
];

export const categories = [
  'Смартфони', 'Ноутбуки', 'Планшети', 'Навушники',
  'Смарт-годинники', 'Аксесуари', 'Акустика', 'Ігрові приставки',
  'Фото та відео', 'Мережеве обладнання',
];
