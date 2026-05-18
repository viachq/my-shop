import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaCheck, FaHeart, FaRegHeart, FaTimes, FaSearchPlus } from 'react-icons/fa';
import { apiToProduct, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
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

interface Spec {
  label: string;
  value: string;
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

type Tab = 'description' | 'specs' | 'reviews';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const [added, setAdded] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>(loadSavedProducts);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiSpecs, setAiSpecs] = useState<Spec[]>([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [lightbox, setLightbox] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setPageLoading(true);
    setProduct(null);
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
      .slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (!product) return;
    setAiAdvice('');
    setAiSpecs([]);
    setAiLoading(true);
    fetch('/api/ai/product-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: product.name, category: product.category }),
    })
      .then(r => r.json())
      .then(data => {
        setAiAdvice(data.success && data.advice ? data.advice : '');
        setAiSpecs(Array.isArray(data.specs) ? data.specs : []);
      })
      .catch(() => { setAiAdvice(''); setAiSpecs([]); })
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
        <div className={styles.page}><div className="container"><div className={styles.notFound}>Завантаження...</div></div></div>
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
  const handleAdd = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1000); };

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
              <><Link to={`/catalog?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span></>
            )}
            <span>{product.name}</span>
          </nav>

          <div className={styles.detail}>
            <div className={styles.imageWrap}>
              <div className={styles.imageMain} onClick={() => setLightbox(true)}>
                <img className={styles.image} src={product.img} alt={product.name} />
                <div className={styles.zoomHint}><FaSearchPlus /></div>
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoInner}>
                <h1 className={styles.name}>{product.name}</h1>

                {product.avgRating != null && (
                  <div className={styles.infoRating}>
                    <span className={styles.infoStars}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= Math.round(product.avgRating!) ? '#f59e0b' : 'var(--border)' }}>&#9733;</span>
                      ))}
                    </span>
                    <span className={styles.infoRatingValue}>{product.avgRating.toFixed(1)}</span>
                    {!!product.reviewCount && (
                      <button className={styles.infoRatingLink} onClick={() => setActiveTab('reviews')}>
                        {product.reviewCount} відгуків
                      </button>
                    )}
                  </div>
                )}

                <div className={styles.priceCard}>
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>{formatPrice(product.price)} &#8372;</span>
                    {product.oldPrice && <span className={styles.oldPrice}>{formatPrice(product.oldPrice)} &#8372;</span>}
                  </div>
                  <div className={styles.stockBadge}><span className={styles.stockDot} />В наявності</div>
                  <div className={styles.actions}>
                    <button className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`} onClick={handleAdd}>
                      {added ? <><FaCheck /> Додано</> : <><FaShoppingCart /> Додати у кошик</>}
                    </button>
                    <button className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`} onClick={() => product.id != null && setSavedIds(toggleSavedProduct(product.id))}>
                      {isSaved ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Full-width tabs ── */}
          <div className={styles.tabs}>
            <div className={styles.tabBar}>
              <button className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`} onClick={() => setActiveTab('description')}>
                Опис
              </button>
              <button className={`${styles.tab} ${activeTab === 'specs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('specs')}>
                Характеристики
                {aiSpecs.length > 0 && <span className={styles.tabBadge}>{aiSpecs.length}</span>}
              </button>
              <button className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`} onClick={() => setActiveTab('reviews')}>
                Відгуки
                {reviews.length > 0 && <span className={styles.tabBadge}>{reviews.length}</span>}
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.descriptionTab}>
                  {aiLoading ? (
                    <div className={styles.aiLoading}>
                      <span className={styles.aiSpinner} />
                      <div>
                        <div className={styles.aiLoadingTitle}>Генеруємо опис...</div>
                        <div className={styles.aiLoadingHint}>Gemini AI готує огляд продукту</div>
                      </div>
                    </div>
                  ) : aiAdvice ? (
                    <>
                      <div className={styles.aiPowered}>Згенеровано Gemini AI</div>
                      <div className={styles.aiContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAdvice) }} />
                    </>
                  ) : (
                    <p className={styles.descFallback}>Оригінальний товар з офіційною гарантією від виробника. Доставка по всій Україні.</p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className={styles.specsTab}>
                  {aiLoading ? (
                    <div className={styles.aiLoading}>
                      <span className={styles.aiSpinner} />
                      <div>
                        <div className={styles.aiLoadingTitle}>Генеруємо характеристики...</div>
                        <div className={styles.aiLoadingHint}>Gemini AI аналізує продукт</div>
                      </div>
                    </div>
                  ) : aiSpecs.length > 0 ? (
                    <>
                      <div className={styles.aiPowered}>Згенеровано Gemini AI</div>
                      <table className={styles.specs}>
                        <tbody>
                          {aiSpecs.map((s, i) => (
                            <tr key={i}>
                              <td className={styles.specLabel}>{s.label}</td>
                              <td className={styles.specValue}>{s.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p className={styles.descFallback}>Характеристики для цього товару поки не доступні.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  {reviews.length > 0 && (
                    <div className={styles.reviewsSummary}>
                      <span className={styles.reviewStarsDisplay}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={s <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}>&#9733;</span>
                        ))}
                      </span>
                      <span className={styles.avgRating}>{avgRating.toFixed(1)}</span>
                      <span className={styles.reviewCount}>({reviews.length} відгуків)</span>
                    </div>
                  )}

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
                                <span key={s} className={s <= r.rating ? styles.starFilled : styles.starEmpty}>&#9733;</span>
                              ))}
                            </span>
                            <span className={styles.reviewDate}>{formatDate(r.created_at)}</span>
                            {(r.user_id === user?.id || isAdmin) && (
                              <button className={styles.reviewDeleteBtn} onClick={() => handleDeleteReview(r.id)} title="Видалити"><FaTimes /></button>
                            )}
                          </div>
                          {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {isAuthenticated ? (
                    hasReviewed ? (
                      <p className={styles.reviewNote}>Ви вже залишили відгук для цього товару.</p>
                    ) : canReview === false ? (
                      <p className={styles.reviewNote}>Залишити відгук можуть лише покупці, які замовили цей товар.</p>
                    ) : canReview === true ? (
                      <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                        <div className={styles.reviewFormTitle}>Залишити відгук</div>
                        <div className={styles.starPicker}>
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button"
                              className={`${styles.starPickBtn} ${s <= (reviewHover || reviewRating) ? styles.starPickActive : ''}`}
                              onClick={() => setReviewRating(s)}
                              onMouseEnter={() => setReviewHover(s)}
                              onMouseLeave={() => setReviewHover(0)}
                            >&#9733;</button>
                          ))}
                        </div>
                        <textarea className={styles.reviewTextarea} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Ваш відгук (необов'язково)..." rows={3} />
                        {reviewError && <span className={styles.reviewError}>{reviewError}</span>}
                        <button type="submit" className={styles.reviewSubmitBtn} disabled={reviewSubmitting}>
                          {reviewSubmitting ? 'Надсилання...' : 'Надіслати відгук'}
                        </button>
                      </form>
                    ) : null
                  ) : (
                    <p className={styles.reviewNote}><Link to="/login">Увійдіть</Link>, щоб залишити відгук</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div className={styles.related}>
              <h3 className={styles.relatedTitle}>Популярне в категорії «{product.category}»</h3>
              <div className={styles.relatedGrid}>
                {related.map(p => <ProductCard key={p.id ?? p.name} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(false)}><FaTimes /></button>
          <img className={styles.lightboxImg} src={product.img} alt={product.name} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </>
  );
}
