import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus, FaCheck } from 'react-icons/fa';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

export function loadSavedProducts(): number[] {
  try { return JSON.parse(localStorage.getItem('savedProducts') || '[]'); }
  catch { return []; }
}

export function toggleSavedProduct(id: number): number[] {
  const prev = loadSavedProducts();
  const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
  localStorage.setItem('savedProducts', JSON.stringify(next));
  return next;
}

interface Props {
  product: Product;
  productIndex?: number;
}

export default function ProductCard({ product, productIndex }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const linkId = product.id ?? productIndex;
  const imgEl = <img className={styles.img} src={product.img} alt={product.name} loading="lazy" />;
  const nameEl = <div className={styles.name}>{product.name}</div>;

  return (
    <div className={styles.card}>
      <div className={styles.imgWrap}>
        {linkId != null ? (
          <Link to={`/product/${linkId}`}>{imgEl}</Link>
        ) : imgEl}
        <button
          className={`${styles.btn} ${added ? styles.btnAdded : ''}`}
          onClick={handleAdd}
          title="Додати у кошик"
        >
          {added ? <FaCheck /> : <FaCartPlus />}
        </button>
      </div>
      <div className={styles.info}>
        {linkId != null ? (
          <Link to={`/product/${linkId}`} className={styles.nameLink}>{nameEl}</Link>
        ) : nameEl}
        {product.avgRating != null && (
          <div className={styles.rating}>
            <span className={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: s <= Math.round(product.avgRating!) ? '#f59e0b' : 'var(--border)' }}>★</span>
              ))}
            </span>
            <span className={styles.ratingValue}>{product.avgRating.toFixed(1)}</span>
            {!!product.reviewCount && <span className={styles.ratingCount}>({product.reviewCount})</span>}
          </div>
        )}
        <div className={styles.price}>
          <span className={styles.current}>{product.price} ₴</span>
          {product.oldPrice && <span className={styles.old}>{product.oldPrice} ₴</span>}
        </div>
      </div>
    </div>
  );
}
