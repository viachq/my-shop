import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTag, FaCheckCircle, FaTimesCircle, FaRedo, FaSearch } from 'react-icons/fa';
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
  max_uses: number | '';
  is_active: boolean;
  expires_at: string;
};

const emptyForm: PromoFormData = {
  code: '',
  discount_percent: '',
  discount_amount: '',
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percent' | 'fixed'>('all');
  const [search, setSearch] = useState('');

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

  const total = codes.length;
  const active = codes.filter(p => promoStatus(p) === 'active').length;
  const expired = codes.filter(p => promoStatus(p) === 'expired').length;
  const totalUses = codes.reduce((s, p) => s + p.used_count, 0);

  const filtered = useMemo(() => {
    let list = codes;
    if (statusFilter === 'active') list = list.filter(p => promoStatus(p) === 'active');
    if (statusFilter === 'expired') list = list.filter(p => promoStatus(p) === 'expired');
    if (typeFilter === 'percent') list = list.filter(p => p.discount_percent != null);
    if (typeFilter === 'fixed') list = list.filter(p => p.discount_amount != null);
    if (search) list = list.filter(p => p.code.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [codes, statusFilter, typeFilter, search]);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Пошук за кодом..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter('all')}
          >Всі</button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter('active')}
          >Активні</button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'expired' ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter('expired')}
          >Прострочені</button>
        </div>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setTypeFilter('all')}
          >Всі типи</button>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'percent' ? styles.filterActive : ''}`}
            onClick={() => setTypeFilter('percent')}
          >Відсоток</button>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'fixed' ? styles.filterActive : ''}`}
            onClick={() => setTypeFilter('fixed')}
          >Фіксована</button>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <FaPlus /> Додати промокод
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaTag /></div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>Всього кодів</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaCheckCircle /></div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{active}</div>
              <div className={styles.statLabel}>Активні</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaTimesCircle /></div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{expired}</div>
              <div className={styles.statLabel}>Прострочені</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaRedo /></div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{totalUses}</div>
              <div className={styles.statLabel}>Використань</div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.empty}>Завантаження...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>{codes.length === 0 ? 'Промокодів ще немає' : 'Нічого не знайдено'}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Промокод</th>
                  <th>Знижка</th>
                  <th>Використано</th>
                  <th>Статус</th>
                  <th>Створено</th>
                  <th>Термін дії</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const st = promoStatus(p);
                  const isPercent = p.discount_percent != null;
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className={styles.codeCell}>{p.code}</span>
                      </td>
                      <td>
                        <span className={`${styles.discountBadge} ${isPercent ? styles.discountPercent : styles.discountFixed}`}>
                          {isPercent ? `-${p.discount_percent}%` : `-${p.discount_amount} ₴`}
                        </span>
                      </td>
                      <td className={styles.usesCell}>
                        <span className={styles.usesCount}>{p.used_count}</span>
                        <span className={styles.usesSep}>/</span>
                        <span className={styles.usesMax}>{p.max_uses != null ? p.max_uses : '∞'}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          st === 'active' ? styles.statusBadgeActive :
                          st === 'expired' ? styles.statusBadgeExpired : styles.statusBadgeInactive
                        }`}>
                          <span className={`${styles.statusDot} ${
                            st === 'active' ? styles.dotActive :
                            st === 'expired' ? styles.dotExpired : styles.dotInactive
                          }`} />
                          {STATUS_LABEL[st]}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {formatDate(p.created_at)}
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

  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(() => {
    if (promo && promo.discount_amount != null) return 'fixed';
    return 'percent';
  });

  const [form, setForm] = useState<PromoFormData>(() => {
    if (promo) {
      return {
        code: promo.code,
        discount_percent: promo.discount_percent ?? '',
        discount_amount: promo.discount_amount ?? '',
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
      discount_percent: discountType === 'percent' && form.discount_percent !== '' ? Number(form.discount_percent) : null,
      discount_amount: discountType === 'fixed' && form.discount_amount !== '' ? Number(form.discount_amount) : null,
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };

    if (!body.discount_percent && !body.discount_amount) {
      setError('Вкажіть значення знижки');
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
                className={`${styles.input} ${styles.inputCode}`}
                value={form.code}
                onChange={e => set('code', e.target.value)}
                placeholder="SALE20"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Тип знижки</label>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${discountType === 'percent' ? styles.toggleActive : ''}`}
                  onClick={() => setDiscountType('percent')}
                >Відсоток (%)</button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${discountType === 'fixed' ? styles.toggleActive : ''}`}
                  onClick={() => setDiscountType('fixed')}
                >Фіксована (₴)</button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {discountType === 'percent' ? 'Знижка (%)' : 'Знижка (грн)'}
              </label>
              {discountType === 'percent' ? (
                <input
                  className={styles.input}
                  type="number" min="1" max="100"
                  value={form.discount_percent}
                  onChange={e => set('discount_percent', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="10"
                  required
                />
              ) : (
                <input
                  className={styles.input}
                  type="number" min="1" step="0.01"
                  value={form.discount_amount}
                  onChange={e => set('discount_amount', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  required
                />
              )}
            </div>

            <div className={styles.row}>
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
              <div className={styles.field}>
                <label className={styles.label}>Діє до</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.expires_at}
                  onChange={e => set('expires_at', e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
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
