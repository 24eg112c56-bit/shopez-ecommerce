import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      
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
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to ShopEZ</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="password">Password</label>
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.signupLink}>
            Create one free
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
    maxWidth: '450px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
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
  signupLink: {
    color: 'var(--primary)',
    fontWeight: '600',
  }
};

export default Login;
