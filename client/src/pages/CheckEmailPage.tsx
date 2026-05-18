import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './CheckEmailPage.module.css';

export default function CheckEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
          <h1 className={styles.title}>Перевірте пошту</h1>
          <p className={styles.text}>
            Ми надіслали лист для підтвердження на{' '}
            {email && <strong>{email}</strong>}
          </p>
          <p className={styles.hint}>
            Натисніть на посилання у листі, щоб активувати акаунт. Посилання дійсне 24 години.
          </p>
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resending || resent}
          >
            {resent ? 'Лист надіслано повторно' : resending ? 'Надсилання...' : 'Надіслати лист повторно'}
          </button>
          <div className={styles.footer}>
            <Link to="/login">Повернутися до входу</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
