import { useState, type FormEvent } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './AdminLogin.module.css';

const API = '/api';
const ALLOWED_ROLES = ['superadmin', 'admin', 'manager', 'warehouse'];

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@techbox.ua');
  const [password, setPassword] = useState('admin@techbox.ua');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Невірний email або пароль');
        return;
      }

      const data = await res.json();
      const role: string = data.user?.role;

      if (!ALLOWED_ROLES.includes(role)) {
        setError('Доступ заборонено. Тільки для персоналу.');
        return;
      }

      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('adminRole', role);
      localStorage.setItem('adminName', data.user.name);
      onLogin();
    } catch {
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            Tech<span className={styles.logoSpan}>Box</span>
          </div>
          <p className={styles.subtitle}>Панель управління</p>
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
            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
