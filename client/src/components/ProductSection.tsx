import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import styles from './ProductSection.module.css';

interface Props {
  title: string;
  titleAccent?: string;
  products: Product[];
  linkText: string;
  linkHref?: string;
  bg?: 'gray';
}

export default function ProductSection({ title, titleAccent, products, linkText, linkHref = '/catalog', bg }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  function scroll(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`.${styles.cardSlot}`);
    const step = card ? card.offsetWidth + 14 : 260;
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }

  return (
    <section className={`${styles.section} ${bg === 'gray' ? styles.bgGray : ''}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            {title} {titleAccent && <span>{titleAccent}</span>}
          </h2>
          <Link to={linkHref} className={styles.moreLink}>
            {linkText} <FaArrowRight />
          </Link>
        </div>
        <div className={styles.wrapper}>
          {canLeft && (
            <button className={styles.arrowLeft} onClick={() => scroll(-1)}>
              <FaChevronLeft />
            </button>
          )}
          <div className={styles.track} ref={trackRef}>
            {products.map((p, i) => (
              <div key={p.id ?? i} className={styles.cardSlot}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {canRight && (
            <button className={styles.arrowRight} onClick={() => scroll(1)}>
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
