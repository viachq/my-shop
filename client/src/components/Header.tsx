import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaClock, FaTimes, FaBoxOpen, FaSignOutAlt } from 'react-icons/fa';
import { categories, catImages } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

interface ProductHint {
  id: number;
  name: string;
  img: string | null;
  price: number;
}

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem('searchHistory') || '[]'); }
  catch { return []; }
}

function saveHistory(history: string[]) {
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

export default function Header() {
  const [catOpen, setCatOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [allProducts, setAllProducts] = useState<ProductHint[]>([]);
  const [productsFetched, setProductsFetched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(() => {
    if (productsFetched) return;
    setProductsFetched(true);
    fetch('/api/products/')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data.map((p: { id: number; name: string; img: string | null; price: number }) => ({
            id: p.id, name: p.name, img: p.img, price: p.price,
          })));
        }
      })
      .catch(() => {});
  }, [productsFetched]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const q = query.trim();
  const suggestions = q.length > 1
    ? allProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const recommendations = q.length === 0
    ? [...allProducts].sort(() => 0).slice(0, 5)
    : [];

  const showDropdown = focused && (
    suggestions.length > 0 ||
    history.length > 0 ||
    recommendations.length > 0
  );

  const pushHistory = (term: string) => {
    const next = [term, ...history.filter(h => h !== term)].slice(0, 6);
    setHistory(next);
    saveHistory(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    pushHistory(q);
    setFocused(false);
    navigate(`/catalog?search=${encodeURIComponent(q)}`);
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    setFocused(false);
    navigate(`/catalog?search=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (id: number) => {
    if (query.trim()) pushHistory(query.trim());
    setFocused(false);
    setQuery('');
    navigate(`/product/${id}`);
  };

  const removeHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = history.filter(h => h !== term);
    setHistory(next);
    saveHistory(next);
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <Link to="/" className={styles.logo}>Tech<span>Box</span></Link>

          <div
            className={styles.catalogWrap}
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className={styles.catalogBtn}>
              <FaBars /> Каталог
            </button>
            {catOpen && (
              <div className={styles.dropdown}>
                {categories.map(cat => (
                  <Link
                    to={`/catalog?cat=${encodeURIComponent(cat)}`}
                    key={cat}
                    className={styles.dropdownItem}
                    onClick={() => setCatOpen(false)}
                  >
                    {catImages[cat] && (
                      <img src={catImages[cat]} alt="" className={styles.dropdownImg} />
                    )}
                    <span>{cat}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.searchWrap} ref={wrapRef}>
            <form className={styles.search} onSubmit={handleSearch}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Пошук товарів..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => { setFocused(true); fetchProducts(); }}
                autoComplete="off"
              />
            </form>

            {showDropdown && (
              <div className={styles.searchDropdown}>
                {q.length === 0 ? (
                  <>
                    {history.length > 0 && (
                      <>
                        <div className={styles.sdLabel}>Недавні пошуки</div>
                        {history.map(term => (
                          <div key={term} className={styles.sdRow} onClick={() => handleHistoryClick(term)}>
                            <FaClock className={styles.sdRowIcon} />
                            <span className={styles.sdRowText}>{term}</span>
                            <button className={styles.sdRemove} onClick={e => removeHistory(term, e)} tabIndex={-1}>
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                    {recommendations.length > 0 && (
                      <>
                        <div className={styles.sdLabel}>Рекомендовані</div>
                        {recommendations.map(p => (
                          <div key={p.id} className={styles.sdProduct} onClick={() => handleProductClick(p.id)}>
                            {p.img
                              ? <img src={p.img} alt={p.name} className={styles.sdImg} />
                              : <div className={styles.sdImgEmpty} />
                            }
                            <span className={styles.sdProductName}>{p.name}</span>
                            <span className={styles.sdProductPrice}>{formatPrice(p.price)} ₴</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  suggestions.length > 0 && (
                    <>
                      <div className={styles.sdLabel}>Товари</div>
                      {suggestions.map(p => (
                        <div key={p.id} className={styles.sdProduct} onClick={() => handleProductClick(p.id)}>
                          {p.img
                            ? <img src={p.img} alt={p.name} className={styles.sdImg} />
                            : <div className={styles.sdImgEmpty} />
                          }
                          <span className={styles.sdProductName}>{p.name}</span>
                          <span className={styles.sdProductPrice}>{formatPrice(p.price)} ₴</span>
                        </div>
                      ))}
                    </>
                  )
                )}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <div className={styles.accountWrap}>
                <div className={styles.actionBtn}>
                  <FaUser />
                  <span>Кабінет</span>
                </div>
                <div className={styles.accountDropdown}>
                  <Link to="/profile" className={styles.accountItem}>
                    <FaUser /> Особисті дані
                  </Link>
                  <Link to="/orders" className={styles.accountItem}>
                    <FaBoxOpen /> Мої замовлення
                  </Link>
                  <div className={styles.accountDivider} />
                  <button className={styles.accountItem} onClick={() => { logout(); navigate('/'); }}>
                    <FaSignOutAlt /> Вийти
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className={styles.actionBtn}>
                <FaUser />
                <span>Вхід</span>
              </Link>
            )}
            <Link to="/cart" className={`${styles.actionBtn} ${styles.cartBtn}`}>
              <FaShoppingCart />
              <span>Кошик</span>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
