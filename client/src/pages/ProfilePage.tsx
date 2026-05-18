import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaLock, FaUser, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ProfilePage.module.css';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Доброї ночі';
  if (h < 12) return 'Доброго ранку';
  if (h < 18) return 'Доброго дня';
  return 'Доброго вечора';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone); }
  }, [user]);

  if (!isAuthenticated || !user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const wantsPasswordChange = oldPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
      if (!oldPassword) { setError('Введіть старий пароль'); return; }
      if (!newPassword) { setError('Введіть новий пароль'); return; }
      if (newPassword.length < 6) { setError('Мінімум 6 символів'); return; }
      if (newPassword !== confirmPassword) { setError('Паролі не збігаються'); return; }
    }

    const updateData: { name?: string; phone?: string; password?: string; oldPassword?: string } = {};
    if (name !== user.name) updateData.name = name;
    if (phone !== user.phone) updateData.phone = phone;
    if (wantsPasswordChange) { updateData.oldPassword = oldPassword; updateData.password = newPassword; }

    const result = await updateProfile(updateData);
    if (result !== true) { setError(result); return; }

    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    setSuccess('Зміни успішно збережено');
  };

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>{getGreeting()}, {user.name}</h1>
            <p className={styles.greetingSub}>Зареєстровано {formatDate(user.created_at)}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {success && <div className={styles.successMsg}>{success}</div>}
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrap}><FaUser /></div>
                  <div>
                    <h2 className={styles.cardTitle}>Контактна інформація</h2>
                    <p className={styles.cardDesc}>Оновіть ваше ім'я та номер телефону</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.fieldGrid}>
                    <div className={styles.field}>
                      <label>Ім'я</label>
                      <div className={styles.inputWrap}>
                        <FaUser className={styles.inputIcon} />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ваше ім'я" maxLength={50} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label>Телефон</label>
                      <div className={styles.inputWrap}>
                        <FaPhone className={styles.inputIcon} />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 __ ___ __ __" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Email</label>
                    <div className={`${styles.inputWrap} ${styles.inputReadonly}`}>
                      <FaEnvelope className={styles.inputIcon} />
                      <input type="email" value={user.email} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrap}><FaLock /></div>
                  <div>
                    <h2 className={styles.cardTitle}>Зміна паролю</h2>
                    <p className={styles.cardDesc}>Залиште порожнім, якщо не хочете змінювати</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label>Старий пароль</label>
                    <div className={styles.inputWrap}>
                      <FaLock className={styles.inputIcon} />
                      <input type={showOldPw ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Введіть старий пароль" />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowOldPw(!showOldPw)}>
                        {showOldPw ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.fieldGrid}>
                    <div className={styles.field}>
                      <label>Новий пароль</label>
                      <div className={styles.inputWrap}>
                        <FaLock className={styles.inputIcon} />
                        <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Мінімум 6 символів" />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPw(!showNewPw)}>
                          {showNewPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label>Підтвердження</label>
                      <div className={styles.inputWrap}>
                        <FaLock className={styles.inputIcon} />
                        <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторіть пароль" />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPw(!showConfirmPw)}>
                          {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button type="submit" className={styles.saveBtn}>
                <FaSave /> Зберегти зміни
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
