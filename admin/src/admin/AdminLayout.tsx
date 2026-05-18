import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaBoxes, FaShoppingCart, FaUsers, FaChartBar, FaTag, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import { logout, getAdminRole, getAdminName } from './AdminAuth';
import { useTheme } from '../context/ThemeContext';
import styles from './AdminLayout.module.css';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Суперадмін',
  admin: 'Адміністратор',
  manager: 'Менеджер',
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: '#c42a2c',
  admin: '#c42a2c',
  manager: '#2a7fc4',
};

export default function AdminLayout() {
  const role = getAdminRole() || 'admin';
  const name = getAdminName() || 'Адмін';
  const { theme, toggle } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navActive : ''}`;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isTop = role === 'superadmin' || role === 'admin';
  const showProducts = isTop || role === 'manager';
  const showOrders = isTop || role === 'manager';
  const showUsers = isTop;
  const showAnalytics = isTop;
  const showPromoCodes = isTop;

  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap} ref={profileRef}>
          <button
            className={styles.logo}
            onClick={() => setProfileOpen(v => !v)}
            title="Профіль"
          >
            <span className={styles.logoMark}><span className={styles.logoT}>T</span><span className={styles.logoAccent}>B</span></span>
          </button>

          {profileOpen && (
            <div className={styles.profileCard}>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{name}</span>
                <span
                  className={styles.profileRole}
                  style={{ background: `${ROLE_COLORS[role] || '#c42a2c'}18`, color: ROLE_COLORS[role] || '#c42a2c' }}
                >
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button className={styles.profileAction} onClick={toggle}>
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                  <span>{theme === 'dark' ? 'Світла' : 'Темна'}</span>
                </button>
                <button className={`${styles.profileAction} ${styles.profileActionDanger}`} onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Вийти</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {showAnalytics && <NavLink to="/" end className={linkClass} title="Статистика"><FaChartBar /></NavLink>}
          {showProducts && <NavLink to="/products" className={linkClass} title="Товари"><FaBoxes /></NavLink>}
          {showOrders && <NavLink to="/orders" className={linkClass} title="Замовлення"><FaShoppingCart /></NavLink>}
          {showUsers && <NavLink to="/users" className={linkClass} title="Користувачі"><FaUsers /></NavLink>}
          {showPromoCodes && <NavLink to="/promocodes" className={linkClass} title="Промокоди"><FaTag /></NavLink>}
        </nav>

      </aside>

      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
