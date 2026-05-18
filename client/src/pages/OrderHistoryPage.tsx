import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaBoxOpen, FaShoppingBag, FaClock, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
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
  address: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
}

interface ProductImg {
  name: string;
  img: string | null;
  id?: number;
}

const STATUS_MAP: Record<string, { label: string; icon: typeof FaClock }> = {
  new: { label: 'Нове', icon: FaClock },
  processing: { label: 'В обробці', icon: FaBox },
  shipped: { label: 'Відправлено', icon: FaTruck },
  delivered: { label: 'Доставлено', icon: FaCheckCircle },
  cancelled: { label: 'Скасовано', icon: FaTimesCircle },
};

function getStatusInfo(status: string) {
  return STATUS_MAP[status] || { label: status, icon: FaClock };
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'new': return styles.badgeNew;
    case 'processing': return styles.badgeProcessing;
    case 'shipped': return styles.badgeShipped;
    case 'delivered': return styles.badgeDelivered;
    case 'cancelled': return styles.badgeCancelled;
    default: return styles.badgeNew;
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

export default function OrderHistoryPage() {
  const { isAuthenticated, token } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productImgs, setProductImgs] = useState<Record<string, { img: string; id?: number }>>({});
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const liqpayFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('/api/orders/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetch('/api/products/')
      .then(r => r.json())
      .then((data: ProductImg[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, { img: string; id?: number }> = {};
        for (const p of data) {
          if (p.img) map[p.name] = { img: p.img, id: p.id };
        }
        setProductImgs(map);
      })
      .catch(() => {});
  }, []);

  const toggleOrder = (id: number) => setExpandedId(prev => prev === id ? null : id);
  const totalItemsCount = (order: Order) => order.items.reduce((s, i) => s + i.qty, 0);

  const handlePay = async (order: Order) => {
    setPayingOrderId(order.id);
    try {
      const res = await fetch('/api/liqpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id, amount: Number(order.total) }),
      });
      if (!res.ok) throw new Error('API error');
      const { data, signature } = await res.json();
      const form = liqpayFormRef.current;
      if (!form) throw new Error('Form not found');
      const dataInput = form.querySelector<HTMLInputElement>('input[name="data"]');
      const sigInput = form.querySelector<HTMLInputElement>('input[name="signature"]');
      if (!dataInput || !sigInput) throw new Error('Form inputs not found');
      dataInput.value = data;
      sigInput.value = signature;
      form.submit();
    } catch {
      setPayingOrderId(null);
      alert('Не вдалося створити платіж. Спробуйте ще раз.');
    }
  };

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Мої замовлення</h1>
            {orders.length > 0 && (
              <span className={styles.orderCount}>{orders.length} замовлень</span>
            )}
          </div>

          <div className={styles.content}>
            {!isAuthenticated ? (
              <div className={styles.emptyState}>
                <p>Увійдіть, щоб переглянути замовлення</p>
                <Link to="/login" className={styles.actionLink}>Увійти в акаунт</Link>
              </div>
            ) : loading ? (
              <div className={styles.emptyState}><p>Завантаження замовлень...</p></div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FaBoxOpen /></div>
                <p>У вас поки немає замовлень</p>
                <Link to="/catalog" className={styles.actionLink}><FaShoppingBag /> Перейти до каталогу</Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map(order => {
                  const isExpanded = expandedId === order.id;
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={order.id} className={`${styles.orderCard} ${isExpanded ? styles.orderCardExpanded : ''}`}>
                      <div className={styles.orderHeader} onClick={() => toggleOrder(order.id)}>
                        <div className={styles.orderMainInfo}>
                          <div className={styles.orderTopRow}>
                            <span className={styles.orderId}>Замовлення #{order.id}</span>
                            <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                              <StatusIcon className={styles.badgeIcon} />
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className={styles.orderMeta}>
                            <span>{formatDateTime(order.created_at)}</span>
                            <span className={styles.dot} />
                            <span>{totalItemsCount(order)} товарів</span>
                          </div>
                        </div>
                        <div className={styles.orderRight}>
                          <span className={styles.orderTotal}>{formatPrice(order.total)} &#8372;</span>
                          <FaChevronDown className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={styles.orderBody}>
                          <div className={styles.orderDetails}>
                            <div className={styles.detailBlock}>
                              <div className={styles.detailLabel}>Отримувач</div>
                              <div className={styles.detailValue}>{order.name} {order.surname}, {order.phone}, {order.email}</div>
                            </div>
                            <div className={styles.detailBlock}>
                              <div className={styles.detailLabel}>Доставка</div>
                              <div className={styles.detailValue}>{order.address}</div>
                            </div>
                            <div className={styles.detailBlock}>
                              <div className={styles.detailLabel}>Оплата</div>
                              <div className={styles.detailValue}>
                                {order.payment_method === 'card' ? 'Карткою онлайн' : 'При отриманні'}
                                {' — '}
                                <span className={styles.detailSub}>
                                  {order.payment_status === 'paid' ? 'Оплачено' : order.payment_status === 'failed' ? 'Помилка оплати' : 'Очікує оплати'}
                                </span>
                                {order.payment_method === 'card' && order.payment_status !== 'paid' && (
                                  <button
                                    className={styles.payBtn}
                                    onClick={() => handlePay(order)}
                                    disabled={payingOrderId === order.id}
                                  >
                                    <FaCreditCard />
                                    {payingOrderId === order.id ? 'Переадресація...' : 'Оплатити'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.itemsGrid}>
                            {order.items.map((item, idx) => {
                              const pInfo = productImgs[item.product_name];
                              const lineTotal = item.price * item.qty;
                              return (
                                <div key={idx} className={styles.itemCard}>
                                  {pInfo ? (
                                    <Link to={`/product/${pInfo.id}`} className={styles.itemImgWrap}>
                                      <img className={styles.itemImg} src={pInfo.img} alt={item.product_name} />
                                    </Link>
                                  ) : (
                                    <div className={styles.itemImgWrap}>
                                      <div className={styles.itemImgEmpty} />
                                    </div>
                                  )}
                                  <div className={styles.itemBody}>
                                    <div className={styles.itemMeta}>
                                      {pInfo?.id ? (
                                        <Link to={`/product/${pInfo.id}`} className={styles.itemNameLink}>{item.product_name}</Link>
                                      ) : (
                                        <div className={styles.itemName}>{item.product_name}</div>
                                      )}
                                      <span className={styles.itemQty}>{item.qty} шт. × {formatPrice(item.price)} ₴</span>
                                    </div>
                                    <span className={styles.itemTotal}>{formatPrice(lineTotal)} ₴</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
      <form
        ref={liqpayFormRef}
        action="https://www.liqpay.ua/api/3/checkout"
        method="POST"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="data" value="" />
        <input type="hidden" name="signature" value="" />
      </form>
      <Footer />
    </>
  );
}
