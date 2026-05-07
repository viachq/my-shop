import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaBoxOpen, FaShoppingBag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './OrderHistoryPage.module.css';

interface OrderItem {
  product_name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  name: string;
  surname: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  payment_method: string;
}

const STATUS_MAP: Record<string, string> = {
  new: 'Нове',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

function translateStatus(status: string): string {
  return STATUS_MAP[status] || status;
}

function getStatusBadgeClass(status: string): string {
  const ukStatus = translateStatus(status);
  switch (ukStatus) {
    case 'Нове': return styles.badgeNew;
    case 'В обробці': return styles.badgeProcessing;
    case 'Відправлено': return styles.badgeShipped;
    case 'Доставлено': return styles.badgeDelivered;
    case 'Скасовано': return styles.badgeCancelled;
    default: return styles.badgeNew;
  }
}

export default function OrderHistoryPage() {
  const { isAuthenticated, token } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/orders/', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const toggleOrder = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.content}>
            {!isAuthenticated ? (
              <div className={styles.authMessage}>
                <p>Увійдіть, щоб переглянути замовлення</p>
                <Link to="/login" className={styles.authLink}>
                  Увійти в акаунт
                </Link>
              </div>
            ) : loading ? (
              <div className={styles.emptyState}>
                <p>Завантаження замовлень...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FaBoxOpen /></div>
                <p>У вас поки немає замовлень</p>
                <Link to="/catalog" className={styles.catalogLink}>
                  <FaShoppingBag /> Перейти до каталогу
                </Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map(order => {
                  const isExpanded = expandedId === order.id;
                  const displayDate = new Date(order.created_at).toLocaleDateString('uk-UA');
                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <div
                        className={styles.orderHeader}
                        onClick={() => toggleOrder(order.id)}
                      >
                        <div className={styles.orderInfo}>
                          <span className={styles.orderId}>#{order.id}</span>
                          <span className={styles.orderDate}>{displayDate}</span>
                          <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                            {translateStatus(order.status)}
                          </span>
                        </div>
                        <div className={styles.orderRight}>
                          <span className={styles.orderTotal}>
                            {Number(order.total).toFixed(2)} &#8372;
                          </span>
                          <FaChevronDown
                            className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                          />
                        </div>
                      </div>
                      {isExpanded && (
                        <div className={styles.orderItems}>
                          {order.items.map((item, idx) => (
                            <div key={idx} className={styles.itemRow}>
                              <div>
                                <span className={styles.itemName}>{item.product_name}</span>
                                <span className={styles.itemQty}> x {item.qty}</span>
                              </div>
                              <span className={styles.itemPrice}>{(item.price * item.qty).toFixed(2)} &#8372;</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
