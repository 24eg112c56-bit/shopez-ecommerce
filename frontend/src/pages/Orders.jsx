import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-stock';
      case 'Shipped':
        return 'badge-category';
      case 'Pending':
        return 'badge-discount';
      case 'Cancelled':
      default:
        return 'badge-outofstock';
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={{ fontSize: '2.25rem', marginBottom: '32px' }}>Order History</h1>

      {error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={styles.emptyOrders}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🛍️</span>
          <h2>No orders found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
            You haven't placed any orders yet. Visit the catalog to make your first purchase.
          </p>
          <Link to="/" className="btn btn-primary">Browse Shop</Link>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className="glass-card" style={styles.orderCard}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.headerLabel}>ORDER ID</span>
                  <span style={styles.orderId}>{order._id}</span>
                </div>
                <div style={styles.headerRight}>
                  <div>
                    <span style={styles.headerLabel}>PLACED ON</span>
                    <span style={styles.headerValue}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span style={styles.headerLabel}>TOTAL PRICE</span>
                    <span style={styles.orderTotal}>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div style={styles.cardBody}>
                {/* Items grid */}
                <div style={styles.itemsColumn}>
                  <h4 style={styles.sectionTitle}>Items Details</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <div style={styles.itemMeta}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemQty}>Qty: {item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>${item.price.toFixed(2)} each</span>
                    </div>
                  ))}
                </div>

                {/* Shipping info */}
                <div style={styles.shippingColumn}>
                  <h4 style={styles.sectionTitle}>Shipping Address</h4>
                  <div style={styles.addressBox}>
                    <p style={{ color: '#ffffff', fontWeight: '500' }}>Delivery Location:</p>
                    <p style={styles.addressText}>{order.shippingAddress.address}</p>
                    <p style={styles.addressText}>
                      {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 0',
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  emptyOrders: {
    padding: '80px 40px',
    textAlign: 'center',
  },
  errorBox: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--accent-red)',
    textAlign: 'center',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  orderCard: {
    overflow: 'hidden',
  },
  cardHeader: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid var(--border-glass)',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  orderId: {
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#ffffff',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flexWrap: 'wrap',
  },
  headerValue: {
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  cardBody: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '32px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    }
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '8px',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  itemQty: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  itemPrice: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  shippingColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  addressBox: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-md)',
  },
  addressText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.4',
  }
};

export default Orders;
