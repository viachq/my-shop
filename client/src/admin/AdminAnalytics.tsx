import { FaChartLine, FaShoppingCart, FaUsers, FaBoxes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './AdminAnalytics.module.css';

const revenueData = [
  { month: 'Січ', value: 45200 },
  { month: 'Лют', value: 52100 },
  { month: 'Бер', value: 61300 },
  { month: 'Кві', value: 58700 },
];

const topProducts = [
  { name: 'iPhone 15 128GB Black', sales: 156, revenue: '6 082 844 грн' },
  { name: 'MacBook Air M2 13" 256GB', sales: 98, revenue: '4 409 902 грн' },
  { name: 'Apple AirPods Pro 2', sales: 87, revenue: '869 913 грн' },
  { name: 'Samsung Galaxy A55 5G', sales: 64, revenue: '863 936 грн' },
  { name: 'Sony WH-1000XM5', sales: 52, revenue: '623 948 грн' },
];

const categoryStats = [
  { name: 'Смартфони', percent: 32, color: '#e74c3c' },
  { name: 'Ноутбуки', percent: 24, color: '#3498db' },
  { name: 'Навушники', percent: 18, color: '#f39c12' },
  { name: 'Планшети', percent: 12, color: '#2ecc71' },
  { name: 'Інше', percent: 14, color: '#9b59b6' },
];

const maxRevenue = Math.max(...revenueData.map(d => d.value));

export default function AdminAnalytics() {
  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Аналітика</h1>
        <div className={styles.period}>
          <button className={styles.periodBtn}>Тиждень</button>
          <button className={`${styles.periodBtn} ${styles.periodActive}`}>Місяць</button>
          <button className={styles.periodBtn}>Рік</button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.kpis}>
          <div className={styles.kpi}>
            <div className={`${styles.kpiIcon} ${styles.kpiBlue}`}><FaChartLine /></div>
            <div>
              <div className={styles.kpiLabel}>Дохід за місяць</div>
              <div className={styles.kpiValue}>58 700 грн</div>
              <div className={`${styles.kpiChange} ${styles.up}`}><FaArrowUp /> 12.4%</div>
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={`${styles.kpiIcon} ${styles.kpiGreen}`}><FaShoppingCart /></div>
            <div>
              <div className={styles.kpiLabel}>Замовлень</div>
              <div className={styles.kpiValue}>156</div>
              <div className={`${styles.kpiChange} ${styles.up}`}><FaArrowUp /> 8.2%</div>
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={`${styles.kpiIcon} ${styles.kpiOrange}`}><FaUsers /></div>
            <div>
              <div className={styles.kpiLabel}>Нових клієнтів</div>
              <div className={styles.kpiValue}>42</div>
              <div className={`${styles.kpiChange} ${styles.down}`}><FaArrowDown /> 3.1%</div>
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={`${styles.kpiIcon} ${styles.kpiPurple}`}><FaBoxes /></div>
            <div>
              <div className={styles.kpiLabel}>Середній чек</div>
              <div className={styles.kpiValue}>376 грн</div>
              <div className={`${styles.kpiChange} ${styles.up}`}><FaArrowUp /> 5.7%</div>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Дохід по місяцях</h2>
            <div className={styles.chart}>
              {revenueData.map(d => (
                <div key={d.month} className={styles.bar}>
                  <div className={styles.barValue}>{(d.value / 1000).toFixed(1)}k</div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ height: `${(d.value / maxRevenue) * 100}%` }} />
                  </div>
                  <div className={styles.barLabel}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Продажі по категоріях</h2>
            <div className={styles.categories}>
              {categoryStats.map(c => (
                <div key={c.name} className={styles.catRow}>
                  <div className={styles.catInfo}>
                    <span className={styles.catDot} style={{ background: c.color }} />
                    <span>{c.name}</span>
                  </div>
                  <div className={styles.catBarWrap}>
                    <div className={styles.catBar} style={{ width: `${c.percent}%`, background: c.color }} />
                  </div>
                  <span className={styles.catPercent}>{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Топ-5 товарів</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Товар</th>
                <th>Продажі</th>
                <th>Дохід</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name}>
                  <td className={styles.rank}>{i + 1}</td>
                  <td className={styles.prodName}>{p.name}</td>
                  <td>{p.sales} шт</td>
                  <td className={styles.revenue}>{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
