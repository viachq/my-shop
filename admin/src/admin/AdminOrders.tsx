import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaChevronDown, FaInbox, FaBoxOpen, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import styles from './AdminOrders.module.css';

const API = '/api';

interface OrderItemOut {
  id: number;
  product_name: string;
  qty: number;
  price: number;
}

type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderOut {
  id: number;
  user_id: number;
  status: OrderStatus;
  total: number;
  name: string;
  surname: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  comment: string | null;
  payment_method: string;
  delivery_method: string;
  payment_status: string;
  created_at: string;
  items: OrderItemOut[];
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'Нове',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

const tabLabels: Record<string, string> = {
  all: 'Усі',
  new: 'Нові',
  processing: 'В обробці',
  shipped: 'Відправлені',
  delivered: 'Доставлені',
  cancelled: 'Скасовані',
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatHryvnia(value: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' грн';
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function pluralizeItems(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} товари`;
  return `${n} товарів`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isThisWeek(d: Date, now: Date): boolean {
  const start = new Date(now);
  const day = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);
  return d >= start && d <= now;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders/`, { headers: authHeaders() });
      if (res.status === 401) { localStorage.removeItem('adminAuth'); localStorage.removeItem('adminToken'); window.location.href = '/'; return; }
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: OrderOut[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${o.name} ${o.surname}`.toLowerCase();
      const idStr = `#${o.id}`.toLowerCase();
      if (!fullName.includes(q) && !idStr.includes(q) && !String(o.id).includes(q)) return false;
    }
    return true;
  });

  const changeStatus = async (id: number, status: OrderStatus) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const statusCounts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const now = new Date();
  const todayOrders = orders.filter(o => isSameDay(new Date(o.created_at), now));
  const weekOrders = orders.filter(o => isThisWeek(new Date(o.created_at), now));

  const newToday = todayOrders.filter(o => o.status === 'new').length;
  const processingWeek = weekOrders.filter(o => o.status === 'processing').length;
  const shippedWeek = weekOrders.filter(o => o.status === 'shipped').length;
  const deliveredWeek = weekOrders.filter(o => o.status === 'delivered').length;

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Пошук за клієнтом або номером..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.statusTabs}>
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.statusTab} ${statusFilter === key ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {label} <span className={styles.tabCount}>{statusCounts[key as keyof typeof statusCounts]}</span>
            </button>
          ))}
        </div>
        <span className={styles.topBarCount}>Знайдено: <strong>{filtered.length}</strong></span>
      </div>
      <div className={styles.content}>
        {loading ? (
          <SkeletonPage />
        ) : (
          <>
            <div className={styles.statsStrip}>
              <StatCard
                icon={<FaClock />}
                label="Нові сьогодні"
                value={newToday}
                tone="blue"
              />
              <StatCard
                icon={<FaBoxOpen />}
                label="В обробці (тижд.)"
                value={processingWeek}
                tone="orange"
              />
              <StatCard
                icon={<FaTruck />}
                label="Відправлено (тижд.)"
                value={shippedWeek}
                tone="purple"
              />
              <StatCard
                icon={<FaCheckCircle />}
                label="Доставлено (тижд.)"
                value={deliveredWeek}
                tone="green"
              />
            </div>


            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.idCol}>№</th>
                    <th>Клієнт</th>
                    <th>Товари</th>
                    <th>Сума</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th className={styles.actionsCol}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const isOpen = expandedId === o.id;
                    return (
                      <OrderRow
                        key={o.id}
                        order={o}
                        isOpen={isOpen}
                        onToggle={() => setExpandedId(isOpen ? null : o.id)}
                        onStatusChange={(s) => changeStatus(o.id, s)}
                      />
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.empty}>
                          <FaInbox className={styles.emptyIcon} />
                          <p className={styles.emptyTitle}>Замовлень не знайдено</p>
                          <p className={styles.emptyHint}>Спробуйте змінити фільтр статусу або пошук</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function OrderRow({ order, isOpen, onToggle, onStatusChange }: {
  order: OrderOut;
  isOpen: boolean;
  onToggle: () => void;
  onStatusChange: (s: OrderStatus) => void;
}) {
  const itemsCount = order.items.reduce((sum, it) => sum + it.qty, 0);
  return (
    <>
      <tr className={`${styles.orderRow} ${isOpen ? styles.orderRowActive : ''}`} onClick={onToggle}>
        <td className={styles.orderId}>#{order.id}</td>
        <td>
          <div className={styles.customerName}>{order.name} {order.surname}</div>
          <div className={styles.customerSub}>{order.city || '—'}</div>
        </td>
        <td className={styles.itemsCell}>{pluralizeItems(itemsCount)}</td>
        <td className={styles.total}>{formatHryvnia(order.total)}</td>
        <td><span className={`${styles.status} ${styles[`status_${order.status}`]}`}>{statusLabels[order.status]}</span></td>
        <td className={styles.dateCell}>{formatDateTime(order.created_at)}</td>
        <td>
          <button
            className={`${styles.detailBtn} ${isOpen ? styles.detailBtnOpen : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
          >
            Деталі <FaChevronDown className={styles.detailChevron} />
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className={styles.expandedRow}>
          <td colSpan={7} className={styles.expandedCell}>
            <div className={styles.expandedBody}>
              <div className={styles.expandGrid}>
                <div className={styles.expandBlock}>
                  <div className={styles.blockTitle}>Контакти</div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Телефон:</span> <span>{order.phone}</span></div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Email:</span> <span>{order.email}</span></div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Адреса:</span> <span>{order.city}, {order.address}</span></div>
                  {order.comment && (
                    <div className={styles.blockRow}><span className={styles.blockLabel}>Коментар:</span> <span>{order.comment}</span></div>
                  )}
                </div>
                <div className={styles.expandBlock}>
                  <div className={styles.blockTitle}>Доставка та оплата</div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Доставка:</span> <span>{order.delivery_method}</span></div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Оплата:</span> <span>{order.payment_method}</span></div>
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Статус оплати:</span> <span>{order.payment_status}</span></div>
                </div>
              </div>

              <div className={styles.itemsBlock}>
                <div className={styles.blockTitle}>Товари</div>
                <div className={styles.itemsTable}>
                  <div className={styles.itemsHead}>
                    <span>Назва</span>
                    <span className={styles.itemQty}>К-сть</span>
                    <span className={styles.itemPrice}>Ціна</span>
                    <span className={styles.itemSub}>Сума</span>
                  </div>
                  {order.items.map(item => (
                    <div key={item.id} className={styles.itemLine}>
                      <span>{item.product_name}</span>
                      <span className={styles.itemQty}>{item.qty}</span>
                      <span className={styles.itemPrice}>{formatHryvnia(item.price)}</span>
                      <span className={styles.itemSub}>{formatHryvnia(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className={styles.itemsTotalRow}>
                    <span>Разом</span>
                    <span>{formatHryvnia(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.statusBlock}>
                <div className={styles.blockTitle}>Змінити статус</div>
                <div className={styles.statusSelectWrap}>
                  <select
                    className={styles.statusSelect}
                    value={order.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => onStatusChange(e.target.value as OrderStatus)}
                  >
                    {(Object.keys(statusLabels) as OrderStatus[]).map(s => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                  <FaChevronDown className={styles.selectChevron} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatCard({ icon, label, value, tone }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'teal' | 'red' | 'orange' | 'green' | 'blue' | 'purple';
}) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}>{icon}</div>
      <div className={styles.statBody}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <>
      <div className={styles.statsStrip}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`${styles.statCard} ${styles.skeletonCard}`}>
            <div className={`${styles.skeleton} ${styles.skelIcon}`} />
            <div className={styles.statBody}>
              <div className={`${styles.skeleton} ${styles.skelLineLg}`} />
              <div className={`${styles.skeleton} ${styles.skelLineSm}`} />
            </div>
          </div>
        ))}
      </div>
      <div className={`${styles.skeleton} ${styles.skelTabs}`} />
      <div className={`${styles.skeleton} ${styles.skelToolbar}`} />
      <div className={styles.tableWrap}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skelRow}>
            <div className={`${styles.skeleton} ${styles.skelId}`} />
            <div className={styles.skelRowText}>
              <div className={`${styles.skeleton} ${styles.skelLineLg}`} />
              <div className={`${styles.skeleton} ${styles.skelLineSm}`} />
            </div>
            <div className={`${styles.skeleton} ${styles.skelBadge}`} />
            <div className={`${styles.skeleton} ${styles.skelBadge}`} />
            <div className={`${styles.skeleton} ${styles.skelBadge}`} />
          </div>
        ))}
      </div>
    </>
  );
}
