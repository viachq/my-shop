import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaSearch, FaChevronDown, FaShieldAlt, FaUsers, FaUserTie, FaShoppingCart, FaUserSlash, FaCalendarPlus } from 'react-icons/fa';
import { getAdminRole } from './AdminAuth';
import styles from './AdminUsers.module.css';

const API_BASE = '/api';

type Role = 'superadmin' | 'admin' | 'manager' | 'customer';

interface UserOut {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  order_count: number;
  total_spent: number;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  superadmin: 'Суперадмін',
  admin: 'Адміністратор',
  manager: 'Менеджер',
  customer: 'Покупець',
};

const tabLabels: Record<string, string> = {
  all: 'Усі',
  superadmin: 'Суперадмін',
  admin: 'Адмін',
  manager: 'Менеджер',
  customer: 'Клієнти',
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function canChangeRole(myRole: string, targetRole: Role): boolean {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && myRole !== 'superadmin') return false;
  return true;
}

function getAllowedRoles(myRole: string): Role[] {
  if (myRole === 'superadmin') return ['admin', 'manager', 'customer'];
  return ['manager', 'customer'];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMoney(v: number | string): string {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Math.round(n).toLocaleString('uk-UA');
}

export default function AdminUsers() {
  const myRole = getAdminRole() || 'admin';
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/users/`, { headers: authHeaders() });
      if (res.status === 401) { localStorage.removeItem('adminAuth'); localStorage.removeItem('adminToken'); window.location.href = '/'; return; }
      if (!res.ok) throw new Error(`Помилка завантаження: ${res.status}`);
      const data: UserOut[] = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const changeRole = async (userId: number, newRole: Role) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error(`Помилка: ${res.status}`);
      await fetchUsers();
    } catch (err: unknown) {
      console.error(err);
    }
    setRoleDropdownId(null);
  };

  const roleCounts = useMemo(() => ({
    all: users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    customer: users.filter(u => u.role === 'customer').length,
  }), [users]);

  const totalOrders = useMemo(() => users.reduce((s, u) => s + u.order_count, 0), [users]);

  const newThisMonth = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return users.filter(u => new Date(u.created_at) >= monthAgo).length;
  }, [users]);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Пошук за ім'ям, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${roleFilter === key ? styles.filterActive : ''}`}
              onClick={() => setRoleFilter(key)}
            >{label}</button>
          ))}
        </div>
        <span className={styles.topBarCount}>Знайдено: <strong>{filtered.length}</strong></span>
      </div>
      <div className={styles.content}>
        {loading ? (
          <SkeletonPage />
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>!</div>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className={styles.statsStrip}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_teal}`}><FaUsers /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{roleCounts.all}</div>
                  <div className={styles.statLabel}>Всього користувачів</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_red}`}><FaUserTie /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{roleCounts.superadmin + roleCounts.admin}</div>
                  <div className={styles.statLabel}>Адміністратори</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_orange}`}><FaShoppingCart /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{totalOrders}</div>
                  <div className={styles.statLabel}>Замовлень</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.tone_green}`}><FaCalendarPlus /></div>
                <div className={styles.statBody}>
                  <div className={styles.statValue}>{newThisMonth}</div>
                  <div className={styles.statLabel}>Нових за місяць</div>
                </div>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Користувач</th>
                    <th>Телефон</th>
                    <th>Роль</th>
                    <th>Замовлень</th>
                    <th>Сума</th>
                    <th>Реєстрація</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <UserRow
                      key={u.id}
                      user={u}
                      myRole={myRole}
                      isDropdownOpen={roleDropdownId === u.id}
                      onToggleDropdown={() => setRoleDropdownId(roleDropdownId === u.id ? null : u.id)}
                      onChangeRole={r => changeRole(u.id, r)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.empty}>
                          <FaUserSlash className={styles.emptyIcon} />
                          <p className={styles.emptyTitle}>Користувачів не знайдено</p>
                          <p className={styles.emptyHint}>Спробуйте змінити фільтр або пошуковий запит</p>
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

function UserRow({ user, myRole, isDropdownOpen, onToggleDropdown, onChangeRole }: {
  user: UserOut;
  myRole: string;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onChangeRole: (r: Role) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const editable = canChangeRole(myRole, user.role);
  const allowedRoles = getAllowedRoles(myRole);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) onToggleDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen, onToggleDropdown]);

  return (
    <tr>
      <td>
        <div className={styles.userCell}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        </div>
      </td>
      <td>{user.phone || <span className={styles.muted}>—</span>}</td>
      <td>
        <div className={styles.roleWrap} ref={dropRef}>
          {editable ? (
            <span
              className={`${styles.role} ${styles[`role_${user.role}`]} ${styles.roleClickable}`}
              onClick={onToggleDropdown}
            >
              {roleLabels[user.role]} <FaChevronDown className={styles.roleChevron} />
            </span>
          ) : (
            <span className={`${styles.role} ${styles[`role_${user.role}`]}`}>
              <FaShieldAlt style={{ fontSize: 9, marginRight: 4 }} />
              {roleLabels[user.role]}
            </span>
          )}
          {isDropdownOpen && editable && (
            <div className={styles.roleDropdown}>
              {allowedRoles.map(r => (
                <button
                  key={r}
                  className={`${styles.roleOption} ${r === user.role ? styles.roleOptionActive : ''}`}
                  onClick={() => onChangeRole(r)}
                >
                  <span className={`${styles.roleDot} ${styles[`dot_${r}`]}`} />
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className={styles.numCell}>{user.order_count}</td>
      <td className={styles.numCell}>{Number(user.total_spent) > 0 ? `${formatMoney(user.total_spent)} ₴` : <span className={styles.muted}>—</span>}</td>
      <td className={styles.dateCell}>{formatDate(user.created_at)}</td>
    </tr>
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
      <div className={styles.tableWrap}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skelRow}>
            <div className={styles.skelRowText}>
              <div className={`${styles.skeleton} ${styles.skelLineLg}`} />
              <div className={`${styles.skeleton} ${styles.skelLineSm}`} />
            </div>
            <div className={`${styles.skeleton} ${styles.skelBadge}`} />
            <div className={`${styles.skeleton} ${styles.skelBadge}`} />
          </div>
        ))}
      </div>
    </>
  );
}
