import { useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import styles from './AdminUsers.module.css';

type Role = 'admin' | 'manager' | 'warehouse' | 'customer';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  registered: string;
  orders: number;
}

const roleLabels: Record<Role, string> = {
  admin: 'Адміністратор',
  manager: 'Менеджер',
  warehouse: 'Комірник',
  customer: 'Покупець',
};

const mockUsers: User[] = [
  { id: 'u1', name: 'Адмін TechBox', email: 'admin@techbox.ua', phone: '+380671000001', role: 'admin', registered: '2025-01-15', orders: 0 },
  { id: 'u2', name: 'Ольга Менеджер', email: 'olga@techbox.ua', phone: '+380671000002', role: 'manager', registered: '2025-03-10', orders: 0 },
  { id: 'u3', name: 'Сергій Комірник', email: 'sergiy@techbox.ua', phone: '+380671000003', role: 'warehouse', registered: '2025-04-01', orders: 0 },
  { id: 'u4', name: 'Олена Коваленко', email: 'olena.k@gmail.com', phone: '+380671234567', role: 'customer', registered: '2026-02-14', orders: 12 },
  { id: 'u5', name: 'Андрій Шевченко', email: 'a.shevchenko@gmail.com', phone: '+380501234567', role: 'customer', registered: '2026-03-05', orders: 8 },
  { id: 'u6', name: 'Марія Бондаренко', email: 'm.bondarenko@ukr.net', phone: '+380631234567', role: 'customer', registered: '2026-03-18', orders: 5 },
  { id: 'u7', name: 'Іван Петренко', email: 'ivan.p@gmail.com', phone: '+380971234567', role: 'customer', registered: '2026-04-01', orders: 3 },
  { id: 'u8', name: 'Тетяна Мельник', email: 'tatiana.m@gmail.com', phone: '+380661234567', role: 'customer', registered: '2026-04-10', orders: 1 },
  { id: 'u9', name: 'Дмитро Ткаченко', email: 'd.tkachenko@ukr.net', phone: '+380931234567', role: 'customer', registered: '2026-04-12', orders: 2 },
  { id: 'u10', name: 'Наталія Кравченко', email: 'n.kravchenko@gmail.com', phone: '+380681234567', role: 'customer', registered: '2026-04-15', orders: 1 },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editing, setEditing] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Видалити цього користувача?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSave = (user: User) => {
    if (editing) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      setEditing(null);
    } else {
      setUsers(prev => [...prev, { ...user, id: `u${Date.now()}` }]);
      setAdding(false);
    }
  };

  if (editing || adding) {
    return (
      <UserForm
        user={editing || undefined}
        onSave={handleSave}
        onCancel={() => { setEditing(null); setAdding(false); }}
      />
    );
  }

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    warehouse: users.filter(u => u.role === 'warehouse').length,
    customer: users.filter(u => u.role === 'customer').length,
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Користувачі</h1>
        <button className={styles.addBtn} onClick={() => setAdding(true)}>
          <FaUserPlus /> Додати користувача
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.roleTabs}>
          {Object.entries({ all: 'Усі', ...roleLabels }).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.roleTab} ${roleFilter === key ? styles.tabActive : ''}`}
              onClick={() => setRoleFilter(key)}
            >
              {label} <span className={styles.tabCount}>{roleCounts[key as keyof typeof roleCounts]}</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Пошук за ім'ям або email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className={styles.count}>Знайдено: <strong>{filtered.length}</strong></span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Реєстрація</th>
                <th>Замовлення</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name.charAt(0)}</div>
                      <span className={styles.userName}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td><span className={`${styles.role} ${styles[`role_${u.role}`]}`}>{roleLabels[u.role]}</span></td>
                  <td>{u.registered}</td>
                  <td>{u.orders}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Редагувати" onClick={() => setEditing(u)}>
                        <FaEdit />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Видалити" onClick={() => handleDelete(u.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>Користувачів не знайдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function UserForm({ user, onSave, onCancel }: {
  user?: User;
  onSave: (u: User) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<Role>(user?.role || 'customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: user?.id || '',
      name, email, phone, role,
      registered: user?.registered || new Date().toISOString().split('T')[0],
      orders: user?.orders || 0,
    });
  };

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onCancel}>← Назад</button>
        <h1 className={styles.title}>{user ? 'Редагувати користувача' : 'Новий користувач'}</h1>
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
              <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Роль</label>
              <select className={styles.input} value={role} onChange={e => setRole(e.target.value as Role)}>
                {(Object.keys(roleLabels) as Role[]).map(r => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Скасувати</button>
            <button type="submit" className={styles.saveBtn}>Зберегти</button>
          </div>
        </form>
      </div>
    </>
  );
}
