import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { categories, catImages } from '../data/products';
import styles from './HeroSlider.module.css';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = categories.length;

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, total]);

  const go = (idx: number) => setCurrent(((idx % total) + total) % total);

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {categories.map((cat, i) => (
        <Link
          key={cat}
          to={`/catalog?cat=${encodeURIComponent(cat)}`}
          className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}
        >
          <div className={styles.glow} />
          <div className="container">
            <div className={styles.content}>
              <div className={styles.text}>
                <h2 className={styles.headline}>{cat}</h2>
              </div>
              <div className={styles.imgCol}>
                <img className={styles.img} src={catImages[cat]} alt={cat} />
              </div>
            </div>
          </div>
        </Link>
      ))}

      <button className={styles.arrowLeft} onClick={e => { stopProp(e); go(current - 1); }} aria-label="Назад">
        <FaChevronLeft />
      </button>
      <button className={styles.arrowRight} onClick={e => { stopProp(e); go(current + 1); }} aria-label="Вперед">
        <FaChevronRight />
      </button>

      <div className={styles.dots} onClick={stopProp}>
        {categories.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={e => { stopProp(e); go(i); }}
            aria-label={categories[i]}
          />
        ))}
      </div>
    </section>
  );
}
