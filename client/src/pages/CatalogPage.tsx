import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPercentage, FaHeart, FaFire, FaTh, FaThLarge, FaThList } from 'react-icons/fa';
import { apiToProduct, catImages, categories as categoryOrder } from '../data/products';
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
  const [sort, setSort] = useState<'none' | 'asc' | 'desc' | 'popular'>('popular');
  const [saleOnly, setSaleOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [popularity, setPopularity] = useState<Record<string, number>>({});
  const [cols, setCols] = useState<4 | 5>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [minStr, setMinStr] = useState('');
  const [maxStr, setMaxStr] = useState('');

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
  const productCategoriesSet = new Set(products.map(p => p.category).filter((c): c is string => !!c));
  const productCategories = categoryOrder.filter(c => productCategoriesSet.has(c));

  const priceBounds = useMemo(() => {
    const inScope = products.filter(p => activeCategory === 'all' || p.category === activeCategory);
    const prices = inScope.map(p => parseFloat(p.price)).filter(n => !isNaN(n) && isFinite(n));
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products, activeCategory]);

  const formatPrice = (n: number) => n.toLocaleString('uk-UA').replace(/ /g, ' ');

  useEffect(() => {
    setPriceMin(null);
    setPriceMax(null);
  }, [activeCategory]);

  useEffect(() => {
    if (priceMin === null) setMinStr(formatPrice(priceBounds.min));
    if (priceMax === null) setMaxStr(formatPrice(priceBounds.max));
  }, [priceBounds.min, priceBounds.max, priceMin, priceMax]);

  const currentMin = priceMin ?? priceBounds.min;
  const currentMax = priceMax ?? priceBounds.max;

  const applyMinDraft = () => {
    const num = parseInt(minStr.replace(/\D/g, ''), 10);
    if (isNaN(num)) {
      setMinStr(formatPrice(currentMin));
      return;
    }
    const clamped = Math.max(priceBounds.min, Math.min(num, currentMax));
    setPriceMin(clamped);
    setMinStr(formatPrice(clamped));
  };

  const applyMaxDraft = () => {
    const num = parseInt(maxStr.replace(/\D/g, ''), 10);
    if (isNaN(num)) {
      setMaxStr(formatPrice(currentMax));
      return;
    }
    const clamped = Math.min(priceBounds.max, Math.max(num, currentMin));
    setPriceMax(clamped);
    setMaxStr(formatPrice(clamped));
  };

  const handleSliderMin = (v: number) => {
    const clamped = Math.min(v, currentMax);
    setPriceMin(clamped);
    setMinStr(formatPrice(clamped));
  };
  const handleSliderMax = (v: number) => {
    const clamped = Math.max(v, currentMin);
    setPriceMax(clamped);
    setMaxStr(formatPrice(clamped));
  };

  const sliderRange = priceBounds.max - priceBounds.min || 1;
  const fillLeftPct = ((currentMin - priceBounds.min) / sliderRange) * 100;
  const fillRightPct = ((currentMax - priceBounds.min) / sliderRange) * 100;

  let filtered = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (saleOnly && p.badge !== 'sale') return false;
    if (savedOnly && (p.id == null || !savedIds.includes(p.id))) return false;
    const pp = parseFloat(p.price);
    if (!isNaN(pp) && (pp < currentMin || pp > currentMax)) return false;
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
                <div className={styles.catList}>
                  <button
                    className={`${styles.catBtn} ${activeCategory === 'all' ? styles.catActive : ''}`}
                    onClick={() => setCategory('all')}
                  >
                    <span className={styles.catLabel}>
                      <span className={styles.catIconWrap}><FaThList /></span>
                      Усі категорії
                    </span>
                  </button>
                  {productCategories.map(cat => (
                    <button
                      key={cat}
                      className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      <span className={styles.catLabel}>
                        {catImages[cat] && (
                          <img src={catImages[cat]} alt="" className={styles.catImg} />
                        )}
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {priceBounds.max > priceBounds.min && (
                <div className={styles.sidebarSection}>
                  <div className={styles.sidebarTitle}>Ціна</div>
                  <div className={styles.priceFilter}>
                    <div className={styles.priceInputs}>
                      <div className={styles.priceInputWrap}>
                        <input
                          className={styles.priceInput}
                          type="text"
                          inputMode="numeric"
                          value={minStr}
                          onChange={e => setMinStr(e.target.value)}
                          onBlur={applyMinDraft}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        />
                        <span className={styles.priceSuffix}>грн</span>
                      </div>
                      <div className={styles.priceInputWrap}>
                        <input
                          className={styles.priceInput}
                          type="text"
                          inputMode="numeric"
                          value={maxStr}
                          onChange={e => setMaxStr(e.target.value)}
                          onBlur={applyMaxDraft}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        />
                        <span className={styles.priceSuffix}>грн</span>
                      </div>
                    </div>
                    <div className={styles.priceSlider}>
                      <div className={styles.priceTrack} />
                      <div
                        className={styles.priceTrackFill}
                        style={{ left: `${fillLeftPct}%`, right: `${100 - fillRightPct}%` }}
                      />
                      <input
                        type="range"
                        className={styles.priceRange}
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={currentMin}
                        onChange={e => handleSliderMin(Number(e.target.value))}
                      />
                      <input
                        type="range"
                        className={styles.priceRange}
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={currentMax}
                        onChange={e => handleSliderMax(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitle}>Фільтри</div>
                <button
                  className={`${styles.saleToggle} ${saleOnly ? styles.saleActive : ''}`}
                  onClick={() => setSaleOnly(!saleOnly)}
                >
                  <span className={styles.filterLabel}><FaPercentage /> Тільки акції</span>
                </button>
                <button
                  className={`${styles.savedToggle} ${savedOnly ? styles.savedActive : ''}`}
                  onClick={() => setSavedOnly(!savedOnly)}
                >
                  <span className={styles.filterLabel}><FaHeart /> Збережені</span>
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
