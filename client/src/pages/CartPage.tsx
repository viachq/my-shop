import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import {
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
  FaLock,
  FaPlus,
  FaTag,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { apiToProduct, type Product } from '../data/products';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './CartPage.module.css';

export default function CartPage() {
  const {
    items, updateQty, removeFromCart, clearCart, cartTotal, cartCount, addToCart,
    promoCode, setPromoCode, promoDiscount, setPromoDiscount, promoApplied, setPromoApplied,
  } = useCart();
  const navigate = useNavigate();

  const [suggested, setSuggested] = useState<Product[]>([]);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoIsError, setPromoIsError] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = cartTotal;
  const total = subtotal - promoDiscount;

  useEffect(() => {
    let cancelled = false;
    async function loadSuggested() {
      try {
        const res = await fetch('/api/products/');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setSuggested(data.map(apiToProduct).slice(0, 4));
        }
      } catch {
        if (!cancelled) setSuggested([]);
      }
    }
    if (items.length === 0) {
      loadSuggested();
    }
    return () => {
      cancelled = true;
    };
  }, [items.length]);

  async function handlePromoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim()) {
      setPromoMessage('');
      setPromoIsError(false);
      return;
    }
    setPromoLoading(true);
    try {
      const res = await fetch('/api/promocodes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), order_total: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoDiscount(data.discount);
        setPromoApplied(true);
        setPromoMessage(data.message || 'Промокод застосовано');
        setPromoIsError(false);
      } else {
        setPromoDiscount(0);
        setPromoApplied(false);
        setPromoMessage(data.message || 'Промокод недійсний');
        setPromoIsError(true);
      }
    } catch {
      setPromoDiscount(0);
      setPromoApplied(false);
      setPromoMessage('Помилка перевірки промокоду');
      setPromoIsError(true);
    } finally {
      setPromoLoading(false);
    }
  }

  function handleClearPromo() {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoMessage('');
    setPromoIsError(false);
  }

  useEffect(() => {
    if (promoApplied) {
      handleClearPromo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCount, cartTotal]);

  if (items.length === 0) {
    const fallbackSuggested = suggested;
    return (
      <>
        <TopBar />
        <Header />
        <div className={styles.page}>
          <div className="container">
            <div className={styles.content}>
              <div className={styles.empty}>
                <div className={styles.emptyIcon}><FaShoppingCart /></div>
                <div className={styles.emptyTitle}>Кошик порожній</div>
                <p className={styles.emptyText}>Додайте товари з каталогу, щоб оформити замовлення</p>
                <Link to="/catalog" className={styles.emptyLink}>
                  Перейти до каталогу <FaArrowRight />
                </Link>
              </div>

              {fallbackSuggested.length > 0 && (
                <div className={styles.recommendSection}>
                  <h2 className={styles.recommendTitle}>Рекомендуємо спробувати</h2>
                  <div className={styles.recommendGrid}>
                    {fallbackSuggested.map((p, idx) => (
                      <div
                        key={p.name}
                        className={styles.recommendCard}
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className={styles.recommendImgWrap}>
                          <img src={p.img} alt={p.name} className={styles.recommendImg} />
                        </div>
                        <div className={styles.recommendBody}>
                          <div className={styles.recommendName}>{p.name}</div>
                          <div className={styles.recommendBottom}>
                            <span className={styles.recommendPrice}>{formatPrice(p.price)} &#8372;</span>
                            <button
                              className={styles.recommendAddBtn}
                              onClick={() => addToCart(p)}
                              title="Додати в кошик"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.content}>
            <div className={styles.itemsHeader}>
              <span className={styles.itemsHeaderTitle}>Кошик</span>
              <button className={styles.clearLinkBtn} onClick={clearCart}>
                <FaTrash /> Очистити кошик
              </button>
            </div>

            <div className={styles.layout}>
              <div className={styles.itemsColumn}>
                <div className={styles.itemsList}>
                  {items.map((item, idx) => {
                    const lineTotal = parseFloat(item.product.price) * item.qty;
                    const linkId = item.product.id;
                    return (
                      <div
                        key={item.product.name}
                        className={styles.itemCard}
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {linkId != null ? (
                          <Link to={`/product/${linkId}`} className={styles.itemImgWrap}>
                            <img className={styles.itemImg} src={item.product.img} alt={item.product.name} />
                          </Link>
                        ) : (
                          <div className={styles.itemImgWrap}>
                            <img className={styles.itemImg} src={item.product.img} alt={item.product.name} />
                          </div>
                        )}

                        <div className={styles.itemBody}>
                          <div className={styles.itemMeta}>
                            {linkId != null ? (
                              <Link to={`/product/${linkId}`} className={styles.itemNameLink}>
                                {item.product.name}
                              </Link>
                            ) : (
                              <div className={styles.itemName}>{item.product.name}</div>
                            )}
                            <span className={styles.itemTotal}>{formatPrice(lineTotal)} &#8372;</span>
                            <span className={styles.itemUnitPrice}>
                              {formatPrice(item.product.price)} &#8372; / шт.
                            </span>
                          </div>

                          <div className={styles.itemActions}>
                            <div className={styles.qtyControl}>
                              <button
                                className={styles.qtyBtn}
                                onClick={() => updateQty(item.product.name, item.qty - 1)}
                                disabled={item.qty <= 1}
                              >
                                &minus;
                              </button>
                              <span className={styles.qtyValue}>{item.qty}</span>
                              <button
                                className={styles.qtyBtn}
                                onClick={() => updateQty(item.product.name, item.qty + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              className={styles.removeBtn}
                              onClick={() => removeFromCart(item.product.name)}
                              title="Видалити"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className={styles.summaryColumn}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <h2 className={styles.summaryTitle}>Ваше замовлення</h2>
                  </div>

                  <div className={styles.summaryBody}>
                    <div className={styles.summaryRow}>
                      <span>Товарів</span>
                      <span className={styles.summaryCount}>{cartCount} шт.</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Сума</span>
                      <span>{formatPrice(subtotal)} &#8372;</span>
                    </div>

                    {promoApplied && promoDiscount > 0 && (
                      <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                        <span>
                          Знижка
                          <span className={styles.promoBadge}>
                            <FaTag /> {promoCode}
                          </span>
                        </span>
                        <span className={styles.discountValue}>-{formatPrice(promoDiscount)} &#8372;</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.promoSection}>
                    {!promoApplied ? (
                      <form className={styles.promoRow} onSubmit={handlePromoSubmit}>
                        <div className={styles.promoInputWrap}>
                          <FaTag className={styles.promoIcon} />
                          <input
                            type="text"
                            className={styles.promoInput}
                            placeholder="Введіть промокод"
                            value={promoCode}
                            onChange={e => {
                              setPromoCode(e.target.value.toUpperCase());
                              if (promoMessage) {
                                setPromoMessage('');
                                setPromoIsError(false);
                              }
                            }}
                            disabled={promoLoading}
                          />
                        </div>
                        <button type="submit" className={styles.promoBtn} disabled={promoLoading}>
                          {promoLoading ? '...' : 'Ок'}
                        </button>
                      </form>
                    ) : (
                      <div className={styles.promoAppliedRow}>
                        <span className={styles.promoAppliedText}>
                          <FaCheck /> <strong>{promoCode}</strong> застосовано
                        </span>
                        <button
                          type="button"
                          className={styles.promoRemoveBtn}
                          onClick={handleClearPromo}
                          title="Видалити промокод"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}

                    {promoMessage && !promoApplied && (
                      <div className={promoIsError ? styles.promoError : styles.promoSuccess}>
                        {promoMessage}
                      </div>
                    )}
                  </div>

                  <div className={styles.totalSection}>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>До сплати</span>
                      <span className={styles.totalValue}>{formatPrice(total)} &#8372;</span>
                    </div>

                    <button
                      className={styles.checkoutBtn}
                      onClick={() => navigate('/checkout')}
                    >
                      <FaLock /> Оформити замовлення
                    </button>
                  </div>

                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
