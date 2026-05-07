import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSave, FaLock, FaClipboardList, FaUser, FaEye, FaEyeSlash,
  FaEnvelope, FaPhone, FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
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

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const wantsPasswordChange = oldPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
      if (!oldPassword) { setError('Введіть старий пароль'); return; }
      if (!newPassword) { setError('Введіть новий пароль'); return; }
      if (newPassword.length < 4) { setError('Мінімум 4 символи'); return; }
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

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Мій кабінет</h1>
          </div>

          <div className={styles.content}>
            {/* ── Sidebar ── */}
            <div className={styles.sidebar}>
              <div className={styles.avatarBlock}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>

              <nav className={styles.nav}>
                <Link to="/profile" className={`${styles.navItem} ${styles.navActive}`}>
                  <FaUser /> Особисті дані
                </Link>
                <Link to="/orders" className={styles.navItem}>
                  <FaClipboardList /> Мої замовлення
                </Link>
              </nav>

              <button className={styles.logoutBtn} onClick={handleLogout}>
                <FaSignOutAlt /> Вийти
              </button>
            </div>

            {/* ── Form ── */}
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {success && <div className={styles.successMsg}>{success}</div>}
              {error && <div className={styles.errorMsg}>{error}</div>}

              {/* Personal data section */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}><FaUser /> Особисті дані</h2>

                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label>Ім'я</label>
                    <div className={styles.inputWrap}>
                      <FaUser className={styles.inputIcon} />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ваше ім'я" />
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

              {/* Password section */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}><FaLock /> Зміна паролю</h2>

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
                      <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Введіть новий пароль" />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPw(!showNewPw)}>
                        {showNewPw ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Підтвердження</label>
                    <div className={styles.inputWrap}>
                      <FaLock className={styles.inputIcon} />
                      <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторіть новий пароль" />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPw(!showConfirmPw)}>
                        {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with save button */}
              <div className={styles.formFooter}>
                <button type="submit" className={styles.saveBtn}>
                  <FaSave /> Зберегти зміни
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
