import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaBoxes, FaShoppingCart, FaUsers, FaChartBar, FaTag, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { logout, getAdminRole, getAdminName } from './AdminAuth';
import styles from './AdminLayout.module.css';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Суперадмін',
  admin: 'Адміністратор',
  manager: 'Менеджер',
  warehouse: 'Комірник',
};

export default function AdminLayout() {
  const role = getAdminRole() || 'admin';
  const name = getAdminName() || 'Адмін';
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navActive : ''}`;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const badgeClass = `${styles.badge} ${role === 'manager' ? styles.badgeManager : role === 'warehouse' ? styles.badgeWarehouse : ''}`;

  const isTop = role === 'superadmin' || role === 'admin';
  const showProducts = isTop || role === 'warehouse';
  const showOrders = isTop || role === 'manager';
  const showUsers = isTop;
  const showAnalytics = isTop;
  const showPromoCodes = isTop;
  const showSettings = isTop;

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>

        <button className={styles.logo} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Розгорнути' : 'Згорнути'}>
          <div className={styles.logoIcon}>T</div>
          <span className={styles.logoText}>TechBox</span>
          {role !== 'superadmin' && <span className={badgeClass}>{ROLE_LABELS[role]}</span>}
        </button>

        <nav className={styles.nav}>
          {showAnalytics && <NavLink to="/" end className={linkClass} title="Аналітика"><FaChartBar /><span>Аналітика</span></NavLink>}
          {showProducts && <NavLink to="/products" className={linkClass} title="Товари"><FaBoxes /><span>Товари</span></NavLink>}
          {showOrders && <NavLink to="/orders" className={linkClass} title="Замовлення"><FaShoppingCart /><span>Замовлення</span></NavLink>}
          {showUsers && <NavLink to="/users" className={linkClass} title="Користувачі"><FaUsers /><span>Користувачі</span></NavLink>}
          {showPromoCodes && <NavLink to="/promocodes" className={linkClass} title="Промокоди"><FaTag /><span>Промокоди</span></NavLink>}
          {showSettings && <NavLink to="/settings" className={linkClass} title="Налаштування"><FaCog /><span>Налаштування</span></NavLink>}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <FaUserCircle className={styles.sidebarUserIcon} />
            <div className={styles.sidebarUserDetails}>
              <span className={styles.sidebarUserName}>{name}</span>
              <span className={`${styles.sidebarUserRole} ${styles[`role_${role}`]}`}>
                {ROLE_LABELS[role] || 'Адміністратор'}
              </span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Вийти">
            <FaSignOutAlt /><span>Вийти</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
