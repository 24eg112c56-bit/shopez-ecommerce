import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ cart, user, onUpdateCartQty, onRemoveFromCart, onClearCart }) => {
  const navigate = useNavigate();

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const priceAfterDiscount = item.price * (1 - (item.discount || 0) / 100);
    return sum + priceAfterDiscount * item.quantity;
  }, 0);

  const discountAmount = cart.reduce((sum, item) => {
    if (item.discount > 0) {
      const originalSubtotal = item.price * item.quantity;
      const discountedSubtotal = item.price * (1 - item.discount / 100) * item.quantity;
      return sum + (originalSubtotal - discountedSubtotal);
    }
    return sum;
  }, 0);

  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.balance < total) {
      return; // Handled by UI warning
    }
    navigate('/checkout');
  };

  const isCartEmpty = cart.length === 0;
  const isBalanceInsufficient = user && user.balance < total;

  return (
    <div style={styles.page}>
      <h1 style={{ fontSize: '2.25rem', marginBottom: '32px' }}>Shopping Cart</h1>

      {isCartEmpty ? (
        <div className="glass-card" style={styles.emptyCart}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>🛒</span>
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* Left: Cart Items List */}
          <div style={styles.itemsList}>
            <div style={styles.listHeader}>
              <span style={{ flex: '2' }}>Product</span>
              <span style={{ flex: '1', textAlign: 'center' }}>Price</span>
              <span style={{ flex: '1', textAlign: 'center' }}>Quantity</span>
              <span style={{ flex: '1', textAlign: 'right' }}>Total</span>
            </div>

            {cart.map((item) => {
              const activePrice = item.price * (1 - (item.discount || 0) / 100);
              return (
                <div key={item._id} className="glass-card" style={styles.cartItem}>
                  {/* Product Details info */}
                  <div style={{ flex: '2', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={styles.itemImg} />
                    <div>
                      <Link to={`/products/${item._id}`} style={styles.itemName}>{item.name}</Link>
                      <span className="badge badge-category" style={{ fontSize: '0.6rem', marginTop: '6px' }}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div style={{ flex: '1', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600' }}>${activePrice.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span style={styles.itemOriginalPrice}>${item.price.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Quantity adjustment buttons */}
                  <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => onUpdateCartQty(item._id, item.quantity - 1)} 
                      style={styles.qtyBtn}
                      className="btn btn-secondary"
                    >
                      -
                    </button>
                    <span style={{ fontWeight: '700' }}>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateCartQty(item._id, item.quantity + 1)} 
                      style={styles.qtyBtn}
                      className="btn btn-secondary"
                    >
                      +
                    </button>
                  </div>

                  {/* Total price for the line item */}
                  <div style={{ flex: '1', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>
                      ${(activePrice * item.quantity).toFixed(2)}
                    </span>
                    <button onClick={() => onRemoveFromCart(item._id)} style={styles.removeBtn}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={styles.actionsRow}>
              <Link to="/" className="btn btn-secondary">← Continue Shopping</Link>
              <button onClick={onClearCart} className="btn btn-secondary" style={{ color: 'var(--accent-red)' }}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Right: Checkout Summary Panel */}
          <div style={styles.summaryContainer}>
            <div className="glass-card" style={styles.summaryCard}>
              <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
                Order Summary
              </h3>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${(subtotal + discountAmount).toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ ...styles.summaryRow, color: 'var(--secondary)' }}>
                  <span>Discounts Applied</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={styles.summaryRow}>
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <small style={styles.shippingNotice}>
                *Free shipping on orders over $150.00
              </small>

              <div style={styles.totalRow}>
                <span>Grand Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Wallet Info Alert */}
              {user ? (
                <div 
                  style={{
                    ...styles.walletAlert,
                    borderColor: isBalanceInsufficient ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                    background: isBalanceInsufficient ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Wallet Balance:</span>
                    <span 
                      style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        color: isBalanceInsufficient ? 'var(--accent-red)' : 'var(--accent-green)' 
                      }}
                    >
                      ${user.balance.toFixed(2)}
                    </span>
                  </div>
                  {isBalanceInsufficient && (
                    <p style={styles.insufficientText}>
                      ⚠️ Insufficient virtual balance. Click on the card balance in the navbar to top up.
                    </p>
                  )}
                </div>
              ) : (
                <div style={styles.loginPrompt}>
                  Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>login</Link> to complete checkout.
                </div>
              )}

              <button
                onClick={handleCheckoutClick}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '16px' }}
                disabled={isCartEmpty || isBalanceInsufficient}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 0',
  },
  emptyCart: {
    padding: '80px 40px',
    textAlign: 'center',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '40px',
    alignItems: 'start',
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr',
    }
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  listHeader: {
    display: 'flex',
    padding: '0 20px',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontWeight: '600',
    '@media (max-width: 600px)': {
      display: 'none',
    }
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  itemImg: {
    width: '70px',
    height: '70px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    background: '#1a1f2c',
  },
  itemName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '1rem',
    display: 'block',
    lineHeight: '1.4',
    transition: 'var(--transition-smooth)',
  },
  itemOriginalPrice: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    padding: '0',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-red)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0',
    transition: 'var(--transition-smooth)',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  summaryContainer: {
    position: 'sticky',
    top: '100px',
  },
  summaryCard: {
    padding: '30px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    marginBottom: '16px',
    color: 'var(--text-secondary)',
  },
  shippingNotice: {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    marginTop: '-12px',
    marginBottom: '16px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '20px',
    marginBottom: '20px',
  },
  walletAlert: {
    padding: '16px',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
  },
  insufficientText: {
    fontSize: '0.75rem',
    color: 'var(--accent-red)',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  loginPrompt: {
    padding: '12px',
    textAlign: 'center',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  }
};

export default Cart;
