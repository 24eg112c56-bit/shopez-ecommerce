import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' // 'USER' (Buyer) or 'SELLER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
      if (res.data.success) {
        localStorage.setItem('shopez_token', res.data.token);
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          balance: res.data.balance
        };
        localStorage.setItem('shopez_user', JSON.stringify(userData));
        
        onLoginSuccess(userData);
        
        // Redirect based on role
        if (userData.role === 'SELLER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Get started with ShopEZ today</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="form-control"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Account Role Selector */}
          <div className="form-group">
            <label>I want to sign up as a:</label>
            <div style={styles.roleGroup}>
              <label 
                style={{
                  ...styles.roleLabel,
                  borderColor: role === 'USER' ? 'var(--primary)' : 'var(--border-glass)',
                  background: role === 'USER' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === 'USER'}
                  onChange={onChange}
                  style={styles.radioInput}
                />
                <div style={styles.roleDetails}>
                  <span style={styles.roleTitle}>Buyer</span>
                  <span style={styles.roleDesc}>Browse and purchase products</span>
                </div>
              </label>

              <label 
                style={{
                  ...styles.roleLabel,
                  borderColor: role === 'SELLER' ? 'var(--primary)' : 'var(--border-glass)',
                  background: role === 'SELLER' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="SELLER"
                  checked={role === 'SELLER'}
                  onChange={onChange}
                  style={styles.radioInput}
                />
                <div style={styles.roleDetails}>
                  <span style={styles.roleTitle}>Seller</span>
                  <span style={styles.roleDesc}>List products & manage orders</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 6 chars)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  roleGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '6px',
  },
  roleLabel: {
    flex: '1',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  radioInput: {
    marginTop: '4px',
  },
  roleDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  roleTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  roleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  errorAlert: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  loginLink: {
    color: 'var(--primary)',
    fontWeight: '600',
  }
};

export default Register;
