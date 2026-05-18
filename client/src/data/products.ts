export interface Product {
  id?: number;
  name: string;
  price: string;
  oldPrice?: string;
  img: string;
  badge?: 'sale' | 'new';
  category?: string;
  avgRating?: number;
  reviewCount?: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: number | string;
  old_price: number | string | null;
  img: string | null;
  badge: string | null;
  category: string;
  stock: number;
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
    badge: p.badge === 'sale' || p.badge === 'new' ? p.badge : undefined,
    category: p.category,
    avgRating: p.avg_rating ?? undefined,
    reviewCount: p.review_count ?? 0,
  };
}

export const saleProducts: Product[] = [
  { name: 'Apple iPhone 17 256GB White', price: '41699.00', oldPrice: '49699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/092239/vfgr-300x300.png.webp', badge: 'sale', category: 'Смартфони' },
  { name: 'AirPods Pro 2 USB-C (2023)', price: '8799.00', oldPrice: '10999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/09/072342/MQD83%20(1)-300x300.jpg.webp', badge: 'sale', category: 'Навушники' },
  { name: 'MacBook Air 13 M4 Midnight 256GB', price: '50599.00', oldPrice: '51949.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051707/midnight-1-300x300.png.webp', badge: 'sale', category: 'Ноутбуки' },
  { name: 'Apple Watch SE 2 GPS 40mm Starlight', price: '9499.00', oldPrice: '10599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/10/161233/12rgfed-300x300.jpeg.webp', badge: 'sale', category: 'Смарт-годинники' },
  { name: 'AirPods Max USB-C 2024 Starlight', price: '23799.00', oldPrice: '27999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/092318/2-(1)-(1)-300x300.jpg.webp', badge: 'sale', category: 'Навушники' },
];

export const newProducts: Product[] = [
  { name: 'Apple iPhone 17 Pro Max 256GB Cosmic Orange', price: '66699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101332/CosmicOrange-300x300.png.webp', badge: 'new', category: 'Смартфони' },
  { name: 'AirPods Pro 3 (2025)', price: '10999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/092358/vbfbg-300x300.png.webp', badge: 'new', category: 'Навушники' },
  { name: 'Apple iPad Air 11 M3 128GB Space Gray', price: '26699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/05/081358/Apple_Air_11_Space_Gray-1-300x300.jpg.webp', badge: 'new', category: 'Планшети' },
  { name: 'Apple iPhone 17 Air 512GB Light Gold', price: '53399.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101015/Light%20Gold-(1)-300x300.png.webp', badge: 'new', category: 'Смартфони' },
  { name: 'Apple Watch Series 10 GPS 46mm Jet Black', price: '16499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/100858/watch1-300x300.jpg.webp', badge: 'new', category: 'Смарт-годинники' },
  { name: 'Apple AirPods 4 with ANC', price: '7599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/10/221710/derf-300x300.png.webp', badge: 'new', category: 'Навушники' },
];

export const topProducts: Product[] = [
  { name: 'MacBook Air 13 M4 Sky Blue 256GB', price: '50599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp', category: 'Ноутбуки' },
  { name: 'Apple iPhone 17 Pro 256GB Deep Blue', price: '62999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp', category: 'Смартфони' },
  { name: 'Apple Watch Ultra 2 49mm Black Titanium', price: '29799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp', category: 'Смарт-годинники' },
  { name: 'Apple iPad 11 128GB Wi-Fi Silver', price: '16999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp', category: 'Планшети' },
];

