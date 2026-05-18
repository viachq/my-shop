import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaTelegramPlane, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import styles from './Footer.module.css';

const SOCIAL = {
  facebook: 'https://www.facebook.com/techbox.ua',
  instagram: 'https://www.instagram.com/techbox_ua',
  tiktok: 'https://www.tiktok.com/@techbox_ua',
  telegram: 'https://t.me/techbox_ua',
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.row}>
          <Link to="/" className={styles.logo}>Tech<span>Box</span></Link>

          <div className={styles.contacts}>
            <a href="tel:+380972742028" className={styles.contact}>
              <FaPhoneAlt /> 097 274 20 28
            </a>
            <span className={styles.dot} />
            <a href="mailto:info@techbox.ua" className={styles.contact}>
              <FaEnvelope /> info@techbox.ua
            </a>
          </div>

          <div className={styles.social}>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href={SOCIAL.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane /></a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; 2026 TechBox. Всі права захищені.</span>
        </div>
      </div>
    </footer>
  );
}
