import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = ({ user, onAddToCart, triggerNotification }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Books'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category !== 'All') queryParams.append('category', category);

      const response = await api.get(`/products?${queryParams.toString()}`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay search trigger slightly for typing buffer
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
    triggerNotification(`Added "${product.name}" to cart!`);
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <header className="glass-card" style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badgeLabel} className="badge badge-category">NEW EXPERIENCE</span>
          <h1 style={styles.heroTitle}>
            Discover Future-Proof Shopping with <span className="gradient-text">ShopEZ</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Your one-stop destination for effortless online shopping. Secure simulation, live seller analytics, and premium mock checkout.
          </p>
        </div>
      </header>

      {/* Catalog Search & Category Filters */}
      <section style={styles.filterSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className="form-control"
            style={styles.searchInput}
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="btn"
              style={{
                ...styles.categoryBtn,
                background: category === cat ? 'var(--primary)' : 'var(--bg-secondary)',
                border: category === cat ? 'none' : '1px solid var(--border-glass)',
                color: category === cat ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Display */}
      <main style={{ marginTop: '30px' }}>
        {loading ? (
          <div style={styles.spinnerContainer}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Retrieving products...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : products.length === 0 ? (
          <div className="glass-card" style={styles.emptyBox}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📦</span>
            <h3>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              We couldn't find any listings matching your search/filters. Try adjusting your query or category.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                user={user}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 0',
  },
  hero: {
    padding: '50px 40px',
    marginBottom: '40px',
    textAlign: 'center',
    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 0) 70%), var(--bg-glass)',
    border: '1px solid var(--border-glass)',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badgeLabel: {
    marginBottom: '16px',
    fontSize: '0.75rem',
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '16px',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  searchContainer: {
    position: 'relative',
    flex: '1',
    minWidth: '300px',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '48px',
  },
  categories: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  categoryBtn: {
    padding: '8px 20px',
    fontSize: '0.9rem',
    borderRadius: '9999px',
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  errorBox: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--accent-red)',
    textAlign: 'center',
  },
  emptyBox: {
    padding: '60px 40px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
  }
};

export default Home;
