import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTag, FaCheckCircle, FaTimesCircle, FaRedo } from 'react-icons/fa';
import styles from './AdminPromoCodes.module.css';

/* ── API helpers ─────────────────────────────────────────── */

const API = '/api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  };
}

/* ── Types ───────────────────────────────────────────────── */

interface PromoCode {
  id: number;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

type PromoFormData = {
  code: string;
  discount_percent: number | '';
  discount_amount: number | '';
  min_order: number | '';
  max_uses: number | '';
  is_active: boolean;
  expires_at: string;
};

const emptyForm: PromoFormData = {
  code: '',
  discount_percent: '',
  discount_amount: '',
  min_order: '',
  max_uses: '',
  is_active: true,
  expires_at: '',
};

/* ── Helpers ─────────────────────────────────────────────── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isExpired(p: PromoCode) {
  if (!p.expires_at) return false;
  return new Date(p.expires_at) < new Date();
}

function promoStatus(p: PromoCode): 'active' | 'inactive' | 'expired' {
  if (isExpired(p)) return 'expired';
  return p.is_active ? 'active' : 'inactive';
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Активний',
  inactive: 'Неактивний',
  expired: 'Прострочений',
};

/* ── Main component ──────────────────────────────────────── */

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/promocodes/`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Fetch failed');
      const data: PromoCode[] = await res.json();
      setCodes(data);
    } catch (err) {
      console.error('Failed to fetch promo codes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей промокод?')) return;
    try {
      const res = await fetch(`${API}/promocodes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchCodes();
    } catch (err) {
      console.error('Failed to delete promo code:', err);
    }
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: PromoCode) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setEditing(null); setModalOpen(false); };
  const handleSaved = async () => { closeModal(); await fetchCodes(); };

  /* Stats */
  const total = codes.length;
  const active = codes.filter(p => promoStatus(p) === 'active').length;
  const expired = codes.filter(p => promoStatus(p) === 'expired').length;
  const totalUses = codes.reduce((s, p) => s + p.used_count, 0);

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Промокоди</h1>
        <span className={styles.count}>Всього: <strong>{total}</strong></span>
        <button className={styles.addBtn} onClick={openAdd}>
          <FaPlus /> Додати промокод
        </button>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.tone_teal}`}><FaTag /></div>
            <div className={styles.statBody}>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>Всього кодів</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.tone_green}`}><FaCheckCircle /></div>
            <div className={styles.statBody}>
              <div className={styles.statValue}>{active}</div>
              <div className={styles.statLabel}>Активних</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.tone_red}`}><FaTimesCircle /></div>
            <div className={styles.statBody}>
              <div className={styles.statValue}>{expired}</div>
              <div className={styles.statLabel}>Прострочених</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.tone_purple}`}><FaRedo /></div>
            <div className={styles.statBody}>
              <div className={styles.statValue}>{totalUses}</div>
              <div className={styles.statLabel}>Загальних використань</div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.empty}>Завантаження...</div>
        ) : codes.length === 0 ? (
          <div className={styles.empty}>Промокодів ще немає</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Тип</th>
                  <th>Значення</th>
                  <th>Мін. замовлення</th>
                  <th>Використання</th>
                  <th>Статус</th>
                  <th>Діє до</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(p => {
                  const st = promoStatus(p);
                  const isPercent = p.discount_percent != null;
                  return (
                    <tr key={p.id}>
                      <td className={styles.codeCell}>{p.code}</td>
                      <td>
                        <span className={`${styles.badge} ${isPercent ? styles.badgePercent : styles.badgeFixed}`}>
                          {isPercent ? '%' : '₴'}
                        </span>
                      </td>
                      <td>{isPercent ? `${p.discount_percent}%` : `${p.discount_amount} ₴`}</td>
                      <td>{p.min_order != null ? `${p.min_order} ₴` : '—'}</td>
                      <td className={styles.usesCell}>
                        {p.used_count} / {p.max_uses != null ? p.max_uses : '∞'}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${
                          st === 'active' ? styles.statusActive :
                          st === 'expired' ? styles.statusExpired : styles.statusInactive
                        }`}>
                          {STATUS_LABEL[st]}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {p.expires_at ? formatDate(p.expires_at) : 'Безстроково'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title="Редагувати" onClick={() => openEdit(p)}>
                            <FaEdit />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Видалити" onClick={() => handleDelete(p.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <PromoModal
          promo={editing}
          onSave={handleSaved}
          onClose={closeModal}
        />
      )}
    </>
  );
}

/* ── PromoModal ──────────────────────────────────────────── */

function PromoModal({ promo, onSave, onClose }: {
  promo: PromoCode | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const isEdit = promo !== null;

  const [form, setForm] = useState<PromoFormData>(() => {
    if (promo) {
      return {
        code: promo.code,
        discount_percent: promo.discount_percent ?? '',
        discount_amount: promo.discount_amount ?? '',
        min_order: promo.min_order ?? '',
        max_uses: promo.max_uses ?? '',
        is_active: promo.is_active,
        expires_at: promo.expires_at ? promo.expires_at.slice(0, 10) : '',
      };
    }
    return { ...emptyForm };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof PromoFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      code: form.code.trim().toUpperCase(),
      discount_percent: form.discount_percent === '' ? null : Number(form.discount_percent),
      discount_amount: form.discount_amount === '' ? null : Number(form.discount_amount),
      min_order: form.min_order === '' ? null : Number(form.min_order),
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };

    if (!body.discount_percent && !body.discount_amount) {
      setError('Вкажіть відсоток або фіксовану знижку');
      setSaving(false);
      return;
    }

    try {
      const url = isEdit ? `${API}/promocodes/${promo.id}` : `${API}/promocodes/`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `${method} failed`);
      }
      onSave();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Невідома помилка';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {isEdit ? 'Редагувати промокод' : 'Новий промокод'}
          </span>
          <button className={styles.modalClose} onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>Код</label>
              <input
                className={styles.input}
                value={form.code}
                onChange={e => set('code', e.target.value)}
                placeholder="SALE20"
                required
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Знижка (%)</label>
                <input
                  className={styles.input}
                  type="number" min="0" max="100"
                  value={form.discount_percent}
                  onChange={e => set('discount_percent', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Знижка (грн)</label>
                <input
                  className={styles.input}
                  type="number" min="0" step="0.01"
                  value={form.discount_amount}
                  onChange={e => set('discount_amount', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Мін. замовлення (грн)</label>
                <input
                  className={styles.input}
                  type="number" min="0" step="0.01"
                  value={form.min_order}
                  onChange={e => set('min_order', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="Без обмежень"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Макс. використань</label>
                <input
                  className={styles.input}
                  type="number" min="0"
                  value={form.max_uses}
                  onChange={e => set('max_uses', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="Безліміт"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Діє до</label>
              <input
                className={styles.input}
                type="date"
                value={form.expires_at}
                onChange={e => set('expires_at', e.target.value)}
              />
            </div>

            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="promoActive"
                checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
              />
              <label htmlFor="promoActive" className={styles.checkLabel}>Активний</label>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Скасувати</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
