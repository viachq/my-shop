import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTh, FaThLarge } from 'react-icons/fa';
import styles from './AdminProducts.module.css';

function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const B = 'https://img.jabko.ua/image/cache/';
const catImages: Record<string, string> = {
  'Смартфони':      B + 'home_cats/20-11-2025/android-newfull.png.webp',
  'Ноутбуки':       B + 'trade-new/mac-trade/mac-air-15-m3-max-240.png.webp',
  'Планшети':       B + '0NEW-REPAIR/iPad-repair/ipad-11-2025-max-240.png.webp',
  'Навушники':      B + 'home_cats/may2025/big-center-airpods-2025full.png.webp',
  'Смарт-годинники':B + '0806-menu-new/watch-s11full.png.webp',
  'Аксесуари':      B + 'home_cats/20-11-2025/aca-s-1full.png.webp',
  'Монітори':       B + 'A-MAIN-MENU/monitor-m-menufull.png.webp',
  'Ігрові приставки':B+ 'home_cats/may2025/big-ps5full.png.webp',
  'Фото та відео':  B + 'home_cats/20-11-2025/wide-photoofull.png.webp',
  'Телевізори':     B + 'A-MAIN-MENU/hisense-tv-menufull.png.webp',
  'Акустика':       B + 'home_cats/20-11-2025/aca-s-1full.png.webp',
  'Мережеве обладнання': B + 'A-MAIN-MENU/monitor-m-menufull.png.webp',
};

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
  badge: string | null;
  category: string;
  stock: number;
  created_at: string;
}

const DEFAULT_CATEGORIES = ['Смартфони', 'Ноутбуки', 'Планшети', 'Навушники', 'Смарт-годинники', 'Аксесуари', 'Акустика', 'Ігрові приставки', 'Фото та відео', 'Мережеве обладнання'];

type SortKey = 'none' | 'asc' | 'desc' | 'new';

