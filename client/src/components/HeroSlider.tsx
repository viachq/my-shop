import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { apiToProduct, type Product } from '../data/products';
import styles from './HeroSlider.module.css';

const SLIDES = [
  {
    tag: 'Хіт продажів',
    headline: 'Гаджети\nнового рівня',
    sub: 'Офіційна техніка з гарантією. Доставка по всій Україні вже наступного дня.',
    cta: 'Переглянути акції',
    href: '/catalog?badge=sale',
  },
  {
    tag: 'Новинки 2025',
    headline: 'Будь\nпершим',
    sub: 'Найсвіжіші моделі щойно у продажу — смартфони, ноутбуки та аксесуари.',
    cta: 'Дивитись новинки',
    href: '/catalog',
  },
  {
    tag: 'Ексклюзивна ціна',
    headline: 'Якість, яку\nвідчуєш',
    sub: 'Звук, зображення, потужність — техніка, що перевершує очікування.',
    cta: 'До каталогу',
    href: '/catalog?cat=Навушники',
  },
];

const FALLBACK_BG = '#1d1d1d';

const proxiedUrl = (src: string) =>
  `/api/products/img-proxy?url=${encodeURIComponent(src)}`;

function sampleCornerColor(src: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(FALLBACK_BG);
        ctx.drawImage(img, 0, 0);
        const w = canvas.width, h = canvas.height;
        const samples = [
          ctx.getImageData(2, 2, 1, 1).data,
          ctx.getImageData(w - 3, 2, 1, 1).data,
          ctx.getImageData(2, h - 3, 1, 1).data,
          ctx.getImageData(w - 3, h - 3, 1, 1).data,
        ];
        let r = 0, g = 0, b = 0, a = 0;
        for (const p of samples) { r += p[0]; g += p[1]; b += p[2]; a += p[3]; }
        // If corners are transparent, fall back
        if (a / 4 < 200) return resolve(FALLBACK_BG);
        r = Math.round(r / 4);
        g = Math.round(g / 4);
        b = Math.round(b / 4);
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch {
        resolve(FALLBACK_BG);
      }
    };
    img.onerror = () => resolve(FALLBACK_BG);
    img.src = proxiedUrl(src);
  });
}

export default function HeroSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bgColors, setBgColors] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/products/')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const all = data.map(apiToProduct);
        const sale = all.filter(p => p.badge === 'sale');
        setProducts((sale.length >= 3 ? sale : all).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    products.forEach(p => {
      if (!p.img || bgColors[p.img]) return;
      sampleCornerColor(p.img).then(color => {
        setBgColors(prev => ({ ...prev, [p.img]: color }));
      });
    });
  }, [products, bgColors]);

  const total = Math.min(products.length, SLIDES.length);

  useEffect(() => {
    if (paused || total === 0) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, total]);

  if (products.length === 0) return null;

  const go = (idx: number) => setCurrent((idx + total) % total);
  const heroBg = bgColors[products[current]?.img] || FALLBACK_BG;

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ background: heroBg, transition: 'background 0.6s ease' }}
    >
      {SLIDES.slice(0, total).map((slide, i) => {
        const product = products[i];
        const slideBg = bgColors[product?.img] || FALLBACK_BG;
        return (
          <div
            key={i}
            className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}
            style={{ background: slideBg }}
          >
            <div className="container">
              <div className={styles.content}>

                <div className={styles.text}>
                  <span className={styles.tag}>{slide.tag}</span>
                  <h1 className={styles.headline}>{slide.headline}</h1>
                  <p className={styles.sub}>{slide.sub}</p>
                  {product && (
                    <div className={styles.productHint}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productPrice}>{product.price} ₴</span>
                    </div>
                  )}
                  <Link to={slide.href} className={styles.cta}>
                    {slide.cta} <FaArrowRight className={styles.ctaIcon} />
                  </Link>
                </div>

                <div className={styles.imgCol}>
                  {product && (
                    <Link to={`/product/${product.id}`} tabIndex={i === current ? 0 : -1}>
                      <img
                        className={styles.img}
                        src={product.img}
                        alt={product.name}
                      />
                    </Link>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })}

      <button className={styles.arrowLeft} onClick={() => go(current - 1)} aria-label="Назад">
        <FaChevronLeft />
      </button>
      <button className={styles.arrowRight} onClick={() => go(current + 1)} aria-label="Вперед">
        <FaChevronRight />
      </button>

      <div className={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => go(i)}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
