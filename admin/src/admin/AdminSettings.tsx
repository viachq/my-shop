import { useState, useEffect } from 'react';
import { FaSave, FaFacebookF, FaInstagram, FaTiktok, FaTelegramPlane } from 'react-icons/fa';
import styles from './AdminSettings.module.css';

const API = '/api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  };
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  telegram: string;
}

const DEFAULTS: SocialLinks = {
  facebook: 'https://www.facebook.com/techbox.ua',
  instagram: 'https://www.instagram.com/techbox_ua',
  tiktok: 'https://www.tiktok.com/@techbox_ua',
  telegram: 'https://t.me/techbox_ua',
};

export default function AdminSettings() {
  const [links, setLinks] = useState<SocialLinks>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/settings/social`)
      .then(r => r.json())
      .then(data => setLinks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof SocialLinks, value: string) => {
    setLinks(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/settings/social`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(links),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage({ type: 'success', text: 'Посилання збережено!' });
    } catch {
      setMessage({ type: 'error', text: 'Помилка збереження. Спробуйте ще раз.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className={styles.topBar}><h1 className={styles.title}>Налаштування</h1></div>
        <div className={styles.content}><p>Завантаження...</p></div>
      </>
    );
  }

  const fields: { key: keyof SocialLinks; label: string; icon: JSX.Element; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook URL', icon: <FaFacebookF />, placeholder: 'https://www.facebook.com/...' },
    { key: 'instagram', label: 'Instagram URL', icon: <FaInstagram />, placeholder: 'https://www.instagram.com/...' },
    { key: 'tiktok', label: 'TikTok URL', icon: <FaTiktok />, placeholder: 'https://www.tiktok.com/...' },
    { key: 'telegram', label: 'Telegram URL', icon: <FaTelegramPlane />, placeholder: 'https://t.me/...' },
  ];

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Налаштування</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Соціальні мережі</h2>
          <p className={styles.cardDesc}>Посилання на соціальні мережі, які відображаються на сайті.</p>

          <div className={styles.fields}>
            {fields.map(f => (
              <div className={styles.field} key={f.key}>
                <label className={styles.label}>
                  <span className={styles.labelIcon}>{f.icon}</span>
                  {f.label}
                </label>
                <input
                  type="url"
                  className={styles.input}
                  value={links[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>

          {message && (
            <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
              {message.text}
            </div>
          )}

          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </>
  );
}