export const catalogProducts: Product[] = [
  ...saleProducts,
  ...newProducts,
  { name: 'MacBook Air 13 M4 Sky Blue 256GB', price: '50599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp', category: 'Ноутбуки' },
  { name: 'MacBook Air 15 M4 Midnight 256GB', price: '55499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051702/Midnight-m4-300x300.jpg.webp', category: 'Ноутбуки' },
  { name: 'Apple iPhone 17 Pro 256GB Deep Blue', price: '62999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/100928/17proDeep_Blue-300x300.png.webp', category: 'Смартфони' },
  { name: 'Apple Watch Ultra 2 49mm Black Titanium', price: '29799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/111318/Ultra2_Black_Titanium-7-300x300.jpg.webp', category: 'Смарт-годинники' },
  { name: 'Apple iPad 11 128GB Wi-Fi Silver', price: '16999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2022/10/181906/ipad-2022-hero-silver-wifi-selec-300x300.jpg.webp', category: 'Планшети' },
  { name: 'Apple iPad 11 128GB Wi-Fi Blue', price: '16699.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/03/041822/blue1-(1)-300x300.png.webp', category: 'Планшети' },
  { name: 'Apple AirPods 4 (2024)', price: '5599.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/10/221711/derf-300x300.png.webp', category: 'Навушники' },
  { name: 'Apple iPhone 17 Pro Max 512GB Deep Blue', price: '77799.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101329/deepBlue-(4)-300x300.png.webp', category: 'Смартфони' },
  { name: 'Apple iPhone 17 Air 256GB Space Black', price: '42399.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/09/101014/Space%20Black-300x300.png.webp', category: 'Смартфони' },
  { name: 'JBL Flip 7 Black', price: '3499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/04/301109/JBLFLIP7BLK8.png-300x300.jpg.webp', category: 'Акустика' },
  { name: 'PlayStation 5 Slim Digital', price: '18999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/02/271645/ps5slim%20(1)-300x300.jpg.webp', category: 'Ігрові приставки' },
  { name: 'GoPro Hero 13 Black', price: '13999.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2024/09/231017/Untitled-300x300.png.webp', category: 'Фото та відео' },
  { name: 'Apple MagSafe Battery Pack', price: '5499.00', img: 'https://img.jabko.ua/image/cache/catalog/products/2025/11/021453/aecd-300x300.jpg.webp', category: 'Аксесуари' },
];

export const slides = [
  { bg: 'https://img.jabko.ua/image/cache/new-cataloge-2023/17-pmfull.jpeg.webp', title: 'Широкий асортимент', text: 'Смартфони, ноутбуки, гаджети та аксесуари від провідних брендів.', btn: 'Дивитись каталог', link: '/catalog' },
  { bg: 'https://img.jabko.ua/image/cache/new-cataloge-2023/gaaamingfull.jpeg.webp', title: 'Найкращі ціни', text: 'Спеціальні пропозиції для бізнесу та оптових покупців. Телефонуйте!', btn: "Зв'язатись з нами", link: 'tel:+380972742028' },
  { bg: 'https://img.jabko.ua/image/cache/home_cats/may2025/big-center-airpods-2025full.png.webp', title: 'Про нашу компанію', text: 'TechBox — надійний партнер у світі технологій. Гарантія та сервіс на всі товари.', btn: 'Дізнатись більше', link: '/about' },
];

export const categories = [
  'Смартфони', 'Ноутбуки', 'Планшети', 'Навушники',
  'Смарт-годинники', 'Аксесуари', 'Монітори', 'Ігрові приставки',
  'Фото та відео', 'Телевізори',
];

const B = 'https://img.jabko.ua/image/cache/';
export const catImages: Record<string, string> = {
  'Смартфони': B+'home_cats/20-11-2025/android-newfull.png.webp',
  'Ноутбуки': B+'trade-new/mac-trade/mac-air-15-m3-max-240.png.webp',
  'Планшети': B+'0NEW-REPAIR/iPad-repair/ipad-11-2025-max-240.png.webp',
  'Навушники': B+'home_cats/may2025/big-center-airpods-2025full.png.webp',
  'Смарт-годинники': B+'0806-menu-new/watch-s11full.png.webp',
  'Аксесуари': B+'home_cats/20-11-2025/aca-s-1full.png.webp',
  'Монітори': B+'A-MAIN-MENU/monitor-m-menufull.png.webp',
  'Ігрові приставки': B+'home_cats/may2025/big-ps5full.png.webp',
  'Фото та відео': B+'home_cats/20-11-2025/wide-photoofull.png.webp',
  'Телевізори': B+'A-MAIN-MENU/hisense-tv-menufull.png.webp',
};
