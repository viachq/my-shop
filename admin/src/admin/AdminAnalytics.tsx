import { useEffect, useState } from 'react';
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUserPlus,
  FaChartLine,
  FaTrophy,
  FaMedal,
  FaAward,
  FaInbox,
  FaLayerGroup,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaUsers,
  FaCreditCard,
  FaTruck,
  FaCalendarAlt,
  FaClipboardList,
  FaMapMarkerAlt,
  FaFilter,
  FaWarehouse,
  FaTags,
  FaPercent,
  FaClock,
  FaBan,
  FaRedo,
} from 'react-icons/fa';
import styles from './AdminAnalytics.module.css';

const API = '/api';

interface TopProduct {
  name: string;
  total_qty: number;
  total_revenue: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

interface AnalyticsSummary {
  total_revenue: number;
  orders_count: number;
  new_customers: number;
  average_check: number;
  top_products: TopProduct[];
  category_breakdown: CategoryBreakdown[];
}

interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
}

interface TopCustomer {
  name: string;
  email: string;
  orders_count: number;
  total_spent: number;
}

interface MethodCount {
  method: string;
  count: number;
}

interface LowStockProduct {
  name: string;
  stock: number;
  category: string;
}

interface Growth {
  revenue_change_percent: number;
  orders_change_percent: number;
  customers_change_percent: number;
}

interface AnalyticsDetailed {
  revenue_by_day: RevenueByDay[];
  orders_by_status: OrdersByStatus[];
  revenue_by_month: RevenueByMonth[];
  top_customers: TopCustomer[];
  payment_methods: MethodCount[];
  delivery_methods: MethodCount[];
  low_stock_products: LowStockProduct[];
  growth: Growth;
}

interface AdvancedAnalytics {
  customer_segmentation: { bucket: string; count: number }[];
  new_vs_returning: { new_customers: number; returning: number };
  customer_lifetime_value: number;
  retention_rate: number;
  orders_by_weekday: { day: number; count: number; revenue: number }[];
  orders_by_hour: { hour: number; count: number; revenue: number }[];
  orders_by_city: { city: string; count: number; revenue: number }[];
  status_funnel: { status: string; count: number }[];
  cancellation_rate: number;
  avg_delivery_days: number;
  pending_orders: { new_over_3d: number; processing_over_3d: number };
  cross_sell_pairs: { product_a: string; product_b: string; count: number }[];
  never_sold_products: { name: string; category: string; stock: number }[];
  overstocked_products: { name: string; stock: number; sold_qty: number }[];
  stock_value: number;
  sale_impact: { total_discount_given: number; sale_revenue_percent: number; regular_revenue: number; sale_revenue: number };
  aov_trend: { date: string; aov: number }[];
  revenue_by_payment_method: { method: string; revenue: number; count: number }[];
  revenue_by_city: { city: string; revenue: number }[];
}

const CATEGORY_COLORS = [
  '#14b8a6', '#3b82f6', '#a855f7', '#f97316', '#ef4444',
  '#22c55e', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6',
];

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  processing: '#f97316',
  shipped: '#a855f7',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Нові',
  processing: 'В обробці',
  shipped: 'Відправлені',
  delivered: 'Доставлені',
  cancelled: 'Скасовані',
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Карта',
  cash: 'Готівка',
  online: 'Онлайн',
};

const DELIVERY_LABELS: Record<string, string> = {
  courier: 'Кур\u0027єр',
  pickup: 'Самовивіз',
  post: 'Пошта',
};

