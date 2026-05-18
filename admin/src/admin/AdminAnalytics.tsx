import { useEffect, useState } from 'react';
import {
  FaMoneyBillWave, FaShoppingCart, FaUserPlus, FaChartLine,
  FaTrophy, FaMedal, FaAward, FaExclamationTriangle,
} from 'react-icons/fa';
import styles from './AdminAnalytics.module.css';

const API = '/api';
const PRESETS = [{ label: '7д', days: 7 }, { label: '30д', days: 30 }];
const STATUS_ORDER = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

const toISO = (d: Date) => d.toISOString().slice(0, 10);
const daysAgoISO = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };
const STATUS_LABELS: Record<string, string> = {
  new: 'Нові', processing: 'В обробці', shipped: 'Відправлені',
  delivered: 'Доставлені', cancelled: 'Скасовані',
};
const STATUS_COLORS: Record<string, string> = {
  new: '#60a5fa', processing: '#fb923c', shipped: '#a78bfa',
  delivered: '#4ade80', cancelled: '#f87171',
};

interface TopProduct { name: string; total_qty: number; total_revenue: number; }
interface AnalyticsSummary {
  total_revenue: number; orders_count: number;
  new_customers: number; new_customers_today: number; new_customers_week: number;
  average_check: number; top_products: TopProduct[]; days: number;
}
interface RevenueByDay { date: string; revenue: number; orders: number; }
interface OrdersByStatus { status: string; count: number; }
interface LowStockProduct { name: string; stock: number; category: string; }
interface AnalyticsDetailed {
  revenue_by_day: RevenueByDay[];
  orders_by_status: OrdersByStatus[];
  low_stock_products: LowStockProduct[];
}

