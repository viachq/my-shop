import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaTelegramPlane, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { useSocialLinks } from '../hooks/useSocialLinks';
import styles from './Footer.module.css';

export default function Footer() {
  const social = useSocialLinks();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>Tech<span>Box</span></Link>
            <p className={styles.desc}>Інтернет-магазин електроніки та гаджетів. Офіційна гарантія, швидка доставка по всій Україні.</p>
            <div className={styles.social}>
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href={social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
              <a href={social.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane /></a>
            </div>
          </div>

          <div className={styles.col}>
            <h4>Покупцям</h4>
            <Link to="/catalog">Каталог товарів</Link>
            <Link to="/catalog?sale=1">Акції та знижки</Link>
            <Link to="/about">Про компанію</Link>
            <Link to="/catalog">Доставка і оплата</Link>
            <Link to="/catalog">Повернення товару</Link>
          </div>

          <div className={styles.col}>
            <h4>Категорії</h4>
            <Link to="/catalog?cat=Смартфони">Смартфони</Link>
            <Link to="/catalog?cat=Ноутбуки">Ноутбуки</Link>
            <Link to="/catalog?cat=Навушники">Навушники</Link>
            <Link to="/catalog?cat=Планшети">Планшети</Link>
            <Link to="/catalog?cat=Аксесуари">Аксесуари</Link>
          </div>

          <div className={styles.col}>
            <h4>Контакти</h4>
            <a href="tel:+380972742028" className={styles.contact}>
              <FaPhoneAlt /> 097 274 20 28
            </a>
            <a href="mailto:info@techbox.ua" className={styles.contact}>
              <FaEnvelope /> info@techbox.ua
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; 2026 TechBox. Всі права захищені.</span>
          <div className={styles.payments}>
            <span>Visa</span>
            <span>MasterCard</span>
            <span>Приват24</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
