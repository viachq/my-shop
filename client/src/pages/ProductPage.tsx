import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaCheck, FaHeart, FaRegHeart, FaTimes, FaSearchPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { apiToProduct, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadSavedProducts, toggleSavedProduct } from '../components/ProductCard';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import styles from './ProductPage.module.css';

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderMarkdown(md: string): string {
  return md
    .replace(/## (.*)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function getSpecs(product: Product): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [];

  if (product.category) specs.push({ label: 'Категорія', value: product.category });

  const ramStorage = product.name.match(/(\d+)\/(\d+)\s*GB/i);
  const storageOnly = product.name.match(/(?<!\d\/)(\d+)\s*GB/i);
  if (ramStorage) {
    specs.push({ label: 'ОЗП', value: `${ramStorage[1]} GB` });
    specs.push({ label: 'Накопичувач', value: `${ramStorage[2]} GB` });
  } else if (storageOnly) {
    specs.push({ label: 'Накопичувач', value: `${storageOnly[1]} GB` });
  }

  if (product.weight) specs.push({ label: 'Вага', value: product.weight });

  const cat = product.category || '';
  const isApple = product.name.includes('Apple') || product.name.includes('iPhone') || product.name.includes('iPad') || product.name.includes('MacBook') || product.name.includes('AirPods') || product.name.includes('Watch');

  if (cat === 'Смартфони') {
    specs.push({ label: 'ОС', value: isApple ? 'iOS 18' : 'Android 14' });
    specs.push({ label: 'Зв\'язок', value: '5G / LTE / Wi-Fi / Bluetooth' });
  } else if (cat === 'Ноутбуки') {
    specs.push({ label: 'ОС', value: isApple ? 'macOS' : 'Windows 11' });
    specs.push({ label: 'Дисплей', value: '13–15"' });
  } else if (cat === 'Навушники') {
    specs.push({ label: 'Підключення', value: 'Bluetooth 5.3' });
    specs.push({ label: 'Шумозаглушення', value: 'ANC' });
  } else if (cat === 'Смарт-годинники') {
    specs.push({ label: 'Сумісність', value: 'iOS / Android' });
    specs.push({ label: 'Водозахист', value: 'IP68' });
  } else if (cat === 'Планшети') {
    specs.push({ label: 'ОС', value: isApple ? 'iPadOS 18' : 'Android 14' });
    specs.push({ label: 'Підключення', value: 'Wi-Fi / Bluetooth' });
  } else if (cat === 'Акустика') {
    specs.push({ label: 'Підключення', value: 'Bluetooth / Wi-Fi' });
    specs.push({ label: 'Водозахист', value: 'IPX7' });
  } else if (cat === 'Ігрові приставки') {
    specs.push({ label: 'Роздільна здатність', value: '4K / 120 fps' });
    specs.push({ label: 'Сховище', value: 'SSD' });
  } else if (cat === 'Фото та відео') {
    specs.push({ label: 'Тип', value: 'Екшн-камера' });
    specs.push({ label: 'Відео', value: '4K / 60 fps' });
  } else if (cat === 'Мережеве обладнання') {
    specs.push({ label: 'Стандарт', value: 'Wi-Fi 6 (802.11ax)' });
    specs.push({ label: 'Діапазони', value: 'Dual Band' });
  }

  specs.push({ label: 'Гарантія', value: '12 місяців' });

  return specs;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const [added, setAdded] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>(loadSavedProducts);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setPageLoading(true);
    setProduct(null);
    setSelectedImgIdx(0);
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(data => setProduct(apiToProduct(data)))
      .catch(() => setProduct(null))
      .finally(() => setPageLoading(false));
  }, [id]);

  useEffect(() => {
    fetch('/api/products/')
      .then(r => r.json())
      .then(data => setAllProducts(Array.isArray(data) ? data.map(apiToProduct) : []))
      .catch(() => {});
  }, []);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (!product) return;
    setAiAdvice('');
    setAiLoading(true);
    fetch('/api/ai/product-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: product.name, category: product.category }),
    })
      .then(r => r.json())
      .then(data => setAiAdvice(data.success && data.advice ? data.advice : ''))
      .catch(() => setAiAdvice(''))
      .finally(() => setAiLoading(false));
  }, [product?.name]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reviews/product/${id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated || !token) { setCanReview(null); return; }
    fetch(`/api/reviews/can-review/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setCanReview(data.can_review === true))
      .catch(() => setCanReview(null));
  }, [id, isAuthenticated, token]);

  const hasReviewed = isAuthenticated && reviews.some(r => r.user_id === user?.id);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/product/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReviewError(err.detail || 'Помилка при надсиланні відгуку');
        return;
      }
      const newReview: Review = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setReviewComment('');
      setReviewRating(5);
    } catch {
      setReviewError('Помилка з\'єднання з сервером');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch { /* ignore */ }
  };

  if (pageLoading) {
    return (
      <>
        <TopBar />
        <Header />
        <div className={styles.page}>
          <div className="container">
            <div className={styles.notFound}>Завантаження...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TopBar />
        <Header />
        <div className={styles.page}>
          <div className="container">
            <div className={styles.notFound}>
              <div className={styles.notFoundTitle}>404</div>
              <div className={styles.notFoundText}>Товар з таким ідентифікатором не існує</div>
              <Link to="/catalog" className={styles.notFoundLink}>Перейти до каталогу</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isSaved = product.id != null && savedIds.includes(product.id);
  const allImages = product.images?.length ? product.images : [product.img];

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const specs = getSpecs(product);
  const discountPct = product.oldPrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.oldPrice)) * 100)
    : 0;

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link to="/">Головна</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/catalog?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link>
                <span>/</span>
              </>
            )}
            <span>{product.name}</span>
          </nav>

          <div className={styles.detail}>
            <div className={styles.imageWrap}>
              <div className={styles.imageMain} onClick={() => setLightbox(true)}>
                {discountPct > 0 && (
                  <div className={styles.discountBadge}>-{discountPct}%</div>
                )}
                <img className={styles.image} src={allImages[selectedImgIdx]} alt={product.name} />
                <div className={styles.zoomHint}><FaSearchPlus /></div>
              </div>
              {allImages.length > 1 && (
                <div className={styles.thumbs}>
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === selectedImgIdx ? styles.thumbActive : ''}`}
                      onClick={() => setSelectedImgIdx(i)}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.info}>
              {product.category && (
                <div className={styles.badges}>
                  {product.badge === 'sale' && (
                    <span className={`${styles.badge} ${styles.badgeSale}`}>Акція</span>
                  )}
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>{product.category}</span>
                </div>
              )}

              <h2 className={styles.name}>{product.name}</h2>

              {product.avgRating != null && (
                <div className={styles.infoRating}>
                  <span className={styles.infoStars}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(product.avgRating!) ? '#f59e0b' : 'var(--border)' }}>★</span>
                    ))}
                  </span>
                  <span className={styles.infoRatingValue}>{product.avgRating.toFixed(1)}</span>
                  {!!product.reviewCount && (
                    <button
                      className={styles.infoRatingLink}
                      onClick={() => { setReviewsOpen(true); document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    >
                      {product.reviewCount} відгуків
                    </button>
                  )}
                </div>
              )}

              <div className={styles.infoDivider} />

              <div className={styles.priceBlock}>
                <span className={styles.price}>{product.price} &#8372;</span>
                {product.oldPrice && (
                  <span className={styles.oldPrice}>{product.oldPrice} &#8372;</span>
                )}
              </div>

              <div className={styles.stockBadge}>
                <span className={styles.stockDot} />
                В наявності
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
                  onClick={handleAdd}
                >
                  {added ? <><FaCheck /> Додано</> : <><FaShoppingCart /> Додати у кошик</>}
                </button>
                <button
                  className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`}
                  onClick={() => product.id != null && setSavedIds(toggleSavedProduct(product.id))}
                >
                  {isSaved ? <><FaHeart /> Збережено</> : <><FaRegHeart /> Зберегти</>}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sectionsGroup}>

          <div className={styles.aiSection}>
            <button
              className={styles.aiHeader}
              onClick={() => setAiOpen(o => !o)}
              aria-expanded={aiOpen}
            >
              <div className={styles.aiHeaderLeft}>
                <div className={styles.aiTitle}>Опис</div>
                {!aiLoading && aiAdvice && (
                  <span className={styles.aiPowered}>Згенеровано Gemini AI</span>
                )}
              </div>
              <span className={styles.aiToggle}>
                {aiOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {aiOpen && (
              <div className={styles.aiBody}>
                {aiLoading ? (
                  <div className={styles.aiLoading}>
                    <span className={styles.aiSpinner} />
                    <div>
                      <div className={styles.aiLoadingTitle}>Завантажуємо опис...</div>
                      <div className={styles.aiLoadingHint}>Gemini AI готує огляд продукту</div>
                    </div>
                  </div>
                ) : aiAdvice ? (
                  <div
                    className={styles.aiContent}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAdvice) }}
                  />
                ) : (
                  <div className={styles.description}>
                    Оригінальний товар з офіційною гарантією від виробника. Доставка по всій Україні.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.aiSection}>
            <button
              className={styles.aiHeader}
              onClick={() => setSpecsOpen(o => !o)}
              aria-expanded={specsOpen}
            >
              <div className={styles.aiTitle}>Характеристики</div>
              <span className={styles.aiToggle}>
                {specsOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {specsOpen && (
              <div className={styles.aiBody}>
                <table className={styles.specs}>
                  <tbody>
                    {specs.map(s => (
                      <tr key={s.label}>
                        <td className={styles.specLabel}>{s.label}</td>
                        <td className={styles.specValue}>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div id="reviews-section" className={styles.aiSection}>
            <button
              className={styles.aiHeader}
              onClick={() => setReviewsOpen(o => !o)}
              aria-expanded={reviewsOpen}
            >
              <div className={styles.reviewsHeaderLeft}>
                <div className={styles.aiTitle}>Відгуки</div>
                {reviews.length > 0 && (
                  <div className={styles.reviewsSummary}>
                    <span className={styles.reviewStarsDisplay}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </span>
                    <span className={styles.avgRating}>{avgRating.toFixed(1)}</span>
                    <span className={styles.reviewCount}>({reviews.length})</span>
                  </div>
                )}
              </div>
              <span className={styles.aiToggle}>
                {reviewsOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {reviewsOpen && (
              <div className={styles.aiBody}>
                {reviews.length === 0 && !hasReviewed && (
                  <p className={styles.noReviews}>Відгуків ще немає. Будьте першим!</p>
                )}

                {reviews.length > 0 && (
                  <div className={styles.reviewsList}>
                    {reviews.map(r => (
                      <div key={r.id} className={styles.reviewCard}>
                        <div className={styles.reviewMeta}>
                          <span className={styles.reviewAuthor}>{r.user_name}</span>
                          <span className={styles.reviewStarsDisplay}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={s <= r.rating ? styles.starFilled : styles.starEmpty}>★</span>
                            ))}
                          </span>
                          <span className={styles.reviewDate}>{formatDate(r.created_at)}</span>
                          {(r.user_id === user?.id || isAdmin) && (
                            <button
                              className={styles.reviewDeleteBtn}
                              onClick={() => handleDeleteReview(r.id)}
                              title="Видалити"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                        {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {isAuthenticated ? (
                  hasReviewed ? (
                    <p className={styles.alreadyReviewed}>Ви вже залишили відгук для цього товару.</p>
                  ) : canReview === false ? (
                    <p className={styles.reviewLoginPrompt}>
                      Залишити відгук можуть лише покупці, які замовили цей товар.
                    </p>
                  ) : canReview === true ? (
                    <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                      <div className={styles.reviewFormTitle}>Залишити відгук</div>
                      <div className={styles.starPicker}>
                        {[1,2,3,4,5].map(s => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.starPickBtn} ${s <= (reviewHover || reviewRating) ? styles.starPickActive : ''}`}
                            onClick={() => setReviewRating(s)}
                            onMouseEnter={() => setReviewHover(s)}
                            onMouseLeave={() => setReviewHover(0)}
                          >★</button>
                        ))}
                      </div>
                      <textarea
                        className={styles.reviewTextarea}
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Ваш відгук (необов'язково)..."
                        rows={3}
                      />
                      {reviewError && <span className={styles.reviewError}>{reviewError}</span>}
                      <button type="submit" className={styles.reviewSubmitBtn} disabled={reviewSubmitting}>
                        {reviewSubmitting ? 'Надсилання...' : 'Надіслати відгук'}
                      </button>
                    </form>
                  ) : null
                ) : (
                  <p className={styles.reviewLoginPrompt}>
                    <Link to="/login">Увійдіть</Link>, щоб залишити відгук
                  </p>
                )}
              </div>
            )}
          </div>

          </div>{/* sectionsGroup */}

          {related.length > 0 && (
            <div className={styles.related}>
              <h3 className={styles.relatedTitle}>Схожі товари</h3>
              <div className={styles.relatedGrid}>
                {related.map(p => (
                  <ProductCard key={p.id ?? p.name} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(false)}>
            <FaTimes />
          </button>
          {allImages.length > 1 && (
            <>
              <button
                className={styles.lightboxPrev}
                onClick={e => { e.stopPropagation(); setSelectedImgIdx(i => (i - 1 + allImages.length) % allImages.length); }}
              >&#8249;</button>
              <button
                className={styles.lightboxNext}
                onClick={e => { e.stopPropagation(); setSelectedImgIdx(i => (i + 1) % allImages.length); }}
              >&#8250;</button>
            </>
          )}
          <img
            className={styles.lightboxImg}
            src={allImages[selectedImgIdx]}
            alt={product.name}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
}
