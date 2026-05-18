import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const verified = params.get('verified') === 'true';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotVerified(false);

    if (!email || !password) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    const result = await login(email, password);
    if (result === true) {
      navigate('/');
    } else {
      if (result.includes('підтверджено')) {
        setNotVerified(true);
      }
      setError(result);
    }
  };

  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h1 className={styles.title}>Вхід</h1>
          <p className={styles.subtitle}>Увійдіть до свого акаунту</p>

          {verified && !error && (
            <div className={styles.success}>Email підтверджено! Тепер ви можете увійти.</div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
              {notVerified && (
                <div style={{ marginTop: 8 }}>
                  <Link to={`/check-email?email=${encodeURIComponent(email)}`}>
                    Надіслати лист повторно
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password">Пароль</label>
            <div className={styles.passwordWrap}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                autoComplete="current-password"
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

          <button type="submit" className={styles.submitBtn}>
            Увійти
          </button>

          <div className={styles.footer}>
            Немає акаунту?
            <Link to="/register">Зареєструватися</Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
