import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { FaLaptop, FaTachometerAlt, FaBoxes, FaShoppingCart, FaUsers, FaChartBar, FaArrowLeft, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { logout, getAdminRole, getAdminName } from './AdminAuth';
import styles from './AdminLayout.module.css';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Адміністратор',
  manager: 'Менеджер',
  warehouse: 'Комірник',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const role = getAdminRole() || 'admin';
  const name = getAdminName() || 'Адмін';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navActive : ''}`;

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const badgeClass = `${styles.badge} ${role === 'manager' ? styles.badgeManager : role === 'warehouse' ? styles.badgeWarehouse : ''}`;

  const showProducts = role === 'admin' || role === 'warehouse';
  const showOrders = role === 'admin' || role === 'manager';
  const showUsers = role === 'admin';
  const showAnalytics = role === 'admin';

  const showContentSection = showProducts;
  const showManagementSection = showOrders || showUsers || showAnalytics;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><FaLaptop /></div>
          TechBox
          <span className={badgeClass}>{ROLE_LABELS[role] || 'Admin'}</span>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navLabel}>Головне</div>
            <NavLink to="/admin" end className={linkClass}><FaTachometerAlt /> Дашборд</NavLink>
          </div>
          {showContentSection && (
            <div className={styles.navSection}>
              <div className={styles.navLabel}>Контент</div>
              {showProducts && <NavLink to="/admin/products" className={linkClass}><FaBoxes /> Товари</NavLink>}
            </div>
          )}
          {showManagementSection && (
            <div className={styles.navSection}>
              <div className={styles.navLabel}>Управління</div>
              {showOrders && <NavLink to="/admin/orders" className={linkClass}><FaShoppingCart /> Замовлення</NavLink>}
              {showUsers && <NavLink to="/admin/users" className={linkClass}><FaUsers /> Користувачі</NavLink>}
              {showAnalytics && <NavLink to="/admin/analytics" className={linkClass}><FaChartBar /> Аналітика</NavLink>}
            </div>
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUserInfo}>
            <FaUserCircle className={styles.sidebarUserIcon} />
            <div className={styles.sidebarUserDetails}>
              <span className={styles.sidebarUserName}>{name}</span>
              <span className={`${styles.sidebarUserRole} ${role === 'manager' ? styles.sidebarUserRoleManager : role === 'warehouse' ? styles.sidebarUserRoleWarehouse : styles.sidebarUserRoleAdmin}`}>
                {ROLE_LABELS[role] || 'Адміністратор'}
              </span>
            </div>
          </div>
          <Link to="/" className={styles.backLink}><FaArrowLeft /> На сайт</Link>
          <button className={styles.logoutBtn} onClick={handleLogout}><FaSignOutAlt /> Вийти</button>
        </div>
      </aside>
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
