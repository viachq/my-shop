import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const newFieldErrors: Record<string, string> = {};

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newFieldErrors.email = 'Невірний формат email';
    }

    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(phone)) {
      newFieldErrors.phone = 'Невірний формат телефону (+380XXXXXXXXX)';
    }

    if (password.length < 6) {
      newFieldErrors.password = 'Пароль має бути не менше 6 символів';
    }

    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Паролі не збігаються';
    }

    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) return;

    const result = await register(name, email, phone, password);
    if (result === true) {
      navigate('/');
    } else {
      setError(result);
    }
  };

  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h1 className={styles.title}>Реєстрація</h1>
          <p className={styles.subtitle}>Створіть новий акаунт</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="reg-name">Ім'я</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше ім'я"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-phone">Телефон</label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+380XXXXXXXXX"
              autoComplete="tel"
            />
            {fieldErrors.phone && <span className={styles.fieldError}>{fieldErrors.phone}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-password">Пароль</label>
            <div className={styles.passwordWrap}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                autoComplete="new-password"
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
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-confirm">Підтвердження паролю</label>
            <div className={styles.passwordWrap}>
              <input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Повторіть пароль"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.submitBtn}>
            Зареєструватися
          </button>

          <div className={styles.footer}>
            Вже маєте акаунт?
            <Link to="/login">Увійти</Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
