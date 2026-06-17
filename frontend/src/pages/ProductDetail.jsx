import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ProductDetail = ({ user, onAddToCart, triggerNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cart quantity selector
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    if (val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    triggerNotification(`Added ${quantity} of "${product.name}" to cart!`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const response = await api.post(`/products/${id}/review`, { rating, comment });
      if (response.data.success) {
        setProduct(response.data.product);
        setComment('');
        setRating(5);
        triggerNotification('Thank you for your review!');
      } else {
        setReviewError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Note: You can only review once.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.centerContainer}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Error loading product</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>{error || 'Unable to retrieve details.'}</p>
          <Link to="/" className="btn btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount > 0;
  const priceAfterDiscount = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.stock <= 0;

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← Back to Shop</Link>

      <div style={styles.mainGrid}>
        {/* Left: Product Image */}
        <div className="glass-card" style={styles.imageCard}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>

        {/* Right: Product Details & Add to Cart */}
        <div style={styles.detailsContent}>
          <div style={styles.metaRow}>
            <span className="badge badge-category">{product.category}</span>
            <span className={`badge ${isOutOfStock ? 'badge-outofstock' : 'badge-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} items available`}
            </span>
          </div>

          <h1 style={styles.productName}>{product.name}</h1>
          
          <div style={styles.sellerInfo}>
            Seller: <strong>{product.seller?.name || 'ShopEZ Official'}</strong>
          </div>

          {/* Rating Summary */}
          <div style={styles.ratingsSummary}>
            <span style={styles.stars}>
              {'★'.repeat(Math.round(product.ratings.average))}
              {'☆'.repeat(5 - Math.round(product.ratings.average))}
            </span>
            <span style={styles.averageNumber}>{product.ratings.average.toFixed(1)} / 5.0</span>
            <span style={styles.ratingCount}>({product.ratings.count} reviews)</span>
          </div>

          {/* Pricing */}
          <div style={styles.priceSection}>
            {hasDiscount ? (
              <div style={styles.priceRow}>
                <span style={styles.originalPrice}>${product.price.toFixed(2)}</span>
                <span style={styles.discountPrice}>${priceAfterDiscount.toFixed(2)}</span>
                <span className="badge badge-discount">-{product.discount}% Off</span>
              </div>
            ) : (
              <span style={styles.price}>${product.price.toFixed(2)}</span>
            )}
          </div>

          <p style={styles.description}>{product.description}</p>

          {/* Purchase Controls */}
          {user?.role !== 'SELLER' && (
            <div style={styles.actionCard} className="glass-card">
              {!isOutOfStock ? (
                <>
                  <div style={styles.qtyContainer}>
                    <span style={{ fontWeight: '600' }}>Quantity:</span>
                    <div style={styles.qtySelectors}>
                      <button 
                        onClick={() => handleQuantityChange(quantity - 1)} 
                        style={styles.qtyBtn}
                        className="btn btn-secondary"
                      >
                        -
                      </button>
                      <span style={styles.qtyVal}>{quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(quantity + 1)} 
                        style={styles.qtyBtn}
                        className="btn btn-secondary"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={styles.buttonRow}>
                    <button onClick={handleAddToCart} className="btn btn-secondary" style={{ flex: '1' }}>
                      Add to Cart
                    </button>
                    <button onClick={handleBuyNow} className="btn btn-primary" style={{ flex: '1' }}>
                      Buy Now
                    </button>
                  </div>
                </>
              ) : (
                <div style={styles.outOfStockMsg}>
                  This item is currently sold out. Check back later!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section style={styles.reviewsSection}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Customer Reviews</h2>

        <div style={styles.reviewsLayout}>
          {/* Left: Reviews List */}
          <div style={styles.reviewsList}>
            {product.reviews.length === 0 ? (
              <div className="glass-card" style={styles.emptyReviews}>
                <p style={{ color: 'var(--text-secondary)' }}>No reviews yet for this product. Be the first to write one!</p>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="glass-card" style={styles.reviewItem}>
                  <div style={styles.reviewHeader}>
                    <strong>{rev.username}</strong>
                    <span style={styles.stars}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                  </div>
                  <span style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  <p style={styles.reviewComment}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Right: Write a Review Form */}
          <div style={styles.reviewFormContainer}>
            {user ? (
              user.role === 'USER' ? (
                <div className="glass-card" style={styles.reviewFormCard}>
                  <h3 style={{ marginBottom: '16px' }}>Submit a Review</h3>
                  {reviewError && <div style={styles.reviewError}>{reviewError}</div>}
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group">
                      <label>Rating (1-5 Stars)</label>
                      <select 
                        className="form-control" 
                        value={rating} 
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        style={{ background: 'var(--bg-primary)' }}
                      >
                        <option value="5">★★★★★ (5 Stars)</option>
                        <option value="4">★★★★☆ (4 Stars)</option>
                        <option value="3">★★★☆☆ (3 Stars)</option>
                        <option value="2">★★☆☆☆ (2 Stars)</option>
                        <option value="1">★☆☆☆☆ (1 Star)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Your Comment</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Write your experience with the product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-card" style={styles.reviewAlert}>
                  <p>Sellers cannot submit reviews on product listings.</p>
                </div>
              )
            ) : (
              <div className="glass-card" style={styles.reviewAlert}>
                <p>Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>login</Link> as a Buyer to write reviews.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 0',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '24px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '50px',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  imageCard: {
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    height: '450px',
    background: '#1a1f2c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  metaRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  productName: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '8px',
  },
  sellerInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  ratingsSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  stars: {
    color: 'var(--accent)',
    fontSize: '1.1rem',
  },
  averageNumber: {
    fontWeight: '700',
    fontSize: '1rem',
  },
  ratingCount: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  priceSection: {
    marginBottom: '24px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  originalPrice: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
  },
  discountPrice: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--secondary)',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  description: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  actionCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
  },
  qtyContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  qtySelectors: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  qtyBtn: {
    width: '36px',
    height: '36px',
    padding: '0',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1.2rem',
  },
  qtyVal: {
    fontSize: '1.1rem',
    fontWeight: '700',
    width: '24px',
    textAlign: 'center',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
  },
  outOfStockMsg: {
    padding: '16px',
    textAlign: 'center',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent-red)',
    fontWeight: '600',
  },
  reviewsSection: {
    marginTop: '60px',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '40px',
  },
  reviewsLayout: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '40px',
    alignItems: 'start',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  emptyReviews: {
    padding: '40px',
    textAlign: 'center',
  },
  reviewItem: {
    padding: '20px',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  reviewDate: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '12px',
  },
  reviewComment: {
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  reviewFormContainer: {
    position: 'sticky',
    top: '100px',
  },
  reviewFormCard: {
    padding: '24px',
  },
  reviewError: {
    padding: '10px 14px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  reviewAlert: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  }
};

export default ProductDetail;
