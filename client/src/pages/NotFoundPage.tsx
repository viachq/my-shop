import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.code}>404</div>
          <h1 className={styles.title}>Сторінку не знайдено</h1>
          <p className={styles.text}>
            Можливо, вона була видалена або ви ввели неправильну адресу
          </p>
          <div className={styles.buttons}>
            <Link to="/" className={styles.btnPrimary}>На головну</Link>
            <Link to="/catalog" className={styles.btnOutline}>Каталог</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
