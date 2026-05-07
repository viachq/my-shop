import { Link } from 'react-router-dom';
import { categories } from '../data/products';
import styles from './CategoryGrid.module.css';

const catImages: Record<string, string> = {
  'Смартфони': 'https://img.jabko.ua/image/cache/home_cats/20-11-2025/android-newfull.png.webp',
  'Ноутбуки': 'https://img.jabko.ua/image/cache/catalog/products/2025/03/051703/skyblue_1-300x300.jpg.webp',
  'Планшети': 'https://img.jabko.ua/image/cache/home_cats/may2025/big-2025-iphonefull.png.webp',
  'Навушники': 'https://img.jabko.ua/image/cache/home_cats/may2025/big-center-airpods-2025full.png.webp',
  'Смарт-годинники': 'https://img.jabko.ua/image/cache/home_cats/may2025/watch-2025-newfull.png.webp',
  'Аксесуари': 'https://img.jabko.ua/image/cache/home_cats/20-11-2025/aca-s-1full.png.webp',
  'Акустика': 'https://img.jabko.ua/image/cache/home_cats/20-11-2025/Marshallfull.jpeg.webp',
  'Ігрові приставки': 'https://img.jabko.ua/image/cache/home_cats/may2025/big-ps5full.png.webp',
  'Фото та відео': 'https://img.jabko.ua/image/cache/home_cats/may2025/big-kitchenfull.png.webp',
  'Мережеве обладнання': 'https://img.jabko.ua/image/cache/home_cats/20-11-2025/loggi-gaeme-setfull.png.webp',
};

export default function CategoryGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.track}>
          {categories.map(cat => (
            <Link
              to={`/catalog?cat=${encodeURIComponent(cat)}`}
              key={cat}
              className={styles.tile}
            >
              <img
                src={catImages[cat] || ''}
                alt={cat}
                className={styles.img}
                loading="lazy"
              />
              <span className={styles.name}>{cat}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
