import { useState, useEffect, useCallback, useRef } from 'react';
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

interface ProductInfo { img: string | null; }

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [productMap, setProductMap] = useState<Record<string, ProductInfo>>({});

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
    fetch(`${API}/products/`, { headers: authHeaders() })
      .then(r => r.json())
      .then((products: { name: string; img: string | null }[]) => {
        const map: Record<string, ProductInfo> = {};
        for (const p of products) map[p.name] = { img: p.img };
        setProductMap(map);
      })
      .catch(() => {});
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
        <div className={styles.filterGroup}>
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${statusFilter === key ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(key)}
            >{label}</button>
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
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_blue}`}><FaClock /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{newToday}</div>
                  <div className={styles.statLabel}>Нові сьогодні</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_orange}`}><FaBoxOpen /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{processingWeek}</div>
                  <div className={styles.statLabel}>В обробці (тижд.)</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_purple}`}><FaTruck /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{shippedWeek}</div>
                  <div className={styles.statLabel}>Відправлено (тижд.)</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_green}`}><FaCheckCircle /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{deliveredWeek}</div>
                  <div className={styles.statLabel}>Доставлено (тижд.)</div>
                </div>
              </div>
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
                        productMap={productMap}
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

function OrderRow({ order, isOpen, productMap, onToggle, onStatusChange }: {
  order: OrderOut;
  isOpen: boolean;
  productMap: Record<string, ProductInfo>;
  onToggle: () => void;
  onStatusChange: (s: OrderStatus) => void;
}) {
  const itemsCount = order.items.reduce((sum, it) => sum + it.qty, 0);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  return (
    <>
      <tr className={`${styles.orderRow} ${isOpen ? styles.orderRowActive : ''}`} onClick={onToggle}>
        <td className={styles.orderId}>#{order.id}</td>
        <td>
          <div className={styles.customerName}>{order.name} {order.surname}</div>
          <div className={styles.customerSub}>{order.address || '—'}</div>
        </td>
        <td className={styles.itemsCell}>{pluralizeItems(itemsCount)}</td>
        <td className={styles.total}>{formatHryvnia(order.total)}</td>
        <td>
          <div className={styles.statusWrap} ref={statusRef}>
            <span
              className={`${styles.status} ${styles[`status_${order.status}`]} ${styles.statusClickable}`}
              onClick={e => { e.stopPropagation(); setStatusOpen(!statusOpen); }}
            >
              {statusLabels[order.status]} <FaChevronDown className={styles.statusChevron} />
            </span>
            {statusOpen && (
              <div className={styles.statusDropdown}>
                {(Object.keys(statusLabels) as OrderStatus[]).map(s => (
                  <button
                    key={s}
                    className={`${styles.statusOption} ${s === order.status ? styles.statusOptionActive : ''}`}
                    onClick={e => { e.stopPropagation(); onStatusChange(s); setStatusOpen(false); }}
                  >
                    <span className={`${styles.statusDot} ${styles[`dot_${s}`]}`} />
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </td>
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
                  <div className={styles.blockRow}><span className={styles.blockLabel}>Адреса:</span> <span>{order.address}</span></div>
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
                <div className={styles.itemsList}>
                  {order.items.map(item => {
                    const product = productMap[item.product_name];
                    return (
                      <div key={item.id} className={styles.itemCard}>
                        <div className={styles.itemImgWrap}>
                          {product?.img ? (
                            <img src={product.img} alt="" className={styles.itemImg} />
                          ) : (
                            <div className={styles.itemImgEmpty} />
                          )}
                        </div>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{item.product_name}</div>
                          <div className={styles.itemMeta}>
                            <span>{item.qty} x {formatHryvnia(item.price)}</span>
                          </div>
                        </div>
                        <div className={styles.itemTotal}>{formatHryvnia(item.price * item.qty)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.itemsTotalRow}>
                  <span>Разом</span>
                  <span>{formatHryvnia(order.total)}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
