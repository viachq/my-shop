import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './AdminProducts.module.css';

/* ── API helpers ─────────────────────────────────────────── */

const API = '/api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  };
}

/* ── Types ───────────────────────────────────────────────── */

interface ProductOut {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  img: string | null;
  images: string[];
  badge: string | null;
  category: string;
  stock: number;
  weight: string | null;
  created_at: string;
}

const DEFAULT_CATEGORIES = ['Смартфони', 'Ноутбуки', 'Планшети', 'Навушники', 'Смарт-годинники', 'Аксесуари', 'Акустика', 'Ігрові приставки', 'Фото та відео', 'Мережеве обладнання'];

/* ── Main component ──────────────────────────────────────── */

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/products/`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Fetch failed');
      const data: ProductOut[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (badgeFilter === 'sale' && p.badge !== 'sale') return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей товар?')) return;
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleSaved = async () => {
    setEditing(null);
    setAdding(false);
    await fetchProducts();
  };

  if (editing || adding) {
    return (
      <ProductForm
        product={editing || undefined}
        categories={categories.length > 0 ? categories : DEFAULT_CATEGORIES}
        onSave={handleSaved}
        onCancel={() => { setEditing(null); setAdding(false); }}
      />
    );
  }

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Пошук товарів..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.catSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Усі категорії</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={styles.catSelect} value={badgeFilter} onChange={e => setBadgeFilter(e.target.value)}>
          <option value="all">Усі мітки</option>
          <option value="sale">Акція</option>
        </select>
        <span className={styles.count}>Всього: <strong>{filtered.length}</strong></span>
        <button className={styles.addBtn} onClick={() => setAdding(true)}>
          <FaPlus /> Додати товар
        </button>
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.empty} style={{ padding: '40px', textAlign: 'center' }}>Завантаження...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Товарів не знайдено</div>
        ) : (
          <div className={styles.cardGrid}>
            {filtered.map(p => (
              <div className={styles.card} key={p.id}>
                <div className={styles.cardImgWrap} onClick={() => window.open('http://localhost:5182/product/' + p.id, '_blank')}>
                  {p.img ? (
                    <img src={p.img} alt={p.name} className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgEmpty}>Немає фото</div>
                  )}
                  {p.badge === 'sale' && (
                    <span className={`${styles.cardBadge} ${styles.cardBadgeSale}`}>Акція</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>{p.name}</div>
                  <div className={styles.cardCategory}>{p.category}</div>
                  <div className={styles.cardPriceRow}>
                    <span className={styles.cardPrice}>{p.price} ₴</span>
                    {p.old_price && <span className={styles.cardOldPrice}>{p.old_price} ₴</span>}
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.cardActionBtn} onClick={() => setEditing(p)}>
                      <FaEdit /> Редагувати
                    </button>
                    <button className={`${styles.cardActionBtn} ${styles.cardDeleteBtn}`} onClick={() => handleDelete(p.id)}>
                      <FaTrash /> Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </>
  );
}

/* ── ProductForm ─────────────────────────────────────────── */

function ProductForm({ product, categories, onSave, onCancel }: {
  product?: ProductOut;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState<number>(product?.price || 0);
  const [oldPrice, setOldPrice] = useState<number | ''>(product?.old_price ?? '');
  const [img, setImg] = useState(product?.img || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [category, setCategory] = useState(product?.category || categories[0] || '');
  const [badge, setBadge] = useState<'' | 'sale'>((product?.badge === 'sale' ? 'sale' : ''));
  const [stock, setStock] = useState<number>(product?.stock ?? 100);
  const [weight, setWeight] = useState(product?.weight || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      name,
      price,
      old_price: oldPrice === '' ? null : oldPrice,
      img: img || null,
      images,
      badge: badge || null,
      category,
      stock,
      weight: weight || null,
    };

    try {
      const url = product ? `${API}/products/${product.id}` : `${API}/products/`;
      const method = product ? 'PUT' : 'POST';
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
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onCancel}>← Назад</button>
        <h1 className={styles.title}>{product ? 'Редагувати товар' : 'Новий товар'}</h1>
      </div>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div style={{ color: '#c62828', marginBottom: 16, fontSize: 13 }}>{error}</div>}
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Назва товару</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>URL зображення</label>
              <input className={styles.input} value={img} onChange={e => setImg(e.target.value)} placeholder="https://..." />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ціна (грн)</label>
              <input className={styles.input} type="number" step="0.01" min="0" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Стара ціна (грн)</label>
              <input className={styles.input} type="number" step="0.01" min="0" value={oldPrice} onChange={e => setOldPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)} placeholder="Для акцій" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Категорія</label>
              <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Мітка</label>
              <select className={styles.input} value={badge} onChange={e => setBadge(e.target.value as '' | 'sale')}>
                <option value="">Без мітки</option>
                <option value="sale">Акція</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Залишок (шт)</label>
              <input className={styles.input} type="number" min="0" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Вага / Фасовка</label>
              <input className={styles.input} value={weight} onChange={e => setWeight(e.target.value)} placeholder="напр. 500 г, 1 кг" />
            </div>
          </div>
          {img && <div className={styles.preview}><img src={img} alt="Preview" /></div>}

          <div className={styles.field} style={{ marginBottom: 20 }}>
            <label className={styles.label}>Додаткові фото</label>
            <div className={styles.imagesGrid}>
              {images.map((url, i) => (
                <div key={i} className={styles.imageThumb}>
                  <img src={url} alt={`Фото ${i + 1}`} />
                  <button type="button" className={styles.imageRemove} onClick={() => setImages(images.filter((_, j) => j !== i))}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className={styles.input}
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="URL додаткового фото..."
              />
              <button
                type="button"
                className={styles.addBtn}
                style={{ padding: '8px 16px', fontSize: 12 }}
                onClick={() => { if (newImageUrl.trim()) { setImages([...images, newImageUrl.trim()]); setNewImageUrl(''); } }}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Скасувати</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
