import { useState, type FormEvent } from 'react';
import { FaLaptop } from 'react-icons/fa';
import styles from './AdminLogin.module.css';

interface AdminLoginProps {
  onLogin: () => void;
}

interface UserCredentials {
  email: string;
  password: string;
  role: string;
  name: string;
}

const USERS: UserCredentials[] = [
  { email: 'admin@techbox.ua', password: 'admin123', role: 'admin', name: 'Адмін TechBox' },
  { email: 'manager@techbox.ua', password: 'manager123', role: 'manager', name: 'Ольга Менеджер' },
  { email: 'warehouse@techbox.ua', password: 'warehouse123', role: 'warehouse', name: 'Сергій Комірник' },
];

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminRole', user.role);
      localStorage.setItem('adminName', user.name);
      onLogin();
    } else {
      setError('Невірний email або пароль');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <FaLaptop />
          </div>
          <h1 className={styles.title}>TechBox Admin</h1>
          <p className={styles.subtitle}>Увійдіть, щоб продовжити</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@techbox.ua"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              required
            />
          </div>

          <button className={styles.button} type="submit">
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}
