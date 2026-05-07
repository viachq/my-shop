import { FaBuilding, FaTruck, FaCreditCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaShieldAlt, FaStar, FaHandshake, FaAward } from 'react-icons/fa';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <>
    <TopBar />
    <Header />
    <div className={styles.page}>
      <div className="container">
        <div className={styles.content}>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FaStar /></div>
              <h4>6+ років досвіду</h4>
              <p>Працюємо на ринку з 2018 року, пропонуючи найкращу техніку</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FaAward /></div>
              <h4>Офіційна гарантія</h4>
              <p>Всі товари з офіційною гарантією від виробника</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FaTruck /></div>
              <h4>Доставка по Україні</h4>
              <p>Швидка доставка Новою Поштою та кур'єром по місту</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FaHandshake /></div>
              <h4>Вигідні ціни</h4>
              <p>Конкурентні ціни та регулярні акції на популярні товари</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><FaBuilding /> Про компанію</h2>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <p>
                  <strong>TechBox</strong> — це магазин електроніки та гаджетів, який спеціалізується на продажу смартфонів, ноутбуків, планшетів, навушників та іншої техніки від провідних світових брендів.
                </p>
                <p>
                  Наша місія — зробити сучасні технології доступними для кожного. Ми працюємо напряму з офіційними дистриб'юторами Apple, Samsung, Xiaomi, Sony, JBL та інших брендів.
                </p>
                <p>
                  В нашому інтернет-магазині ви знайдете широкий асортимент: від бюджетних аксесуарів до флагманських пристроїв. Всі товари з офіційною гарантією та можливістю обміну протягом 14 днів.
                </p>
              </div>
              <img
                className={styles.aboutImg}
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600"
                alt="Про TechBox"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><FaTruck /> Доставка та оплата</h2>
            <div className={styles.deliveryGrid}>
              <div className={styles.deliveryCard}>
                <h4><FaTruck /> Доставка</h4>
                <ul>
                  <li>Доставка по Львову — безкоштовно від 2000 ₴</li>
                  <li>Нова Пошта — відправка в день замовлення</li>
                  <li>Укрпошта — доставка 3-5 робочих днів</li>
                  <li>Самовивіз з магазину — Львів, вул. Данила Апостола, 16</li>
                </ul>
              </div>
              <div className={styles.deliveryCard}>
                <h4><FaCreditCard /> Оплата</h4>
                <ul>
                  <li>Оплата при отриманні (накладений платіж)</li>
                  <li>Безготівковий розрахунок на карту</li>
                  <li>Онлайн-оплата (Visa / MasterCard)</li>
                  <li>Для юридичних осіб — безготівковий з ПДВ</li>
                </ul>
              </div>
              <div className={styles.deliveryCard}>
                <h4><FaShieldAlt /> Гарантія</h4>
                <p>Офіційна гарантія від виробника на всі товари. Гарантійне обслуговування в авторизованих сервісних центрах по всій Україні.</p>
              </div>
              <div className={styles.deliveryCard}>
                <h4><FaShieldAlt /> Повернення</h4>
                <p>Обмін або повернення товару належної якості протягом 14 днів з моменту покупки за умови збереження товарного вигляду та упаковки.</p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><FaPhone /> Контакти</h2>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><FaPhone /></div>
                <div>
                  <h4>Телефон</h4>
                  <p>097 274 20 28</p>
                </div>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><FaEnvelope /></div>
                <div>
                  <h4>Email</h4>
                  <p>shop@techbox.com.ua</p>
                </div>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><FaClock /></div>
                <div>
                  <h4>Графік роботи</h4>
                  <p>Пн-Пт: 9:00 - 18:00<br />Сб: 10:00 - 15:00</p>
                </div>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><FaMapMarkerAlt /></div>
                <div>
                  <h4>Адреса</h4>
                  <p>Львів, вул. Данила Апостола, 16</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
