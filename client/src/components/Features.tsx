import { FaTruck, FaTags, FaAward, FaHeadset } from 'react-icons/fa';
import styles from './Features.module.css';

const items = [
  { icon: <FaTruck />, text: 'Безкоштовна доставка від 2000₴' },
  { icon: <FaTags />, text: 'Щоденні знижки' },
  { icon: <FaAward />, text: '100% оригінал' },
  { icon: <FaHeadset />, text: 'Підтримка 24/7' },
];

export default function Features() {
  return (
    <section className={styles.strip}>
      <div className="container">
        <div className={styles.track}>
          {items.map((item, i) => (
            <div className={styles.item} key={i}>
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