function fmt(v: number) {
  return (Number(v) || 0).toLocaleString('uk-UA', { maximumFractionDigits: 0 }) + ' грн';
}
function fmtDate(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function rankIcon(i: number) {
  if (i === 0) return <FaTrophy />;
  if (i === 1) return <FaMedal />;
  if (i === 2) return <FaAward />;
  return i + 1;
}
function rankClass(i: number) {
  if (i === 0) return `${styles.rankBadge} ${styles.rankGold}`;
  if (i === 1) return `${styles.rankBadge} ${styles.rankSilver}`;
  if (i === 2) return `${styles.rankBadge} ${styles.rankBronze}`;
  return styles.rankBadge;
}

export default function AdminAnalytics() {
  const [fromDate, setFromDate] = useState(() => daysAgoISO(30));
  const [toDate, setToDate] = useState(() => toISO(new Date()));
  const [activeDays, setActiveDays] = useState<number | null>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [detailed, setDetailed] = useState<AnalyticsDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const selectPreset = (days: number) => {
    setFromDate(daysAgoISO(days));
    setToDate(toISO(new Date()));
    setActiveDays(days);
  };

  useEffect(() => {
    setLoading(true);
    const get = async (url: string) => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.status === 401) {
        const { logout } = await import('./AdminAuth');
        logout(); window.location.href = '/'; throw new Error('401');
      }
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    };
    setHoveredDay(null);
    const qs = `start_date=${fromDate}&end_date=${toDate}`;
    Promise.all([
      get(`${API}/analytics/summary?${qs}`),
      get(`${API}/analytics/detailed?${qs}`),
    ])
      .then(([s, d]) => { setData(s); setDetailed(d); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const rangeDays = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86_400_000);
  const dayRevenue = detailed?.revenue_by_day ?? [];
  const statuses = detailed?.orders_by_status ?? [];
  const lowStock = detailed?.low_stock_products ?? [];
  const products = data?.top_products ?? [];
  const maxRev = Math.max(...dayRevenue.map(d => d.revenue), 1);
  const totalStatusCount = statuses.reduce((s, x) => s + x.count, 0) || 1;
  const W = 600, H = 180, padT = 14, innerH = H - padT;

  const pts = dayRevenue.length >= 2
    ? dayRevenue.map((d, i) => ({
      x: (i / (dayRevenue.length - 1)) * W,
      y: padT + innerH * (1 - d.revenue / maxRev),
    }))
    : [];

  const todayISO = toISO(new Date());

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.filterGroup}>
          {PRESETS.map(p => (
            <button
              key={p.days}
              className={`${styles.filterBtn} ${activeDays === p.days ? styles.filterActive : ''}`}
              onClick={() => selectPreset(p.days)}
            >{p.label}</button>
          ))}
        </div>
        <div className={styles.dateRange}>
          <input
            type="date" className={styles.dateInput} value={fromDate} max={toDate}
            onChange={e => { setFromDate(e.target.value); setActiveDays(null); }}
          />
          <span className={styles.dateSep}>—</span>
          <input
            type="date" className={styles.dateInput} value={toDate}
            min={fromDate} max={todayISO}
            onChange={e => { setToDate(e.target.value); setActiveDays(null); }}
          />
        </div>
        <span className={styles.topBarCount}>Період: <strong>{rangeDays} днів</strong></span>
      </div>

      <div className={styles.content}>
        {loading && !data ? (
          <SkeletonPage />
        ) : (
          <>
            <div className={styles.statsStrip}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_red}`}><FaMoneyBillWave /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{fmt(data?.total_revenue ?? 0)}</div>
                  <div className={styles.statLabel}>Дохід</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_blue}`}><FaShoppingCart /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{data?.orders_count ?? 0}</div>
                  <div className={styles.statLabel}>Замовлень</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_green}`}><FaUserPlus /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{data?.new_customers ?? 0}</div>
                  <div className={styles.statLabel}>Нових клієнтів</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_orange}`}><FaChartLine /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{fmt(data?.average_check ?? 0)}</div>
                  <div className={styles.statLabel}>Середній чек</div>
                </div>
              </div>
            </div>

            {/* Revenue chart */}
            <div className={styles.chartSection}>
              <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                  <FaChartLine className={styles.cardHeaderIcon} /> Дохід за {rangeDays} днів
                </div>
                {dayRevenue.length < 2 ? (
                  <div className={styles.empty}>Немає даних за цей період</div>
                ) : (
                  <div className={styles.chartWrap}>
                    <div className={styles.chartContainer}>
                      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
                        preserveAspectRatio="none" className={styles.chartSvg}>
                        <defs>
                          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c42a2c" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#c42a2c" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[0.25, 0.5, 0.75].map(f => (
                          <line key={f} x1={0} y1={padT + innerH * (1 - f)} x2={W} y2={padT + innerH * (1 - f)}
                            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                        ))}
                        <polygon points={[...pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`), `${W},${H}`, `0,${H}`].join(' ')} fill="url(#dg)" />
                        <polyline points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#c42a2c" strokeWidth={2}
                          vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                        {hoveredDay !== null && pts[hoveredDay] && (
                          <line x1={pts[hoveredDay].x} y1={0} x2={pts[hoveredDay].x} y2={H}
                            stroke="rgba(255,255,255,0.08)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                        )}
                        {pts.map((p, i) => {
                          const x0 = i === 0 ? 0 : (pts[i - 1].x + p.x) / 2;
                          const x1 = i === pts.length - 1 ? W : (p.x + pts[i + 1].x) / 2;
                          return <rect key={i} x={x0} y={0} width={x1 - x0} height={H} fill="transparent"
                            onMouseEnter={() => setHoveredDay(i)}
                            onMouseLeave={() => setHoveredDay(null)} />;
                        })}
                      </svg>
                      {hoveredDay !== null && pts[hoveredDay] && (
                        <div className={styles.chartTooltip} style={{
                          left: `${(pts[hoveredDay].x / W) * 100}%`,
                          top: `${(pts[hoveredDay].y / H) * 100}%`,
                        }}>
                          <div className={styles.tooltipDate}>{fmtDate(dayRevenue[hoveredDay].date)}</div>
                          <div className={styles.tooltipRow}><span>Дохід:</span><strong>{fmt(dayRevenue[hoveredDay].revenue)}</strong></div>
                          <div className={styles.tooltipRow}><span>Замовлень:</span><strong>{dayRevenue[hoveredDay].orders}</strong></div>
                        </div>
                      )}
                    </div>
                    <div className={styles.chartAxis}>
                      {dayRevenue.map((d, i) => (
                        <div key={d.date} className={styles.chartAxisLabel}>
                          {i % Math.ceil(dayRevenue.length / 6) === 0 ? fmtDate(d.date) : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status donut + Top products */}
            <div className={styles.bottomGrid}>
              <div className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                  <FaShoppingCart className={styles.cardHeaderIcon} /> За статусом
                </div>
                <div className={styles.donutWrap}>
                  <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                    {(() => {
                      let offset = 0;
                      const total = statuses.reduce((s, x) => s + x.count, 0) || 1;
                      return STATUS_ORDER.map(key => {
                        const s = statuses.find(x => x.status === key);
                        const count = s?.count ?? 0;
                        const pct = count / total;
                        const circumference = 2 * Math.PI * 45;
                        const dash = pct * circumference;
                        const gap = circumference - dash;
                        const rotation = offset * 360 - 90;
                        offset += pct;
                        if (count === 0) return null;
                        return (
                          <circle key={key} cx="60" cy="60" r="45" fill="none"
                            stroke={STATUS_COLORS[key]} strokeWidth="16"
                            strokeDasharray={`${dash} ${gap}`}
                            transform={`rotate(${rotation} 60 60)`} />
                        );
                      });
                    })()}
                    <text x="60" y="56" textAnchor="middle" fill="var(--fg)" fontSize="22" fontWeight="800">
                      {statuses.reduce((s, x) => s + x.count, 0)}
                    </text>
                    <text x="60" y="72" textAnchor="middle" fill="var(--text-light)" fontSize="9" fontWeight="600">
                      ЗАМОВЛЕНЬ
                    </text>
                  </svg>
                </div>
                <div className={styles.statusLegend}>
                  {STATUS_ORDER.map(key => {
                    const s = statuses.find(x => x.status === key);
                    const count = s?.count ?? 0;
                    return (
                      <div key={key} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: STATUS_COLORS[key] }} />
                        <span className={styles.legendLabel}>{STATUS_LABELS[key]}</span>
                        <span className={styles.legendCount}>{count}</span>
                        <span className={styles.legendPct}>{Math.round((count / totalStatusCount) * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                  <FaTrophy className={styles.cardHeaderIcon} /> Топ-5 товарів
                </div>
                {products.length === 0 ? (
                  <div className={styles.empty}>Немає продажів за цей період</div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.thNum}>#</th>
                        <th>Товар</th>
                        <th>Кількість</th>
                        <th className={styles.thRight}>Дохід</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.name}>
                          <td><div className={rankClass(i)}>{rankIcon(i)}</div></td>
                          <td className={styles.prodName}>{p.name}</td>
                          <td className={styles.tdQty}>{p.total_qty} шт</td>
                          <td className={styles.tdRev}>{fmt(p.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Low stock */}
            {lowStock.length > 0 && (
              <div className={`${styles.sectionCard} ${styles.lowSection}`}>
                <div className={styles.cardHeader}>
                  <FaExclamationTriangle style={{ color: '#f59e0b' }} /> Низький запас
                </div>
                <div className={styles.lowList}>
                  {lowStock.map(p => (
                    <div key={p.name} className={`${styles.lowItem} ${p.stock <= 3 ? styles.lowCritical : styles.lowWarn}`}>
                      <div className={styles.lowInfo}>
                        <div className={styles.lowName}>{p.name}</div>
                        <div className={styles.lowCat}>{p.category}</div>
                      </div>
                      <div className={styles.lowBadge}>{p.stock} шт</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
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
      <div className={`${styles.skeleton} ${styles.skelChart}`} />
      <div className={styles.bottomGrid}>
        <div className={`${styles.skeleton} ${styles.skelCard}`} />
        <div className={`${styles.skeleton} ${styles.skelCard}`} />
      </div>
    </>
  );
}
