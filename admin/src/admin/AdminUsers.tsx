import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEdit, FaTrash, FaShieldAlt, FaUsers, FaUserTie, FaUserCog, FaUserFriends, FaUserSlash } from 'react-icons/fa';
import { getAdminRole } from './AdminAuth';
import styles from './AdminUsers.module.css';

const API_BASE = '/api';

type Role = 'superadmin' | 'admin' | 'manager' | 'warehouse' | 'customer';

interface UserOut {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  created_at: string;
}

const roleLabels: Record<Role, string> = {
  superadmin: 'Суперадмін',
  admin: 'Адміністратор',
  manager: 'Менеджер',
  warehouse: 'Комірник',
  customer: 'Покупець',
};

const tabLabels: Record<string, string> = {
  all: 'Усі',
  superadmin: 'Суперадмін',
  admin: 'Адмін',
  manager: 'Менеджер',
  warehouse: 'Склад',
  customer: 'Клієнти',
};

const AVATAR_COLORS = [
  '#14b8a6', '#0891b2', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981',
];

function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function canEditUser(myRole: string, targetRole: Role): boolean {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && myRole !== 'superadmin') return false;
  return true;
}

function canDeleteUser(myRole: string, targetRole: Role): boolean {
  return canEditUser(myRole, targetRole);
}

function getAllowedRoles(myRole: string): Role[] {
  if (myRole === 'superadmin') return ['admin', 'manager', 'warehouse', 'customer'];
  return ['manager', 'warehouse', 'customer'];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function AdminUsers() {
  const myRole = getAdminRole() || 'admin';
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editing, setEditing] = useState<UserOut | null>(null);

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

  const handleDelete = async (id: number) => {
    const target = users.find(u => u.id === id);
    if (!target || !canDeleteUser(myRole, target.role)) return;
    if (!confirm('Видалити цього користувача?')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Помилка видалення: ${res.status}`);
      await fetchUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Помилка видалення');
    }
  };

  const handleSaved = async () => {
    setEditing(null);
    await fetchUsers();
  };

  if (editing) {
    return (
      <UserForm
        user={editing}
        myRole={myRole}
        onSave={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const roleCounts = {
    all: users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    warehouse: users.filter(u => u.role === 'warehouse').length,
    customer: users.filter(u => u.role === 'customer').length,
  };

  const adminTotal = roleCounts.superadmin + roleCounts.admin;

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
        <div className={styles.roleTabs}>
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.roleTab} ${roleFilter === key ? styles.tabActive : ''}`}
              onClick={() => setRoleFilter(key)}
            >
              {label} <span className={styles.tabCount}>{roleCounts[key as keyof typeof roleCounts]}</span>
            </button>
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
              <StatCard
                icon={<FaUsers />}
                label="Всього користувачів"
                value={roleCounts.all}
                tone="teal"
              />
              <StatCard
                icon={<FaUserTie />}
                label="Адміністратори"
                value={adminTotal}
                tone="red"
              />
              <StatCard
                icon={<FaUserCog />}
                label="Менеджери"
                value={roleCounts.manager}
                tone="orange"
              />
              <StatCard
                icon={<FaUserFriends />}
                label="Покупці"
                value={roleCounts.customer}
                tone="green"
              />
            </div>


            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Користувач</th>
                    <th>Телефон</th>
                    <th>Роль</th>
                    <th>Реєстрація</th>
                    <th className={styles.actionsCol}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div
                            className={`${styles.avatar} ${u.role === 'superadmin' ? styles.avatarSuper : ''}`}
                            style={u.role === 'superadmin' ? undefined : { background: avatarColor(u.id) }}
                          >
                            {u.role === 'superadmin' ? <FaShieldAlt /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{u.name}</span>
                            <span className={styles.userEmail}>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || <span className={styles.muted}>—</span>}</td>
                      <td><span className={`${styles.role} ${styles[`role_${u.role}`]}`}>{roleLabels[u.role]}</span></td>
                      <td className={styles.dateCell}>{formatDate(u.created_at)}</td>
                      <td>
                        <div className={styles.actions}>
                          {canEditUser(myRole, u.role) ? (
                            <>
                              <button className={styles.actionBtn} title="Редагувати" onClick={() => setEditing(u)}>
                                <FaEdit />
                              </button>
                              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Видалити" onClick={() => handleDelete(u.id)}>
                                <FaTrash />
                              </button>
                            </>
                          ) : (
                            <span className={styles.protected}><FaShieldAlt /> Захищено</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5}>
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
            <div className={`${styles.skeleton} ${styles.skelAvatar}`} />
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

function UserForm({ user, myRole, onSave, onCancel }: {
  user: UserOut;
  myRole: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const allowedRoles = getAllowedRoles(myRole);
  const [role, setRole] = useState<Role>(allowedRoles.includes(user.role) ? user.role : allowedRoles[allowedRoles.length - 1]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, email, phone: phone || null, role }),
      });
      if (!res.ok) throw new Error(`Помилка збереження: ${res.status}`);
      onSave();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Помилка збереження');
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onCancel}>← Назад</button>
        <h1 className={styles.title}>Редагувати користувача</h1>
      </div>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Ім'я</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Телефон</label>
              <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Роль</label>
              <select className={styles.input} value={role} onChange={e => setRole(e.target.value as Role)}>
                {allowedRoles.map(r => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Скасувати</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