function formatUAH(value: number | undefined | null): string {
  return (Number(value) || 0).toLocaleString('uk-UA', { maximumFractionDigits: 0 }) + ' грн';
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const DIFFICULTY_LABELS: Record<string, string> = { easy: 'Легко', medium: 'Середньо', hard: 'Складно' };
const DIFFICULTY_COLORS: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(monthStr: string): string {
  const [, m] = monthStr.split('-');
  const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
  const idx = parseInt(m, 10) - 1;
  return months[idx] || monthStr;
}

function rankBadgeClass(index: number, base: string): string {
  if (index === 0) return `${base} ${styles.rankGold}`;
  if (index === 1) return `${base} ${styles.rankSilver}`;
  if (index === 2) return `${base} ${styles.rankBronze}`;
  return base;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [detailed, setDetailed] = useState<AnalyticsDetailed | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    const safeFetch = async (url: string) => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        const { logout: doLogout } = await import('./AdminAuth');
        doLogout();
        window.location.href = '/';
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    };

    Promise.all([
      safeFetch(`${API}/analytics/summary`),
      safeFetch(`${API}/analytics/detailed`),
      safeFetch(`${API}/analytics/advanced`),
    ])
      .then(([summary, detailedData, advancedData]) => {
        setData(summary);
        setDetailed(detailedData);
        setAdvanced(advancedData);
      })
      .catch(err => console.error('Failed to fetch analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className={styles.topBar}>
          <h1 className={styles.title}>Аналітика</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <FaChartLine className={styles.emptyIcon} />
            <p>Завантаження...</p>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div className={styles.topBar}>
          <h1 className={styles.title}>Аналітика</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <FaInbox className={styles.emptyIcon} />
            <p>Не вдалося завантажити дані аналітики.</p>
          </div>
        </div>
      </>
    );
  }

  const topProducts = data.top_products || [];
  const categoryBreakdown = data.category_breakdown || [];

  // Ensure detailed/advanced have expected arrays even if API returned partial data
  if (detailed) {
    detailed.revenue_by_day = detailed.revenue_by_day || [];
    detailed.orders_by_status = detailed.orders_by_status || [];
    detailed.revenue_by_month = detailed.revenue_by_month || [];
    detailed.top_customers = detailed.top_customers || [];
    detailed.payment_methods = detailed.payment_methods || [];
    detailed.delivery_methods = detailed.delivery_methods || [];
    detailed.low_stock_products = detailed.low_stock_products || [];
    detailed.growth = detailed.growth || { revenue_change_percent: 0, orders_change_percent: 0, customers_change_percent: 0 };
  }

  const maxRevenue = topProducts.length > 0
    ? Math.max(...topProducts.map(p => p.total_revenue), 1)
    : 1;

  const totalCategoryCount = categoryBreakdown.reduce((s: number, c: { count: number }) => s + c.count, 0) || 1;

  const maxDayRevenue = detailed && detailed.revenue_by_day?.length > 0
    ? Math.max(...detailed.revenue_by_day.map(d => d.revenue), 1)
    : 1;

  const maxStatusCount = detailed && detailed.orders_by_status?.length > 0
    ? Math.max(...detailed.orders_by_status.map(s => s.count), 1)
    : 1;

  const maxMonthRevenue = detailed?.revenue_by_month?.length > 0
    ? Math.max(...detailed.revenue_by_month.map(m => m.revenue), 1)
    : 1;

  const totalPaymentCount = detailed?.payment_methods
    ? detailed.payment_methods.reduce((s: number, p: { count: number }) => s + p.count, 0) || 1
    : 1;

  const totalDeliveryCount = detailed?.delivery_methods
    ? detailed.delivery_methods.reduce((s: number, d: { count: number }) => s + d.count, 0) || 1
    : 1;

  const renderGrowthCard = (
    label: string,
    value: number,
    icon: React.ReactNode,
  ) => {
    const positive = value >= 0;
    return (
      <div className={styles.growthCard}>
        <div className={styles.growthIcon}>{icon}</div>
        <div className={styles.growthBody}>
          <div className={styles.growthLabel}>{label}</div>
          <div className={`${styles.growthValue} ${positive ? styles.growthUp : styles.growthDown}`}>
            {positive ? <FaArrowUp /> : <FaArrowDown />}
            <span>{Math.abs(value).toFixed(1)}%</span>
          </div>
          <div className={styles.growthSubtitle}>vs минулі 30 днів</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Аналітика</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.kpis}>
          <div className={`${styles.kpi} ${styles.kpiTeal}`}>
            <div className={styles.kpiIcon}><FaMoneyBillWave /></div>
            <div className={styles.kpiBody}>
              <div className={styles.kpiLabel}>Загальний дохід</div>
              <div className={styles.kpiValue}>{formatUAH(data.total_revenue)}</div>
              <div className={styles.kpiSubtitle}>За 30 днів</div>
            </div>
          </div>
          <div className={`${styles.kpi} ${styles.kpiBlue}`}>
            <div className={styles.kpiIcon}><FaShoppingCart /></div>
            <div className={styles.kpiBody}>
              <div className={styles.kpiLabel}>Замовлень</div>
              <div className={styles.kpiValue}>{data.orders_count}</div>
              <div className={styles.kpiSubtitle}>За 30 днів</div>
            </div>
          </div>
          <div className={`${styles.kpi} ${styles.kpiPurple}`}>
            <div className={styles.kpiIcon}><FaUserPlus /></div>
            <div className={styles.kpiBody}>
              <div className={styles.kpiLabel}>Нових клієнтів</div>
              <div className={styles.kpiValue}>{data.new_customers}</div>
              <div className={styles.kpiSubtitle}>За 30 днів</div>
            </div>
          </div>
          <div className={`${styles.kpi} ${styles.kpiOrange}`}>
            <div className={styles.kpiIcon}><FaChartLine /></div>
            <div className={styles.kpiBody}>
              <div className={styles.kpiLabel}>Середній чек</div>
              <div className={styles.kpiValue}>{formatUAH(data.average_check)}</div>
              <div className={styles.kpiSubtitle}>За 30 днів</div>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Топ товарів за доходом</h2>
            {topProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <FaInbox className={styles.emptyIcon} />
                <p>Немає даних про продажі</p>
              </div>
            ) : (
              <div className={styles.barList}>
                {topProducts.map((p, i) => {
                  const percent = (p.total_revenue / maxRevenue) * 100;
                  return (
                    <div key={p.name} className={styles.barItem}>
                      <div className={rankBadgeClass(i, styles.barRank)}>{i + 1}</div>
                      <div className={styles.barContent}>
                        <div className={styles.barHeader}>
                          <span className={styles.barName}>{p.name}</span>
                          <span className={styles.barRevenue}>{formatUAH(p.total_revenue)}</span>
                        </div>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Категорії товарів</h2>
            {categoryBreakdown.length === 0 ? (
              <div className={styles.emptyState}>
                <FaLayerGroup className={styles.emptyIcon} />
                <p>Немає даних про категорії</p>
              </div>
            ) : (
              <div className={styles.donutWrap}>
                <div
                  className={styles.donut}
                  style={{
                    background: (() => {
                      let acc = 0;
                      const stops = categoryBreakdown.map((c, i) => {
                        const start = (acc / totalCategoryCount) * 360;
                        acc += c.count;
                        const end = (acc / totalCategoryCount) * 360;
                        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                        return `${color} ${start}deg ${end}deg`;
                      });
                      return `conic-gradient(${stops.join(', ')})`;
                    })(),
                  }}
                >
                  <div className={styles.donutHole}>
                    <div className={styles.donutTotal}>{totalCategoryCount}</div>
                    <div className={styles.donutLabel}>товарів</div>
                  </div>
                </div>
                <div className={styles.legend}>
                  {categoryBreakdown.map((c, i) => {
                    const percent = Math.round((c.count / totalCategoryCount) * 100);
                    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                    return (
                      <div key={c.category} className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: color }} />
                        <span className={styles.legendName}>{c.category}</span>
                        <span className={styles.legendPercent}>{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Топ-5 товарів</h2>
          {topProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <FaInbox className={styles.emptyIcon} />
              <p>Поки що немає замовлень</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thRank}>#</th>
                  <th>Товар</th>
                  <th>Продажі</th>
                  <th className={styles.thRevenue}>Дохід</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name}>
                    <td>
                      <div className={rankBadgeClass(i, styles.rankBadge)}>
                        {i === 0 ? <FaTrophy /> : i === 1 ? <FaMedal /> : i === 2 ? <FaAward /> : i + 1}
                      </div>
                    </td>
                    <td className={styles.prodName}>{p.name}</td>
                    <td className={styles.qty}>{p.total_qty} шт</td>
                    <td className={styles.revenue}>{formatUAH(p.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {detailed && (
          <>
            <div className={styles.growthRow}>
              {renderGrowthCard(
                'Зміна виручки',
                detailed.growth.revenue_change_percent,
                <FaMoneyBillWave />,
              )}
              {renderGrowthCard(
                'Зміна замовлень',
                detailed.growth.orders_change_percent,
                <FaShoppingCart />,
              )}
              {renderGrowthCard(
                'Зміна клієнтів',
                detailed.growth.customers_change_percent,
                <FaUserPlus />,
              )}
            </div>

            <div className={styles.chartsGrid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaCalendarAlt className={styles.cardIcon} /> Виручка за день (30 днів)
                </h2>
                {detailed.revenue_by_day.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає даних за цей період</p>
                  </div>
                ) : (
                  <div className={styles.dayChartWrap}>
                    <div className={styles.dayChart}>
                      {detailed.revenue_by_day.map((d, i) => {
                        const height = (d.revenue / maxDayRevenue) * 100;
                        return (
                          <div
                            key={d.date}
                            className={styles.dayBarWrap}
                            onMouseEnter={() => setHoveredDay(i)}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            {hoveredDay === i && (
                              <div className={styles.tooltip}>
                                <div className={styles.tooltipDate}>{formatShortDate(d.date)}</div>
                                <div className={styles.tooltipRow}>
                                  <span>Виручка:</span>
                                  <strong>{formatUAH(d.revenue)}</strong>
                                </div>
                                <div className={styles.tooltipRow}>
                                  <span>Замовлень:</span>
                                  <strong>{d.orders}</strong>
                                </div>
                              </div>
                            )}
                            <div
                              className={styles.dayBar}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.dayAxis}>
                      {detailed.revenue_by_day.map((d, i) => (
                        <div key={d.date} className={styles.dayAxisLabel}>
                          {i % 5 === 0 ? formatShortDate(d.date) : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaClipboardList className={styles.cardIcon} /> Замовлення за статусом
                </h2>
                {detailed.orders_by_status.every(s => s.count === 0) ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає замовлень</p>
                  </div>
                ) : (
                  <div className={styles.barList}>
                    {detailed.orders_by_status.map(s => {
                      const percent = (s.count / maxStatusCount) * 100;
                      const color = STATUS_COLORS[s.status] || '#94a3b8';
                      return (
                        <div key={s.status} className={styles.barItem}>
                          <div
                            className={styles.statusDot}
                            style={{ background: color }}
                          />
                          <div className={styles.barContent}>
                            <div className={styles.barHeader}>
                              <span className={styles.barName}>{STATUS_LABELS[s.status] || s.status}</span>
                              <span className={styles.barRevenue} style={{ color }}>{s.count}</span>
                            </div>
                            <div className={styles.barTrack}>
                              <div
                                className={styles.barFill}
                                style={{
                                  width: `${percent}%`,
                                  background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaChartLine className={styles.cardIcon} /> Виручка за місяць (6 місяців)
                </h2>
                {detailed.revenue_by_month.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає даних</p>
                  </div>
                ) : (
                  <div className={styles.monthChart}>
                    {detailed.revenue_by_month.map(m => {
                      const height = (m.revenue / maxMonthRevenue) * 100;
                      return (
                        <div key={m.month} className={styles.monthCol}>
                          <div className={styles.monthValue}>{formatUAH(m.revenue)}</div>
                          <div className={styles.monthBarWrap}>
                            <div
                              className={styles.monthBar}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className={styles.monthLabel}>{formatMonth(m.month)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaUsers className={styles.cardIcon} /> Топ клієнтів
                </h2>
                {detailed.top_customers.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає даних про клієнтів</p>
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.thRank}>#</th>
                        <th>Клієнт</th>
                        <th>Замовлень</th>
                        <th className={styles.thRevenue}>Витрати</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailed.top_customers.map((c, i) => (
                        <tr key={c.email}>
                          <td>
                            <div className={rankBadgeClass(i, styles.rankBadge)}>
                              {i === 0 ? <FaTrophy /> : i === 1 ? <FaMedal /> : i === 2 ? <FaAward /> : i + 1}
                            </div>
                          </td>
                          <td>
                            <div className={styles.custName}>{c.name}</div>
                            <div className={styles.custEmail}>{c.email}</div>
                          </td>
                          <td className={styles.qty}>{c.orders_count}</td>
                          <td className={styles.revenue}>{formatUAH(c.total_spent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaCreditCard className={styles.cardIcon} /> Способи оплати
                </h2>
                {detailed.payment_methods.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає даних</p>
                  </div>
                ) : (
                  <div className={styles.donutWrap}>
                    <div
                      className={styles.donutSmall}
                      style={{
                        background: (() => {
                          let acc = 0;
                          const stops = detailed.payment_methods.map((p, i) => {
                            const start = (acc / totalPaymentCount) * 360;
                            acc += p.count;
                            const end = (acc / totalPaymentCount) * 360;
                            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                            return `${color} ${start}deg ${end}deg`;
                          });
                          return `conic-gradient(${stops.join(', ')})`;
                        })(),
                      }}
                    >
                      <div className={styles.donutHoleSmall}>
                        <div className={styles.donutTotalSmall}>{totalPaymentCount}</div>
                        <div className={styles.donutLabel}>всього</div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      {detailed.payment_methods.map((p, i) => {
                        const percent = Math.round((p.count / totalPaymentCount) * 100);
                        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                        return (
                          <div key={p.method} className={styles.legendRow}>
                            <span className={styles.legendDot} style={{ background: color }} />
                            <span className={styles.legendName}>{PAYMENT_LABELS[p.method] || p.method}</span>
                            <span className={styles.legendPercent}>{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaTruck className={styles.cardIcon} /> Способи доставки
                </h2>
                {detailed.delivery_methods.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaInbox className={styles.emptyIcon} />
                    <p>Немає даних</p>
                  </div>
                ) : (
                  <div className={styles.donutWrap}>
                    <div
                      className={styles.donutSmall}
                      style={{
                        background: (() => {
                          let acc = 0;
                          const stops = detailed.delivery_methods.map((d, i) => {
                            const start = (acc / totalDeliveryCount) * 360;
                            acc += d.count;
                            const end = (acc / totalDeliveryCount) * 360;
                            const color = CATEGORY_COLORS[(i + 3) % CATEGORY_COLORS.length];
                            return `${color} ${start}deg ${end}deg`;
                          });
                          return `conic-gradient(${stops.join(', ')})`;
                        })(),
                      }}
                    >
                      <div className={styles.donutHoleSmall}>
                        <div className={styles.donutTotalSmall}>{totalDeliveryCount}</div>
                        <div className={styles.donutLabel}>всього</div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      {detailed.delivery_methods.map((d, i) => {
                        const percent = Math.round((d.count / totalDeliveryCount) * 100);
                        const color = CATEGORY_COLORS[(i + 3) % CATEGORY_COLORS.length];
                        return (
                          <div key={d.method} className={styles.legendRow}>
                            <span className={styles.legendDot} style={{ background: color }} />
                            <span className={styles.legendName}>{DELIVERY_LABELS[d.method] || d.method}</span>
                            <span className={styles.legendPercent}>{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`${styles.card} ${styles.lowStockCard}`}>
              <h2 className={styles.cardTitle}>
                <FaExclamationTriangle className={styles.cardIconWarn} /> Товари з низьким запасом
              </h2>
              {detailed.low_stock_products.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaInbox className={styles.emptyIcon} />
                  <p>Усі запаси в нормі</p>
                </div>
              ) : (
                <div className={styles.lowStockList}>
                  {detailed.low_stock_products.map(p => {
                    const critical = p.stock <= 3;
                    return (
                      <div
                        key={p.name}
                        className={`${styles.lowStockItem} ${critical ? styles.lowStockCritical : styles.lowStockWarn}`}
                      >
                        <div className={styles.lowStockInfo}>
                          <div className={styles.lowStockName}>{p.name}</div>
                          <div className={styles.lowStockCategory}>{p.category}</div>
                        </div>
                        <div className={styles.lowStockBadge}>
                          {p.stock} шт
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {advanced && (() => {
          const segTotal = advanced.customer_segmentation.reduce((s, x) => s + x.count, 0) || 1;
          const SEG_COLORS = ['#14b8a6', '#6366f1', '#ec4899'];
          const nvrTotal = advanced.new_vs_returning.new_customers + advanced.new_vs_returning.returning || 1;
          const retentionColor = advanced.retention_rate > 40 ? '#16a34a' : advanced.retention_rate >= 20 ? '#f59e0b' : '#dc2626';
          const maxWeekdayCount = Math.max(...advanced.orders_by_weekday.map(w => w.count), 1);
          const maxHourCount = Math.max(...advanced.orders_by_hour.map(h => h.count), 1);
          const topCities = advanced.orders_by_city.slice(0, 10);
          const topRevCities = advanced.revenue_by_city.slice(0, 10);
          const maxCityRev = Math.max(...topRevCities.map(c => c.revenue), 1);
          const FUNNEL_ORDER = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
          const funnelMap = new Map(advanced.status_funnel.map(s => [s.status, s.count]));
          const funnelData = FUNNEL_ORDER.map(st => ({ status: st, count: funnelMap.get(st) || 0 }));
          const maxFunnelCount = Math.max(...funnelData.map(f => f.count), 1);
          const cancelBg = advanced.cancellation_rate > 15 ? '#fef2f2' : advanced.cancellation_rate >= 5 ? '#fff7ed' : '#f0fdf4';
          const cancelColor = advanced.cancellation_rate > 15 ? '#dc2626' : advanced.cancellation_rate >= 5 ? '#f59e0b' : '#16a34a';
          const showPending = advanced.pending_orders.new_over_3d > 0 || advanced.pending_orders.processing_over_3d > 0;
          const topCrossSell = advanced.cross_sell_pairs.slice(0, 10);
          const topNeverSold = advanced.never_sold_products.slice(0, 10);
          const topOverstocked = advanced.overstocked_products.slice(0, 10);
          const saleTotal = advanced.sale_impact.regular_revenue + advanced.sale_impact.sale_revenue || 1;
          const regularDeg = (advanced.sale_impact.regular_revenue / saleTotal) * 360;
          const maxAov = Math.max(...advanced.aov_trend.map(a => a.aov), 1);
          const payTotal = advanced.revenue_by_payment_method.reduce((s, p) => s + p.revenue, 0) || 1;
          const PAY_COLORS: Record<string, string> = { card: '#14b8a6', cash: '#f59e0b', online: '#6366f1' };
          return (
            <>
              <div className={styles.sectionHeader}><FaUsers /> Клієнти</div>
              <div className={styles.advancedGrid}>
                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Сегментація клієнтів</h3>
                  <div className={styles.donutWrap}>
                    <div
                      className={styles.donutSmall}
                      style={{
                        background: (() => {
                          let acc = 0;
                          const stops = advanced.customer_segmentation.map((s, i) => {
                            const start = (acc / segTotal) * 360;
                            acc += s.count;
                            const end = (acc / segTotal) * 360;
                            return `${SEG_COLORS[i % SEG_COLORS.length]} ${start}deg ${end}deg`;
                          });
                          return `conic-gradient(${stops.join(', ')})`;
                        })(),
                      }}
                    >
                      <div className={styles.donutHoleSmall}>
                        <div className={styles.donutTotalSmall}>{segTotal}</div>
                        <div className={styles.donutLabel}>клієнтів</div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      {advanced.customer_segmentation.map((s, i) => {
                        const percent = Math.round((s.count / segTotal) * 100);
                        return (
                          <div key={s.bucket} className={styles.legendRow}>
                            <span className={styles.legendDot} style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
                            <span className={styles.legendName}>{s.bucket}</span>
                            <span className={styles.legendPercent}>{s.count} ({percent}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Нові vs Повторні</h3>
                  <div className={styles.nvrList}>
                    <div className={styles.nvrRow}>
                      <div className={styles.nvrHeader}>
                        <span>Нові</span>
                        <strong>{advanced.new_vs_returning.new_customers}</strong>
                      </div>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: `${(advanced.new_vs_returning.new_customers / nvrTotal) * 100}%`,
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.nvrRow}>
                      <div className={styles.nvrHeader}>
                        <span>Повторні</span>
                        <strong>{advanced.new_vs_returning.returning}</strong>
                      </div>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: `${(advanced.new_vs_returning.returning / nvrTotal) * 100}%`,
                            background: 'linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.bigStatRow}>
                    <div className={styles.bigStatIcon} style={{ background: '#ecfeff', color: '#0891b2' }}><FaUsers /></div>
                    <div>
                      <div className={styles.miniCardTitle}>Середня цінність клієнта (LTV)</div>
                      <div className={styles.bigStatValue}>{formatUAH(advanced.customer_lifetime_value)}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.bigStatRow}>
                    <div className={styles.bigStatIcon} style={{ background: `${retentionColor}1a`, color: retentionColor }}><FaRedo /></div>
                    <div>
                      <div className={styles.miniCardTitle}>Утримання клієнтів</div>
                      <div className={styles.bigStatValue} style={{ color: retentionColor }}>
                        {advanced.retention_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.sectionHeader}><FaClock /> Час та географія</div>
              <div className={styles.advancedGrid}>
                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Замовлення за днями тижня</h3>
                  <div className={styles.weekdayBars}>
                    {advanced.orders_by_weekday.map(w => {
                      const height = (w.count / maxWeekdayCount) * 100;
                      return (
                        <div key={w.day} className={styles.weekdayCol}>
                          <div className={styles.weekdayBarWrap} title={`${WEEKDAY_LABELS[w.day] || w.day}: ${w.count} зам., ${formatUAH(w.revenue)}`}>
                            <div className={styles.weekdayBar} style={{ height: `${height}%` }} />
                          </div>
                          <div className={styles.weekdayLabel}>{WEEKDAY_LABELS[w.day] || w.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Замовлення за годинами</h3>
                  <div className={styles.hourBars}>
                    {advanced.orders_by_hour.map(h => {
                      const height = (h.count / maxHourCount) * 100;
                      return (
                        <div
                          key={h.hour}
                          className={styles.hourBarWrap}
                          title={`${h.hour}:00 — ${h.count} зам., ${formatUAH(h.revenue)}`}
                        >
                          <div className={styles.hourBar} style={{ height: `${height}%` }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.hourAxis}>
                    {advanced.orders_by_hour.map(h => (
                      <div key={h.hour} className={styles.hourAxisLabel}>
                        {h.hour % 4 === 0 ? h.hour : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}><FaMapMarkerAlt className={styles.cardIcon} /> Замовлення за містами</h3>
                  {topCities.length === 0 ? (
                    <div className={styles.emptyState}><p>Немає даних</p></div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thRank}>#</th>
                          <th>Місто</th>
                          <th>Замовлень</th>
                          <th className={styles.thRevenue}>Виручка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCities.map((c, i) => (
                          <tr key={c.city}>
                            <td><div className={rankBadgeClass(i, styles.rankBadge)}>{i + 1}</div></td>
                            <td className={styles.prodName}>{c.city}</td>
                            <td className={styles.qty}>{c.count}</td>
                            <td className={styles.revenue}>{formatUAH(c.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}><FaMapMarkerAlt className={styles.cardIcon} /> Виручка за містами</h3>
                  <div className={styles.barList}>
                    {topRevCities.map(c => {
                      const percent = (c.revenue / maxCityRev) * 100;
                      return (
                        <div key={c.city} className={styles.barItem}>
                          <div className={styles.barContent}>
                            <div className={styles.barHeader}>
                              <span className={styles.barName}>{c.city}</span>
                              <span className={styles.barRevenue}>{formatUAH(c.revenue)}</span>
                            </div>
                            <div className={styles.barTrack}>
                              <div className={styles.barFill} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.sectionHeader}><FaFilter /> Воронка замовлень</div>
              <div className={styles.advancedGrid}>
                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Воронка статусів</h3>
                  <div className={styles.funnelList}>
                    {funnelData.map(f => {
                      const width = (f.count / maxFunnelCount) * 100;
                      const color = STATUS_COLORS[f.status] || '#94a3b8';
                      return (
                        <div key={f.status} className={styles.funnelRow}>
                          <div
                            className={styles.funnelBar}
                            style={{
                              width: `${Math.max(width, 12)}%`,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                            }}
                          >
                            <span>{STATUS_LABELS[f.status] || f.status}</span>
                            <strong>{f.count}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.miniCard} style={{ background: cancelBg }}>
                  <div className={styles.bigStatRow}>
                    <div className={styles.bigStatIcon} style={{ background: '#fff', color: cancelColor }}><FaBan /></div>
                    <div>
                      <div className={styles.miniCardTitle}>Скасування</div>
                      <div className={styles.bigStatValue} style={{ color: cancelColor }}>
                        {advanced.cancellation_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.bigStatRow}>
                    <div className={styles.bigStatIcon} style={{ background: '#ecfeff', color: '#0891b2' }}><FaClock /></div>
                    <div>
                      <div className={styles.miniCardTitle}>Середній час доставки</div>
                      <div className={styles.bigStatValue}>
                        {Math.round(advanced.avg_delivery_days * 10) / 10} днів
                      </div>
                    </div>
                  </div>
                </div>

                {showPending && (
                  <div className={`${styles.miniCard} ${styles.pendingAlert}`}>
                    <div className={styles.bigStatRow}>
                      <div className={styles.bigStatIcon} style={{ background: '#fff', color: '#c2410c' }}><FaExclamationTriangle /></div>
                      <div>
                        <div className={styles.miniCardTitle}>Застряглі замовлення</div>
                        <div className={styles.pendingList}>
                          <div>Нові &gt; 3 днів: <strong>{advanced.pending_orders.new_over_3d}</strong></div>
                          <div>В обробці &gt; 3 днів: <strong>{advanced.pending_orders.processing_over_3d}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.sectionHeader}><FaWarehouse /> Товари та запаси</div>
              <div className={styles.advancedGrid}>
                <div className={styles.miniCard}>
                  <div className={styles.bigStatRow}>
                    <div className={styles.bigStatIcon} style={{ background: '#f0fdfa', color: '#0d9488' }}><FaWarehouse /></div>
                    <div>
                      <div className={styles.miniCardTitle}>Загальна вартість запасів</div>
                      <div className={styles.bigStatValue}>{formatUAH(advanced.stock_value)}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Поєднання товарів (Cross-sell)</h3>
                  {topCrossSell.length === 0 ? (
                    <div className={styles.emptyState}><p>Немає даних</p></div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thRank}>#</th>
                          <th>Пара товарів</th>
                          <th className={styles.thRevenue}>Разом</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCrossSell.map((p, i) => (
                          <tr key={`${p.product_a}-${p.product_b}`}>
                            <td><div className={rankBadgeClass(i, styles.rankBadge)}>{i + 1}</div></td>
                            <td>
                              <div className={styles.crossSellRow}>
                                <div className={styles.crossSellName}><span className={styles.crossSellTag}>A</span> {p.product_a}</div>
                                <div className={styles.crossSellName}><span className={styles.crossSellTag}>B</span> {p.product_b}</div>
                              </div>
                            </td>
                            <td className={styles.qty}>{p.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Ніколи не продані</h3>
                  {topNeverSold.length === 0 ? (
                    <div className={styles.emptyState}><p>Усі товари продаються</p></div>
                  ) : (
                    <div className={styles.itemList}>
                      {topNeverSold.map(p => (
                        <div key={p.name} className={styles.neverSoldItem}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{p.name}</div>
                            <div className={styles.itemSub}>{p.category}</div>
                          </div>
                          <div className={styles.itemBadgeGroup}>
                            <span className={styles.badgeRed}>0 продажів</span>
                            <span className={styles.badgeNeutral}>{p.stock} шт</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Затоварені</h3>
                  {topOverstocked.length === 0 ? (
                    <div className={styles.emptyState}><p>Немає затоварених</p></div>
                  ) : (
                    <div className={styles.itemList}>
                      {topOverstocked.map(p => (
                        <div key={p.name} className={styles.overstockedItem}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{p.name}</div>
                          </div>
                          <span className={styles.badgeOrange}>{p.stock}/{p.sold_qty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.sectionHeader}><FaTags /> Фінанси</div>
              <div className={styles.advancedGrid}>
                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}><FaPercent className={styles.cardIcon} /> Вплив акцій</h3>
                  <div className={styles.saleImpactRow}>
                    <div className={styles.saleStat}>
                      <div className={styles.saleStatLabel}>Сума знижок</div>
                      <div className={styles.saleStatValue}>{formatUAH(advanced.sale_impact.total_discount_given)}</div>
                    </div>
                    <div className={styles.saleStat}>
                      <div className={styles.saleStatLabel}>Частка акційних</div>
                      <div className={styles.saleStatValue}>{advanced.sale_impact.sale_revenue_percent.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className={styles.donutWrap} style={{ marginTop: 16 }}>
                    <div
                      className={styles.donutSmall}
                      style={{
                        background: `conic-gradient(#14b8a6 0deg ${regularDeg}deg, #ec4899 ${regularDeg}deg 360deg)`,
                      }}
                    >
                      <div className={styles.donutHoleSmall}>
                        <div className={styles.donutTotalSmall}>{formatUAH(saleTotal)}</div>
                        <div className={styles.donutLabel}>всього</div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      <div className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: '#14b8a6' }} />
                        <span className={styles.legendName}>Звичайні</span>
                        <span className={styles.legendPercent}>{formatUAH(advanced.sale_impact.regular_revenue)}</span>
                      </div>
                      <div className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: '#ec4899' }} />
                        <span className={styles.legendName}>Акційні</span>
                        <span className={styles.legendPercent}>{formatUAH(advanced.sale_impact.sale_revenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>Тренд середнього чека (AOV)</h3>
                  <div className={styles.aovBars}>
                    {advanced.aov_trend.map(a => {
                      const height = (a.aov / maxAov) * 100;
                      return (
                        <div
                          key={a.date}
                          className={styles.aovBarWrap}
                          title={`${formatShortDate(a.date)} — ${formatUAH(a.aov)}`}
                        >
                          <div className={styles.aovBar} style={{ height: `${height}%` }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}><FaCreditCard className={styles.cardIcon} /> Виручка за способом оплати</h3>
                  <div className={styles.donutWrap}>
                    <div
                      className={styles.donutSmall}
                      style={{
                        background: (() => {
                          let acc = 0;
                          const stops = advanced.revenue_by_payment_method.map(p => {
                            const start = (acc / payTotal) * 360;
                            acc += p.revenue;
                            const end = (acc / payTotal) * 360;
                            const color = PAY_COLORS[p.method] || '#94a3b8';
                            return `${color} ${start}deg ${end}deg`;
                          });
                          return `conic-gradient(${stops.join(', ')})`;
                        })(),
                      }}
                    >
                      <div className={styles.donutHoleSmall}>
                        <div className={styles.donutTotalSmall}>{formatUAH(payTotal)}</div>
                        <div className={styles.donutLabel}>всього</div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      {advanced.revenue_by_payment_method.map(p => (
                        <div key={p.method} className={styles.legendRow}>
                          <span className={styles.legendDot} style={{ background: PAY_COLORS[p.method] || '#94a3b8' }} />
                          <span className={styles.legendName}>{PAYMENT_LABELS[p.method] || p.method}</span>
                          <span className={styles.legendPercent}>{formatUAH(p.revenue)} ({p.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </>
          );
        })()}
      </div>
    </>
  );
}
