import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPercentage, FaHeart, FaFire, FaTh, FaThLarge } from 'react-icons/fa';
import { apiToProduct } from '../data/products';
import type { Product } from '../data/products';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard, { loadSavedProducts } from '../components/ProductCard';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'all';
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState<'none' | 'asc' | 'desc' | 'popular'>('none');
  const [saleOnly, setSaleOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [popularity, setPopularity] = useState<Record<string, number>>({});
  const [cols, setCols] = useState<4 | 5>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams.get('search')]);

  useEffect(() => {
    fetch('/api/products/')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data.map(apiToProduct) : []);
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setLoadingProducts(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/products/popularity')
      .then(r => r.json())
      .then(data => setPopularity(data))
      .catch(() => {});
  }, []);

  const setCategory = (cat: string) => {
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ cat });
  };

  const allSavedIds = loadSavedProducts();
  const savedIds = savedOnly ? allSavedIds : [];
  const saleCount = products.filter(p => p.badge === 'sale').length;
  const savedCount = products.filter(p => p.id != null && allSavedIds.includes(p.id)).length;
  const productCategories = Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c))).sort();

  let filtered = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (saleOnly && p.badge !== 'sale') return false;
    if (savedOnly && (p.id == null || !savedIds.includes(p.id))) return false;
    return true;
  });

  if (sort === 'asc' || sort === 'desc') {
    filtered = [...filtered].sort((a: Product, b: Product) => {
      const pa = parseFloat(a.price);
      const pb = parseFloat(b.price);
      return sort === 'asc' ? pa - pb : pb - pa;
    });
  } else if (sort === 'popular') {
    filtered = [...filtered].sort((a: Product, b: Product) => {
      return (popularity[b.name] || 0) - (popularity[a.name] || 0);
    });
  }

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.searchWrap}>
                <div className={styles.searchInner}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Пошук продуктів..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitle}>Категорії</div>
                <div className={styles.catList}>
                  <button
                    className={`${styles.catBtn} ${activeCategory === 'all' ? styles.catActive : ''}`}
                    onClick={() => setCategory('all')}
                  >
                    Усі категорії <span className={styles.catCount}>{products.length}</span>
                  </button>
                  {productCategories.map(cat => (
                    <button
                      key={cat}
                      className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat} <span className={styles.catCount}>{products.filter(p => p.category === cat).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitle}>Фільтри</div>
                <button
                  className={`${styles.saleToggle} ${saleOnly ? styles.saleActive : ''}`}
                  onClick={() => setSaleOnly(!saleOnly)}
                >
                  <span className={styles.filterLabel}><FaPercentage /> Тільки акції</span>
                  {saleCount > 0 && <span className={styles.catCount}>{saleCount}</span>}
                </button>
                <button
                  className={`${styles.savedToggle} ${savedOnly ? styles.savedActive : ''}`}
                  onClick={() => setSavedOnly(!savedOnly)}
                >
                  <span className={styles.filterLabel}><FaHeart /> Збережені</span>
                  {savedCount > 0 && <span className={styles.catCount}>{savedCount}</span>}
                </button>
              </div>

              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitle}>Сортування</div>
                <div className={styles.sortList}>
                  <button
                    className={`${styles.sortBtn} ${sort === 'popular' ? styles.sortActive : ''}`}
                    onClick={() => setSort(sort === 'popular' ? 'none' : 'popular')}
                  >
                    <FaFire /> За популярністю
                  </button>
                  <button
                    className={`${styles.sortBtn} ${sort === 'asc' ? styles.sortActive : ''}`}
                    onClick={() => setSort(sort === 'asc' ? 'none' : 'asc')}
                  >
                    <FaSortAmountUp /> Спочатку дешевші
                  </button>
                  <button
                    className={`${styles.sortBtn} ${sort === 'desc' ? styles.sortActive : ''}`}
                    onClick={() => setSort(sort === 'desc' ? 'none' : 'desc')}
                  >
                    <FaSortAmountDown /> Спочатку дорожчі
                  </button>
                </div>
              </div>
            </aside>

            <div className={styles.main}>
              <div className={styles.topBar}>
                <span className={styles.count}>
                  Знайдено: <strong>{filtered.length}</strong> товарів
                </span>
                <div className={styles.colsToggle}>
                  <button
                    className={`${styles.colsBtn} ${cols === 4 ? styles.colsActive : ''}`}
                    onClick={() => setCols(4)}
                    title="4 в рядку"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    className={`${styles.colsBtn} ${cols === 5 ? styles.colsActive : ''}`}
                    onClick={() => setCols(5)}
                    title="5 в рядку"
                  >
                    <FaTh />
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <p className={styles.empty}>Завантаження...</p>
              ) : filtered.length > 0 ? (
                <div
                  className={styles.grid}
                  style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                  {filtered.map(p => (
                    <ProductCard key={p.id ?? p.name} product={p} />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Продуктів за обраним фільтром не знайдено.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
