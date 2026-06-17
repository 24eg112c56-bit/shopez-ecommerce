import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Checkout = ({ cart, user, onCheckoutSuccess, triggerNotification }) => {
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { address, city, zipCode } = shippingAddress;

  // Calculate total
  const subtotal = cart.reduce((sum, item) => {
    const priceAfterDiscount = item.price * (1 - (item.discount || 0) / 100);
    return sum + priceAfterDiscount * item.quantity;
  }, 0);
  const shippingFee = subtotal > 150 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  const onChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !zipCode) {
      setError('Please provide complete shipping details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        items: orderItems,
        shippingAddress
      });

      if (response.data.success) {
        setSuccess(true);
        triggerNotification('Order placed successfully! Wallet funds deducted.');
        onCheckoutSuccess(response.data.updatedBalance);
        
        // Wait 2.5 seconds to show visual success animation, then redirect
        setTimeout(() => {
          navigate('/orders');
        }, 2500);
      } else {
        setError(response.data.message || 'Checkout failed');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during checkout process.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div className="glass-card" style={styles.successCard}>
          <div style={styles.successCheck}>✓</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your simulated payment was successful. Funds have been deducted from your virtual wallet.
          </p>
          <div style={styles.redirectNotice}>
            Redirecting to your Order History...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={{ fontSize: '2.25rem', marginBottom: '32px' }}>Secure Checkout</h1>

      <div style={styles.layout}>
        {/* Left: Shipping details Form */}
        <div className="glass-card" style={styles.formCard}>
          <h3 style={{ marginBottom: '24px' }}>Shipping Information</h3>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={onChange}
                className="form-control"
                placeholder="123 Main St"
                required
              />
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={onChange}
                  className="form-control"
                  placeholder="San Francisco"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={zipCode}
                  onChange={onChange}
                  className="form-control"
                  placeholder="94103"
                  required
                />
              </div>
            </div>

            {/* Virtual payment summary disclaimer */}
            <div style={styles.paymentNotice}>
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <div>
                <strong>Simulated Wallet Checkout</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  No real-world credit cards are required. Funds will be deducted from your mock wallet balance.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '16px' }}
              disabled={loading || cart.length === 0}
            >
              {loading ? 'Processing Transaction...' : `Pay $${total.toFixed(2)} Now`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary Panel */}
        <div style={styles.summaryCardContainer}>
          <div className="glass-card" style={styles.summaryCard}>
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
              Your Items ({cart.length})
            </h3>

            <div style={styles.itemsScroll}>
              {cart.map((item) => {
                const activePrice = item.price * (1 - (item.discount || 0) / 100);
                return (
                  <div key={item._id} style={styles.summaryItem}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={styles.itemImg} />
                      <div>
                        <span style={styles.itemName} title={item.name}>{item.name}</span>
                        <span style={styles.itemQty}>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: '600' }}>
                      ${(activePrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={styles.priceSummary}>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div style={styles.totalRow}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '40px',
    alignItems: 'start',
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr',
    }
  },
  formCard: {
    padding: '32px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
  },
  paymentNotice: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
    fontSize: '0.9rem',
    alignItems: 'center',
  },
  errorAlert: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  summaryCardContainer: {
    position: 'sticky',
    top: '100px',
  },
  summaryCard: {
    padding: '30px',
  },
  itemsScroll: {
    maxHeight: '220px',
    overflowY: 'auto',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '16px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  itemImg: {
    width: '45px',
    height: '45px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    background: '#1a1f2c',
  },
  itemName: {
    fontWeight: '500',
    fontSize: '0.9rem',
    color: '#ffffff',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  itemQty: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  priceSummary: {
    paddingTop: '4px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    marginBottom: '12px',
    color: 'var(--text-secondary)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '16px',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '40px 20px',
  },
  successCard: {
    maxWidth: '500px',
    padding: '50px 40px',
    textAlign: 'center',
  },
  successCheck: {
    width: '72px',
    height: '72px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '2px solid var(--accent-green)',
    borderRadius: '50%',
    color: 'var(--accent-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.25rem',
    marginBottom: '24px',
  },
  redirectNotice: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  }
};

export default Checkout;
