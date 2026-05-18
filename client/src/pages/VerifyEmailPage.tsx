import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './VerifyEmailPage.module.css';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [verifyStatus, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Посилання недійсне');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setErrorMessage(data.detail || 'Помилка підтвердження');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Помилка з\'єднання з сервером');
      });
  }, [token]);

  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          {verifyStatus === 'loading' && (
            <>
              <div className={styles.spinner} />
              <h1 className={styles.title}>Підтвердження...</h1>
              <p className={styles.text}>Зачекайте, ми перевіряємо ваше посилання</p>
            </>
          )}

          {verifyStatus === 'success' && (
            <>
              <div className={styles.iconWrap}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className={styles.title}>Email підтверджено!</h1>
              <p className={styles.text}>Ваш акаунт активовано. Тепер ви можете увійти.</p>
              <Link to="/login" className={styles.loginBtn}>Увійти</Link>
            </>
          )}

          {verifyStatus === 'error' && (
            <>
              <div className={styles.iconWrapError}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 className={styles.title}>Помилка</h1>
              <p className={styles.text}>{errorMessage}</p>
              <div className={styles.actions}>
                <Link to="/login" className={styles.loginBtn}>Перейти до входу</Link>
                <Link to="/register" className={styles.secondaryLink}>Зареєструватися знову</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
