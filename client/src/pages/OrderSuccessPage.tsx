import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaShoppingBag, FaClipboardList } from 'react-icons/fa';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './OrderSuccessPage.module.css';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderId = (location.state as { orderId?: number | string })?.orderId;

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.wrapper}>
            <div className={styles.card}>
              <div className={styles.icon}>
                <FaCheckCircle />
              </div>
              <h2 className={styles.heading}>Ваше замовлення прийнято!</h2>
              {orderId && (
                <div className={styles.orderNumber}>#{orderId}</div>
              )}
              <p className={styles.text}>
                Ми зв'яжемося з вами найближчим часом для підтвердження замовлення
                та уточнення деталей доставки.
              </p>
              <div className={styles.buttons}>
                <Link to="/" className={styles.btnPrimary}>
                  <FaHome /> На головну
                </Link>
                <Link to="/orders" className={styles.btnOutline}>
                  <FaClipboardList /> Мої замовлення
                </Link>
                <Link to="/catalog" className={styles.btnOutline}>
                  <FaShoppingBag /> Продовжити покупки
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
