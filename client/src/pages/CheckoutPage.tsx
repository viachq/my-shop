import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, promoCode, promoDiscount, promoApplied } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const finalTotal = promoApplied ? cartTotal - promoDiscount : cartTotal;
  const navigate = useNavigate();

  const nameParts = user?.name?.split(' ') ?? [];
  const [name, setName] = useState(nameParts[0] ?? '');
  const [surname, setSurname] = useState(nameParts.slice(1).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [payment, setPayment] = useState('cash');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showRedirect, setShowRedirect] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const liqpayFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (items.length === 0 && !submitting) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, submitting, navigate]);

  if (items.length === 0 && !submitting) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Невірний формат телефону (+380XXXXXXXXX)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Невірний формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem('authToken');
    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);

    const orderBody: Record<string, unknown> = {
      name,
      surname,
      phone,
      email,
      city,
      address,
      comment: comment || null,
      payment_method: payment === 'card' ? 'card' : 'cash',
      delivery_method: 'delivery',
      items: items.map(item => ({
        product_name: item.product.name,
        qty: item.qty,
        price: parseFloat(item.product.price),
      })),
    };

    if (promoApplied && promoCode) {
      orderBody.promo_code = promoCode;
    }

    try {
      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderBody),
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail
          ? (typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail))
          : 'Помилка при створенні замовлення';
        throw new Error(msg);
      }

      const createdOrder = await res.json();

      if (payment === 'card') {
        try {
          const payRes = await fetch('/api/liqpay/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: createdOrder.id, amount: finalTotal }),
          });

          if (!payRes.ok) throw new Error('API error');
          const { data, signature } = await payRes.json();
          const form = liqpayFormRef.current;
          if (!form) throw new Error('Form not found');
          const dataInput = form.querySelector<HTMLInputElement>('input[name="data"]');
          const sigInput = form.querySelector<HTMLInputElement>('input[name="signature"]');
          if (!dataInput || !sigInput) throw new Error('Form inputs not found');

          dataInput.value = data;
          sigInput.value = signature;
          clearCart();
          form.submit();
          return;
        } catch {
          clearCart();
          setShowRedirect(true);
          setTimeout(() => {
            navigate('/order-success', { state: { orderId: createdOrder.id } });
          }, 2000);
        }
      } else {
        clearCart();
        navigate('/order-success', { state: { orderId: createdOrder.id } });
      }
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Помилка при створенні замовлення';
      alert(msg + '\n\nСпробуйте ще раз.');
    }
  };

  return (
    <>
      <TopBar />
      <Header />
      <div className={styles.page}>
        <div className="container">
          {!isAuthenticated && (
            <div className={styles.authBanner}>
              <div className={styles.authBannerIcon}><FaUserPlus /></div>
              <div className={styles.authBannerText}>
                <h3>Для оформлення замовлення потрібен акаунт</h3>
                <p>Увійдіть або зареєструйтесь, щоб оформити замовлення та відстежувати його статус</p>
              </div>
              <div className={styles.authBannerActions}>
                <Link to="/login" className={styles.authBtnLogin}><FaSignInAlt /> Увійти</Link>
                <Link to="/register" className={styles.authBtnRegister}><FaUserPlus /> Зареєструватися</Link>
              </div>
            </div>
          )}
          <form className={styles.grid} onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formTitle}>Контактні дані</h2>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Ім'я<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Ваше ім'я"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Прізвище<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                    required
                    placeholder="Ваше прізвище"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Телефон<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+380 __ ___ __ __"
                  />
                  {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Email<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                  />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>
              </div>

              <h2 className={styles.formTitle}>Адреса доставки</h2>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Місто<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    placeholder="Місто доставки"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Адреса<span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    placeholder="Вулиця, будинок, квартира"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Коментар до замовлення</label>
                <textarea
                  className={styles.textarea}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Побажання до замовлення (необов'язково)"
                />
              </div>

              <div className={styles.radioGroup}>
                <div className={styles.radioGroupTitle}>Спосіб оплати</div>
                <div className={styles.radioOptions}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={payment === 'cash'}
                      onChange={e => setPayment(e.target.value)}
                    />
                    Оплата при отриманні
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={payment === 'card'}
                      onChange={e => setPayment(e.target.value)}
                    />
                    Оплата карткою онлайн
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.summarySection}>
              <h2 className={styles.summaryTitle}>Ваше замовлення</h2>

              <div className={styles.summaryItems}>
                {items.map(item => {
                  const subtotal = parseFloat(item.product.price) * item.qty;
                  return (
                    <div key={item.product.name} className={styles.summaryItem}>
                      <img
                        className={styles.summaryImg}
                        src={item.product.img}
                        alt={item.product.name}
                      />
                      <div className={styles.summaryItemInfo}>
                        <div className={styles.summaryItemName}>{item.product.name}</div>
                        <div className={styles.summaryItemQty}>
                          {item.qty} x {item.product.price} &#8372;
                        </div>
                      </div>
                      <div className={styles.summaryItemPrice}>
                        {subtotal.toFixed(2)} &#8372;
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Товарів:</span>
                <span className={styles.summaryValue}>
                  {items.reduce((sum, i) => sum + i.qty, 0)} шт.
                </span>
              </div>

              {promoApplied && promoDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Знижка ({promoCode}):</span>
                  <span className={styles.summaryValue} style={{ color: '#16a34a', fontWeight: 700 }}>
                    -{promoDiscount.toFixed(2)} &#8372;
                  </span>
                </div>
              )}

              <div className={styles.summaryTotalRow}>
                <span className={styles.summaryTotalLabel}>Разом:</span>
                <span className={styles.summaryTotalValue}>
                  {finalTotal.toFixed(2)} &#8372;
                </span>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <FaShoppingCart /> Підтвердити замовлення
              </button>
            </div>
          </form>
        </div>
      </div>

      <form
        ref={liqpayFormRef}
        action="https://www.liqpay.ua/api/3/checkout"
        method="POST"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="data" value="" />
        <input type="hidden" name="signature" value="" />
      </form>

      {showRedirect && (
        <div className={styles.redirectOverlay}>
          <div className={styles.redirectBox}>
            <h3>Перенаправлення на оплату...</h3>
            <p>Зачекайте, будь ласка</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
