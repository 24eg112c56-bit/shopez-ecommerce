import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ triggerNotification }) => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'products', 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'Electronics',
    image: '',
    stock: ''
  });

  const categories = ['Electronics', 'Fashion', 'Home', 'Books'];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Products
      const prodRes = await api.get('/products');
      if (prodRes.data.success) {
        // Filter products that belong to this logged-in seller
        const userJson = localStorage.getItem('shopez_user');
        const user = JSON.parse(userJson);
        const sellerProducts = prodRes.data.products.filter(
          (p) => p.seller === user._id || p.seller?._id === user._id
        );
        setProducts(sellerProducts);
      }

      // Fetch Orders
      const orderRes = await api.get('/orders/seller-orders');
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
      }
    } catch (err) {
      console.error(err);
      setError('Error retrieving seller data. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Form handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '0',
      category: 'Electronics',
      image: '',
      stock: '10'
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, description, price, discount, category, image, stock } = formData;

    if (!name || !description || !price || !category || !stock) {
      triggerNotification('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      discount: parseInt(discount) || 0,
      category,
      image: image || undefined,
      stock: parseInt(stock)
    };

    try {
      if (modalMode === 'add') {
        const response = await api.post('/products', payload);
        if (response.data.success) {
          triggerNotification('Product added successfully!');
          fetchDashboardData();
          setShowModal(false);
        }
      } else {
        const response = await api.put(`/products/${selectedProductId}`, payload);
        if (response.data.success) {
          triggerNotification('Product updated successfully!');
          fetchDashboardData();
          setShowModal(false);
        }
      }
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      const response = await api.delete(`/products/${id}`);
      if (response.data.success) {
        triggerNotification('Product listing deleted.');
        fetchDashboardData();
      }
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Error deleting product.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        triggerNotification(`Order updated to: ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Error updating order.');
    }
  };

  // Analytics Math
  const totalRevenue = orders.reduce((sum, order) => sum + (order.sellerSubtotal || 0), 0);
  const totalItemsSold = orders.reduce((sum, order) => {
    return sum + order.sellerItems.reduce((acc, item) => acc + item.quantity, 0);
  }, 0);
  const averageRating = products.length > 0
    ? products.reduce((sum, p) => sum + (p.ratings?.average || 0), 0) / products.length
    : 0;

  // Chart data calculations
  // 1. Line chart: Revenue per order (reverse chronological, so reverse it for display)
  const lineChartData = {
    labels: [...orders].reverse().map((o, idx) => `Order #${idx + 1}`),
    datasets: [
      {
        label: 'Sales Share ($)',
        data: [...orders].reverse().map((o) => o.sellerSubtotal),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  // 2. Pie chart: Categories sales share
  const categoryCount = {};
  orders.forEach((order) => {
    order.sellerItems.forEach((item) => {
      // Find matching category from local product reference, or fallback
      const prodObj = products.find((p) => p._id === item.product);
      const cat = prodObj ? prodObj.category : 'General';
      categoryCount[cat] = (categoryCount[cat] || 0) + (item.price * item.quantity);
    });
  });

  const pieChartData = {
    labels: Object.keys(categoryCount).length > 0 ? Object.keys(categoryCount) : ['No Sales'],
    datasets: [
      {
        data: Object.keys(categoryCount).length > 0 ? Object.values(categoryCount) : [1],
        backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#6b7280'],
        borderWidth: 1,
      }
    ]
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
      <h1 style={{ fontSize: '2.25rem', marginBottom: '32px' }}>Seller Control Panel</h1>

      {/* Tabs list */}
      <div style={styles.tabContainer} className="glass-card">
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            ...styles.tabBtn,
            color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--primary)' : 'none'
          }}
        >
          📈 Stats & Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            ...styles.tabBtn,
            color: activeTab === 'products' ? '#ffffff' : 'var(--text-secondary)',
            borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : 'none'
          }}
        >
          📦 My Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            ...styles.tabBtn,
            color: activeTab === 'orders' ? '#ffffff' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none'
          }}
        >
          📥 Incoming Orders ({orders.length})
        </button>
      </div>

      {error && <div className="error-box" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Tab: Analytics Overview */}
      {activeTab === 'analytics' && (
        <div>
          {/* Key Metrics Grid */}
          <div style={styles.metricsGrid}>
            <div className="glass-card" style={styles.metricCard}>
              <span style={styles.metricIcon}>💰</span>
              <div>
                <span style={styles.metricTitle}>Gross Sales Share</span>
                <h2 style={styles.metricValue}>${totalRevenue.toFixed(2)}</h2>
              </div>
            </div>
            <div className="glass-card" style={styles.metricCard}>
              <span style={styles.metricIcon}>🛒</span>
              <div>
                <span style={styles.metricTitle}>Incoming Orders</span>
                <h2 style={styles.metricValue}>{orders.length}</h2>
              </div>
            </div>
            <div className="glass-card" style={styles.metricCard}>
              <span style={styles.metricIcon}>🏷️</span>
              <div>
                <span style={styles.metricTitle}>Items Sold</span>
                <h2 style={styles.metricValue}>{totalItemsSold}</h2>
              </div>
            </div>
            <div className="glass-card" style={styles.metricCard}>
              <span style={styles.metricIcon}>★</span>
              <div>
                <span style={styles.metricTitle}>Avg Product Rating</span>
                <h2 style={styles.metricValue}>{averageRating ? `${averageRating.toFixed(1)} / 5.0` : 'N/A'}</h2>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={styles.chartsRow}>
            <div className="glass-card" style={styles.chartCard}>
              <h3 style={{ marginBottom: '20px' }}>Revenue Breakdown (Per Order)</h3>
              <div style={{ height: '300px' }}>
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            <div className="glass-card" style={styles.chartCard}>
              <h3 style={{ marginBottom: '20px' }}>Revenue Share by Category</h3>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#9ca3af', font: { family: 'Outfit' } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Products Manager */}
      {activeTab === 'products' && (
        <div>
          <div style={styles.actionHeader}>
            <h3>Listed Products</h3>
            <button onClick={openAddModal} className="btn btn-primary">
              + Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="glass-card" style={styles.emptyNotice}>
              <p>No products listed yet. Click "+ Add Product" to list your first item.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image} alt={p.name} style={styles.tableImg} />
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </td>
                      <td>
                        <span className="badge badge-category" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                      </td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.discount}%</td>
                      <td>
                        <span className={`badge ${p.stock <= 0 ? 'badge-outofstock' : 'badge-stock'}`} style={{ fontSize: '0.65rem' }}>
                          {p.stock} Left
                        </span>
                      </td>
                      <td>★ {p.ratings?.average?.toFixed(1) || '0.0'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEditModal(p)} className="btn btn-secondary" style={styles.tableActionBtn}>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p._id)} 
                          className="btn btn-secondary" 
                          style={{ ...styles.tableActionBtn, color: 'var(--accent-red)', marginLeft: '8px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Incoming Orders */}
      {activeTab === 'orders' && (
        <div>
          <h3>Purchased Orders</h3>

          {orders.length === 0 ? (
            <div className="glass-card" style={styles.emptyNotice}>
              <p>No purchase orders have been received yet.</p>
            </div>
          ) : (
            <div style={styles.ordersGrid}>
              {orders.map((order) => (
                <div key={order._id} className="glass-card" style={styles.orderItemCard}>
                  <div style={styles.orderHeaderRow}>
                    <div>
                      <span style={styles.orderLabel}>ORDER ID</span>
                      <span style={styles.orderValueMonospace}>{order._id}</span>
                    </div>
                    <div>
                      <span style={styles.orderLabel}>BUYER DETAILS</span>
                      <span style={styles.orderValue}>{order.buyer?.name} ({order.buyer?.email})</span>
                    </div>
                    <div>
                      <span style={styles.orderLabel}>STATUS TRACKER</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.orderItemsBox}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Your Items in Order:</p>
                    {order.sellerItems.map((item, idx) => (
                      <div key={idx} style={styles.orderItemRow}>
                        <span>{item.name} (x{item.quantity})</span>
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                    <div style={styles.orderSubtotalRow}>
                      <span>Your Share Total:</span>
                      <strong>${order.sellerSubtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
              {modalMode === 'add' ? 'Add New Product Listing' : 'Edit Product Listing'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Wireless Charger"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Description *</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Describe your product details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={styles.modalFieldsRow}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: '1' }}>
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    className="form-control"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={styles.modalFieldsRow}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Category *</label>
                  <select
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: '1' }}>
                  <label>Stock Count *</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    placeholder="10"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  name="image"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
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
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  tabContainer: {
    display: 'flex',
    gap: '24px',
    padding: '8px 24px',
    marginBottom: '32px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  metricCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  metricIcon: {
    fontSize: '2rem',
    background: 'rgba(99, 102, 241, 0.1)',
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  metricValue: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '30px',
    marginBottom: '40px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  chartCard: {
    padding: '30px',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  emptyNotice: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  tableImg: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    objectFit: 'cover',
    background: '#1a1f2c',
  },
  tableActionBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: '4px',
  },
  ordersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
  },
  orderItemCard: {
    padding: '24px',
  },
  orderHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  orderLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginBottom: '4px',
  },
  orderValueMonospace: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#ffffff',
  },
  orderValue: {
    fontWeight: '500',
  },
  statusSelect: {
    padding: '6px 12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-glass)',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  orderItemsBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
  },
  orderItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  orderSubtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    borderTop: '1px dashed var(--border-glass)',
    paddingTop: '8px',
    marginTop: '8px',
    color: 'var(--primary)',
  },
  modalFieldsRow: {
    display: 'flex',
    gap: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  }
};

export default Dashboard;
