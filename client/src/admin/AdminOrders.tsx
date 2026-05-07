import { useState } from 'react';
import { FaSearch, FaEye } from 'react-icons/fa';
import styles from './AdminOrders.module.css';

interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  date: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  items: OrderItem[];
}

const statusLabels: Record<Order['status'], string> = {
  new: 'Нове',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

const mockOrders: Order[] = [
  { id: 'ORD-001', customer: 'Олена Коваленко', phone: '+380671234567', address: 'м. Київ, вул. Хрещатик, 1', date: '2026-04-17', status: 'new', total: '48 498.00', items: [{ name: 'iPhone 15 128GB Black', qty: 1, price: '38999.00' }, { name: 'Apple AirPods Pro 2', qty: 1, price: '9999.00' }] },
  { id: 'ORD-002', customer: 'Андрій Шевченко', phone: '+380501234567', address: 'м. Одеса, вул. Дерибасівська, 10', date: '2026-04-17', status: 'processing', total: '44 999.00', items: [{ name: 'MacBook Air M2 13" 256GB', qty: 1, price: '44999.00' }] },
  { id: 'ORD-003', customer: 'Марія Бондаренко', phone: '+380631234567', address: 'м. Харків, пр. Науки, 25', date: '2026-04-16', status: 'shipped', total: '34 497.00', items: [{ name: 'iPad 10 64GB Wi-Fi', qty: 1, price: '16999.00' }, { name: 'Sony WH-1000XM5', qty: 1, price: '11999.00' }, { name: 'JBL Flip 6', qty: 1, price: '3499.00' }] },
  { id: 'ORD-004', customer: 'Іван Петренко', phone: '+380971234567', address: 'м. Львів, вул. Січових Стрільців, 5', date: '2026-04-16', status: 'delivered', total: '5 097.00', items: [{ name: 'Xiaomi Band 8', qty: 1, price: '1299.00' }, { name: 'JBL Tune 520BT', qty: 1, price: '1799.00' }, { name: 'Anker PowerCore 20000mAh', qty: 1, price: '1599.00' }] },
  { id: 'ORD-005', customer: 'Тетяна Мельник', phone: '+380661234567', address: 'м. Дніпро, вул. Набережна, 15', date: '2026-04-15', status: 'cancelled', total: '8 499.00', items: [{ name: 'Xiaomi Redmi Note 13 8/256GB', qty: 1, price: '8499.00' }] },
  { id: 'ORD-006', customer: 'Дмитро Ткаченко', phone: '+380931234567', address: 'м. Запоріжжя, пр. Соборний, 100', date: '2026-04-15', status: 'delivered', total: '22 498.00', items: [{ name: 'Samsung Galaxy Watch 6 44mm', qty: 1, price: '9499.00' }, { name: 'Samsung Galaxy A55 5G 8/128GB', qty: 1, price: '13499.00' }] },
  { id: 'ORD-007', customer: 'Наталія Кравченко', phone: '+380681234567', address: 'м. Вінниця, вул. Соборна, 42', date: '2026-04-14', status: 'delivered', total: '18 999.00', items: [{ name: 'PlayStation 5 Slim Digital', qty: 1, price: '18999.00' }] },
  { id: 'ORD-008', customer: 'Олександр Лисенко', phone: '+380731234567', address: 'м. Полтава, вул. Європейська, 8', date: '2026-04-14', status: 'processing', total: '19 796.00', items: [{ name: 'Nintendo Switch OLED', qty: 1, price: '13999.00' }, { name: 'Xbox Wireless Controller', qty: 1, price: '2499.00' }, { name: 'Logitech MX Keys Mini', qty: 1, price: '3299.00' }] },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detail, setDetail] = useState<Order | null>(null);

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const changeStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  const statusCounts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Замовлення</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.statusTabs}>
          {Object.entries({ all: 'Усі', ...statusLabels }).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.statusTab} ${statusFilter === key ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {label} <span className={styles.tabCount}>{statusCounts[key as keyof typeof statusCounts]}</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Пошук за клієнтом або номером..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Клієнт</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Сума</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className={styles.orderId}>{o.id}</td>
                  <td>
                    <div className={styles.customerName}>{o.customer}</div>
                    <div className={styles.customerPhone}>{o.phone}</div>
                  </td>
                  <td>{o.date}</td>
                  <td><span className={`${styles.status} ${styles[`status_${o.status}`]}`}>{statusLabels[o.status]}</span></td>
                  <td className={styles.total}>{o.total} грн</td>
                  <td>
                    <button className={styles.actionBtn} title="Деталі" onClick={() => setDetail(o)}>
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>Замовлень не знайдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{detail.id}</h2>
              <span className={`${styles.status} ${styles[`status_${detail.status}`]}`}>{statusLabels[detail.status]}</span>
            </div>
            <div className={styles.modalSection}>
              <h3>Клієнт</h3>
              <p>{detail.customer}</p>
              <p className={styles.secondaryText}>{detail.phone}</p>
              <p className={styles.secondaryText}>{detail.address}</p>
            </div>
            <div className={styles.modalSection}>
              <h3>Товари</h3>
              <div className={styles.itemsList}>
                {detail.items.map((item, i) => (
                  <div key={i} className={styles.itemRow}>
                    <span>{item.name} x{item.qty}</span>
                    <span className={styles.itemPrice}>{item.price} грн</span>
                  </div>
                ))}
                <div className={styles.totalRow}>
                  <span>Разом:</span>
                  <span>{detail.total} грн</span>
                </div>
              </div>
            </div>
            <div className={styles.modalSection}>
              <h3>Змінити статус</h3>
              <div className={styles.statusBtns}>
                {(Object.keys(statusLabels) as Order['status'][]).map(s => (
                  <button
                    key={s}
                    className={`${styles.statusChangeBtn} ${detail.status === s ? styles.statusChangeBtnActive : ''}`}
                    onClick={() => changeStatus(detail.id, s)}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setDetail(null)}>Закрити</button>
          </div>
        </div>
      )}
    </>
  );
}
