import { Link } from 'react-router-dom';
import { categories, catImages } from '../data/products';
import styles from './CategoryGrid.module.css';

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
