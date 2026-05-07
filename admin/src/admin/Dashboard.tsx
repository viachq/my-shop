import { useEffect, useState } from 'react';
import { FaBoxes, FaShoppingCart, FaUsers, FaChartBar } from 'react-icons/fa';
import styles from './Dashboard.module.css';

const API = '/api';

interface Stats {
  products: number;
  orders: number;
  users: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    Promise.all([
      fetch(`${API}/products/`, { headers }).then(r => r.json()),
      fetch(`${API}/orders/`, { headers }).then(r => r.json()),
      fetch(`${API}/users/`, { headers }).then(r => r.json()),
    ])
      .then(([products, orders, users]) => {
        setStats({
          products: Array.isArray(products) ? products.length : 0,
          orders: Array.isArray(orders) ? orders.length : 0,
          users: Array.isArray(users) ? users.length : 0,
        });
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Товарів', key: 'products' as const, icon: <FaBoxes />, color: 'blue' },
    { label: 'Замовлень', key: 'orders' as const, icon: <FaShoppingCart />, color: 'orange' },
    { label: 'Користувачів', key: 'users' as const, icon: <FaUsers />, color: 'green' },
  ];

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Дашборд</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          {cards.map(s => (
            <div key={s.label} className={styles.stat}>
              <div className={`${styles.statIcon} ${styles[s.color]}`}>{s.icon}</div>
              <div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>
                  {loading ? '...' : stats ? stats[s.key].toLocaleString('uk-UA') : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
