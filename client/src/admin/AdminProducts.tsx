import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import type { Product } from '../data/products';
import { catalogProducts, categories } from '../data/products';
import styles from './AdminProducts.module.css';

interface ProductRow extends Product {
  id: string;
  stock: number;
}

const initialProducts: ProductRow[] = catalogProducts.map((p, i) => ({
  ...p,
  id: `prod-${i}`,
  stock: Math.floor(Math.random() * 200) + 10,
}));

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState<ProductRow | null>(null);

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Видалити цей товар?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = (product: ProductRow) => {
    if (editing) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      setEditing(null);
    } else {
      setProducts(prev => [...prev, { ...product, id: `prod-${Date.now()}` }]);
      setAdding(false);
    }
  };

  if (editing || adding) {
    return (
      <ProductForm
        product={editing || undefined}
        onSave={handleSave}
        onCancel={() => { setEditing(null); setAdding(false); }}
      />
    );
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Товари</h1>
        <button className={styles.addBtn} onClick={() => setAdding(true)}>
          <FaPlus /> Додати товар
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.toolbar}>
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
          <span className={styles.count}>Всього: <strong>{filtered.length}</strong></span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Назва</th>
                <th>Категорія</th>
                <th>Ціна</th>
                <th>Стара ціна</th>
                <th>Залишок</th>
                <th>Мітка</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.img} alt={p.name} className={styles.thumb} /></td>
                  <td className={styles.nameCell}>{p.name}</td>
                  <td><span className={styles.catBadge}>{p.category}</span></td>
                  <td className={styles.price}>{p.price} грн</td>
                  <td className={styles.oldPrice}>{p.oldPrice ? `${p.oldPrice} грн` : '—'}</td>
                  <td>
                    <span className={`${styles.stockBadge} ${p.stock < 30 ? styles.stockLow : styles.stockOk}`}>
                      {p.stock} шт
                    </span>
                  </td>
                  <td>
                    {p.badge && (
                      <span className={`${styles.badge} ${p.badge === 'sale' ? styles.badgeSale : styles.badgeNew}`}>
                        {p.badge === 'sale' ? 'Акція' : 'Новинка'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Переглянути" onClick={() => setPreview(p)}>
                        <FaEye />
                      </button>
                      <button className={styles.actionBtn} title="Редагувати" onClick={() => setEditing(p)}>
                        <FaEdit />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Видалити" onClick={() => handleDelete(p.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className={styles.empty}>Товарів не знайдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <div className={styles.overlay} onClick={() => setPreview(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <img src={preview.img} alt={preview.name} className={styles.modalImg} />
            <h2>{preview.name}</h2>
            <div className={styles.modalDetails}>
              <div className={styles.modalRow}><span>Категорія:</span><span>{preview.category}</span></div>
              <div className={styles.modalRow}><span>Ціна:</span><span className={styles.price}>{preview.price} грн</span></div>
              {preview.oldPrice && <div className={styles.modalRow}><span>Стара ціна:</span><span className={styles.oldPrice}>{preview.oldPrice} грн</span></div>}
              <div className={styles.modalRow}><span>Залишок:</span><span>{preview.stock} шт</span></div>
              {preview.badge && <div className={styles.modalRow}><span>Мітка:</span><span>{preview.badge === 'sale' ? 'Акція' : 'Новинка'}</span></div>}
            </div>
            <button className={styles.closeBtn} onClick={() => setPreview(null)}>Закрити</button>
          </div>
        </div>
      )}
    </>
  );
}

function ProductForm({ product, onSave, onCancel }: {
  product?: ProductRow;
  onSave: (p: ProductRow) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [oldPrice, setOldPrice] = useState(product?.oldPrice || '');
  const [img, setImg] = useState(product?.img || '');
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [badge, setBadge] = useState<'' | 'sale' | 'new'>(product?.badge || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: product?.id || '',
      name,
      price,
      oldPrice: oldPrice || undefined,
      img,
      category,
      badge: badge || undefined,
      stock: parseInt(stock) || 0,
    });
  };

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onCancel}>← Назад</button>
        <h1 className={styles.title}>{product ? 'Редагувати товар' : 'Новий товар'}</h1>
      </div>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
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
              <input className={styles.input} value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Стара ціна (грн)</label>
              <input className={styles.input} value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="Для акцій" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Категорія</label>
              <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Мітка</label>
              <select className={styles.input} value={badge} onChange={e => setBadge(e.target.value as '' | 'sale' | 'new')}>
                <option value="">Без мітки</option>
                <option value="sale">Акція</option>
                <option value="new">Новинка</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Залишок (шт)</label>
              <input className={styles.input} type="number" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>
          </div>
          {img && <div className={styles.preview}><img src={img} alt="Preview" /></div>}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Скасувати</button>
            <button type="submit" className={styles.saveBtn}>Зберегти</button>
          </div>
        </form>
      </div>
    </>
  );
}