/* ── Main component ──────────────────────────────────────── */

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('none');
  const [cols, setCols] = useState<4 | 5>(5);
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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (saleOnly && !p.old_price) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = (() => {
    if (sort === 'asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'desc') return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'new') return [...filtered].sort((a, b) => b.id - a.id);
    return filtered;
  })();

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей товар?')) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
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

  const saleCount = products.filter(p => p.old_price).length;

  return (
    <>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <span className={styles.count}>Знайдено: <strong>{sorted.length}</strong> товарів</span>
        <div className={styles.colsToggle}>
          <button className={`${styles.colsBtn} ${cols === 5 ? styles.colsActive : ''}`} onClick={() => setCols(5)} title="5 в рядку"><FaTh /></button>
          <button className={`${styles.colsBtn} ${cols === 4 ? styles.colsActive : ''}`} onClick={() => setCols(4)} title="4 в рядку"><FaThLarge /></button>
        </div>
        <button className={styles.addBtn} onClick={() => setAdding(true)}>
          <FaPlus /> Додати товар
        </button>
      </div>

      {/* ── Page layout: filter sidebar + grid ── */}
      <div className={styles.pageLayout}>

        {/* Filter sidebar */}
        <aside className={styles.filterSidebar}>

          {/* Search — same style as catalog */}
          <div className={styles.sidebarSearch}>
            <div className={styles.sidebarSearchInner}>
              <FaSearch className={styles.sidebarSearchIcon} />
              <input
                className={styles.sidebarSearchInput}
                type="text"
                placeholder="Пошук продуктів..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className={styles.sidebarSection}>
            <div className={styles.catList}>
              <button
                className={`${styles.catBtn} ${catFilter === 'all' ? styles.catActive : ''}`}
                onClick={() => setCatFilter('all')}
              >
                <span className={styles.catLabel}>
                  <span className={styles.catImgPlaceholder} />
                  Усі категорії
                </span>
                <span className={styles.catCount}>{products.length}</span>
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  className={`${styles.catBtn} ${catFilter === c ? styles.catActive : ''}`}
                  onClick={() => setCatFilter(c)}
                >
                  <span className={styles.catLabel}>
                    {catImages[c]
                      ? <img src={catImages[c]} alt="" className={styles.catImg} />
                      : <span className={styles.catImgPlaceholder} />
                    }
                    {c}
                  </span>
                  <span className={styles.catCount}>{products.filter(p => p.category === c).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Сортування</div>
            <div className={styles.sortList}>
              <button className={`${styles.sortBtn} ${sort === 'none' ? styles.sortActive : ''}`} onClick={() => setSort('none')}>За замовчуванням</button>
              <button className={`${styles.sortBtn} ${sort === 'asc' ? styles.sortActive : ''}`} onClick={() => setSort('asc')}>Від дешевих</button>
              <button className={`${styles.sortBtn} ${sort === 'desc' ? styles.sortActive : ''}`} onClick={() => setSort('desc')}>Від дорогих</button>
              <button className={`${styles.sortBtn} ${sort === 'new' ? styles.sortActive : ''}`} onClick={() => setSort('new')}>Спочатку нові</button>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Фільтри</div>
            <div className={styles.sortList}>
              <button
                className={`${styles.sortBtn} ${saleOnly ? styles.sortActive : ''}`}
                onClick={() => setSaleOnly(!saleOnly)}
              >
Тільки акції
                <span className={styles.catCount} style={{ marginLeft: 'auto' }}>{saleCount}</span>
              </button>
            </div>
          </div>

        </aside>

        {/* Grid area */}
        <div className={styles.gridArea}>
          {loading ? (
            <div className={styles.empty}>Завантаження...</div>
          ) : sorted.length === 0 ? (
            <div className={styles.empty}>Товарів не знайдено</div>
          ) : (
            <div className={styles.cardGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {sorted.map(p => (
                <div className={styles.card} key={p.id}>
                  <div className={styles.cardImgWrap} onClick={() => window.open('http://localhost:5182/product/' + p.id, '_blank')}>
                    {p.img ? (
                      <img src={p.img} alt={p.name} className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardImgEmpty}>Немає фото</div>
                    )}
                    {p.old_price && (
                      <span className={`${styles.cardBadge} ${styles.cardBadgeSale}`}>Акція</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardName}>{p.name}</div>
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>{formatPrice(p.price)} ₴</span>
                      {p.old_price && <span className={styles.cardOldPrice}>{formatPrice(p.old_price)} ₴</span>}
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
  const [category, setCategory] = useState(product?.category || categories[0] || '');
  const [stock, setStock] = useState<number>(product?.stock ?? 100);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const hasPromo = oldPrice !== '' && Number(oldPrice) > 0;
    const body = { name, price, old_price: oldPrice === '' ? null : oldPrice, img: img || null, badge: hasPromo ? 'sale' : null, category, stock };
    try {
      const url = product ? `${API}/products/${product.id}` : `${API}/products/`;
      const method = product ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const text = await res.text(); throw new Error(text || `${method} failed`); }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
        <div className={styles.formWrap}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div style={{ color: '#c62828', marginBottom: 16, fontSize: 13 }}>{error}</div>}
            <div className={styles.grid}>
              <div className={styles.field}><label className={styles.label}>Назва товару</label><input className={styles.input} value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className={styles.field}><label className={styles.label}>URL зображення</label><input className={styles.input} value={img} onChange={e => setImg(e.target.value)} placeholder="https://..." /></div>
              <div className={styles.field}><label className={styles.label}>Ціна (грн)</label><input className={styles.input} type="number" step="0.01" min="0" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} required /></div>
              <div className={styles.field}><label className={styles.label}>Акційна ціна (грн)</label><input className={styles.input} type="number" step="0.01" min="0" value={oldPrice} onChange={e => setOldPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)} placeholder="Якщо є — товар буде акційним" /></div>
              <div className={styles.field}><label className={styles.label}>Категорія</label><select className={styles.input} value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className={styles.field}><label className={styles.label}>Залишок (шт)</label><input className={styles.input} type="number" min="0" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} required /></div>
            </div>
            {img && <div className={styles.preview}><img src={img} alt="Preview" /></div>}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>Скасувати</button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'Збереження...' : 'Зберегти'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
