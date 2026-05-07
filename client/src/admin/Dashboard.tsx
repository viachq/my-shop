import { FaUtensils, FaBoxes, FaShoppingCart, FaUsers } from 'react-icons/fa';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const stats = [
    { label: 'Рецептів', value: '9', icon: <FaUtensils />, color: 'teal' },
    { label: 'Товарів', value: '22', icon: <FaBoxes />, color: 'blue' },
    { label: 'Замовлень', value: '156', icon: <FaShoppingCart />, color: 'orange' },
    { label: 'Користувачів', value: '1 024', icon: <FaUsers />, color: 'green' },
  ];

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Дашборд</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          {stats.map(s => (
            <div key={s.label} className={styles.stat}>
              <div className={`${styles.statIcon} ${styles[s.color]}`}>{s.icon}</div>
              <div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
