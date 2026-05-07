import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import styles from './HomeGrid.module.css';

interface Props {
  products: Product[];
}

export default function HomeGrid({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Популярні <span>товари</span></h2>
          <Link to="/catalog" className={styles.moreLink}>
            Весь каталог <FaArrowRight />
          </Link>
        </div>
        <div className={styles.grid}>
          {products.map((p, i) => (
            <ProductCard key={p.id ?? i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
