import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, user, onAddToCart }) => {
  const hasDiscount = product.discount > 0;
  const priceAfterDiscount = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="glass-card" style={styles.card}>
      <div style={styles.imgContainer}>
        <img src={product.image} alt={product.name} style={styles.img} />
        {hasDiscount && (
          <span className="badge badge-discount" style={styles.discountBadge}>
            -{product.discount}%
          </span>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.meta}>
          <span className="badge badge-category" style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
            {product.category}
          </span>
          <span 
            className={`badge ${isOutOfStock ? 'badge-outofstock' : 'badge-stock'}`}
            style={{ fontSize: '0.65rem', padding: '4px 8px' }}
          >
            {isOutOfStock ? 'Out of Stock' : `${product.stock} Left`}
          </span>
        </div>

        <Link to={`/products/${product._id}`} style={styles.titleLink}>
          <h4 style={styles.title} title={product.name}>{product.name}</h4>
        </Link>

        {/* Ratings block */}
        <div style={styles.ratings}>
          <span style={styles.stars}>
            {'★'.repeat(Math.round(product.ratings?.average || 0))}
            {'☆'.repeat(5 - Math.round(product.ratings?.average || 0))}
          </span>
          <span style={styles.ratingCount}>({product.ratings?.count || 0})</span>
        </div>

        <div style={styles.footer}>
          <div style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <span style={styles.originalPrice}>${product.price.toFixed(2)}</span>
                <span style={styles.discountPrice}>${priceAfterDiscount.toFixed(2)}</span>
              </>
            ) : (
              <span style={styles.price}>${product.price.toFixed(2)}</span>
            )}
          </div>

          {user?.role === 'SELLER' ? (
            <Link to={`/dashboard`} className="btn btn-secondary" style={styles.actionBtn}>
              Manage
            </Link>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
              style={styles.actionBtn}
            >
              {isOutOfStock ? 'Sold Out' : 'Add +'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  imgContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
    background: '#1a1f2c',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition-smooth)',
  },
  discountBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: '1',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  titleLink: {
    display: 'block',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'var(--transition-smooth)',
  },
  ratings: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
  },
  stars: {
    color: 'var(--accent)',
    fontSize: '0.9rem',
  },
  ratingCount: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    lineHeight: '1.2',
  },
  discountPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtn: {
    padding: '8px 14px',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)',
  }
};

// Add interactive scale on card hover via standard CSS class selectors handled by global index.css rules
export default ProductCard;
