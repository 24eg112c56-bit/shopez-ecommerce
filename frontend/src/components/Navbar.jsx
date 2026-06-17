import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Navbar = ({ user, onLogout, cartCount, onTopupSuccess }) => {
  const navigate = useNavigate();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    if (!topupAmount || isNaN(topupAmount) || parseFloat(topupAmount) <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/topup', { amount: parseFloat(topupAmount) });
      if (response.data.success) {
        onTopupSuccess(response.data.balance);
        setShowTopupModal(false);
        setTopupAmount('');
      } else {
        setError(response.data.message || 'Top up failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing top up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav style={styles.nav} className="glass-card">
        <div style={styles.navContainer} className="container">
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span> Shop<span className="gradient-text">EZ</span>
          </Link>
          
          <div style={styles.navLinks}>
            <Link to="/" style={styles.link}>Shop</Link>
            
            {user ? (
              <>
                {user.role === 'USER' ? (
                  <>
                    <Link to="/orders" style={styles.link}>My Orders</Link>
                    <Link to="/cart" style={styles.cartLink}>
                      Cart
                      {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" style={styles.link}>Seller Dashboard</Link>
                )}
                
                {/* Wallet Balance Display */}
                {user.role === 'USER' && (
                  <div 
                    style={styles.wallet} 
                    onClick={() => setShowTopupModal(true)} 
                    title="Click to top up virtual funds"
                  >
                    <span style={styles.walletIcon}>💳</span>
                    <span style={styles.walletBalance}>${user.balance.toFixed(2)}</span>
                    <span style={styles.walletPlus}>+</span>
                  </div>
                )}
                
                <div style={styles.userInfo}>
                  <span style={styles.username}>Hi, {user.name.split(' ')[0]}</span>
                  <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                </div>
              </>
            ) : (
              <div style={styles.authLinks}>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
                <Link to="/register" style={styles.registerBtn} className="btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Top-up Wallet Modal */}
      {showTopupModal && (
        <div className="modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Top Up Virtual Wallet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Add virtual funds to simulate buying more e-commerce products. Your transactions will deduct from this amount.
            </p>
            
            {error && <div style={styles.modalError}>{error}</div>}
            
            <form onSubmit={handleTopupSubmit}>
              <div className="form-group">
                <label>Amount to Add ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="form-control"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="1"
                  step="any"
                  required
                  autoFocus
                />
              </div>
              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowTopupModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: '0',
    zIndex: '100',
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid var(--border-glass)',
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '75px',
  },
  logo: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    padding: '6px 0',
  },
  cartLink: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    position: 'relative',
    padding: '6px 0',
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-16px',
    background: 'var(--secondary)',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallet: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '9999px',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  walletIcon: {
    fontSize: '0.9rem',
  },
  walletBalance: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  walletPlus: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: 'var(--accent)',
    paddingLeft: '4px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '1px solid var(--border-glass)',
    paddingLeft: '20px',
  },
  username: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--accent-red)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loginBtn: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    padding: '8px 16px',
  },
  registerBtn: {
    padding: '8px 20px',
    borderRadius: 'var(--radius-md)',
  },
  modalError: {
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  }
};

export default Navbar;
