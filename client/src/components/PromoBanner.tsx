import { Link } from 'react-router-dom';
import { FaArrowRight, FaPercent, FaBolt } from 'react-icons/fa';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardBg} />
            <div className={styles.cardContent}>
              <span className={styles.icon}><FaPercent /></span>
              <h3>Акції та знижки</h3>
              <p>Спеціальні пропозиції на популярні товари. Економте до 40%</p>
              <Link to="/catalog?sale=1" className={styles.link}>
                Переглянути <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className={styles.cardWide}>
            <div className={styles.wideBg} />
            <div className={styles.wideContent}>
              <span className={styles.wideIcon}><FaBolt /></span>
              <h2>Каталог <span>товарів</span></h2>
              <p>Найкращі гаджети та електроніка від провідних брендів</p>
              <Link to="/catalog" className={styles.btn}>Дивитись каталог <FaArrowRight /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
