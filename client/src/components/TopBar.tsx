import { FaPhoneAlt, FaEnvelope, FaInstagram, FaTelegramPlane, FaTiktok, FaFacebookF, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { theme, toggle } = useTheme();
  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <a href="tel:+380972742028" className={styles.contact}><FaPhoneAlt /> 097 274 20 28</a>
          <a href="mailto:info@techbox.ua" className={styles.contact}><FaEnvelope /> info@techbox.ua</a>
        </div>
        <div className={styles.right}>
          <div className={styles.social}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane /></a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <button
              className={styles.themeBtn}
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Світла тема' : 'Темна тема'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
