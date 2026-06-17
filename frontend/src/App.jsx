import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState('');

  // Hydrate user and cart from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('shopez_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedCart = localStorage.getItem('shopez_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Sync cart adjustments to LocalStorage
  const saveCartToStorage = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('shopez_cart', JSON.stringify(updatedCart));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('shopez_token');
    localStorage.removeItem('shopez_user');
    localStorage.removeItem('shopez_cart');
    setUser(null);
    setCart([]);
    triggerNotification('Logged out successfully');
  };

  const handleTopupSuccess = (newBalance) => {
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('shopez_user', JSON.stringify(updatedUser));
    triggerNotification(`Virtual wallet credited. New balance: $${newBalance.toFixed(2)}`);
  };

  const handleAddToCart = (product) => {
    const updatedCart = [...cart];
    const existingItemIdx = updatedCart.findIndex((item) => item._id === product._id);

    if (existingItemIdx > -1) {
      updatedCart[existingItemIdx].quantity += 1;
    } else {
      updatedCart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        category: product.category,
        image: product.image,
        quantity: 1,
        stock: product.stock
      });
    }

    saveCartToStorage(updatedCart);
  };

  const handleUpdateCartQty = (productId, qty) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) => {
      if (item._id === productId) {
        // Enforce maximum stock bounds
        const finalQty = Math.min(qty, item.stock);
        if (finalQty < qty) {
          triggerNotification(`Max available stock level reached: ${item.stock}`);
        }
        return { ...item, quantity: finalQty };
      }
      return item;
    });
    saveCartToStorage(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    saveCartToStorage(updatedCart);
    triggerNotification('Removed product from cart.');
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
    triggerNotification('Cart cleared.');
  };

  const handleCheckoutSuccess = (newBalance) => {
    // Clear cart upon successful transaction
    saveCartToStorage([]);
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('shopez_user', JSON.stringify(updatedUser));
  };

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        cartCount={cartCount} 
        onTopupSuccess={handleTopupSuccess}
      />
      
      <div className="container" style={{ paddingBottom: '60px' }}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Home 
                user={user} 
                onAddToCart={handleAddToCart} 
                triggerNotification={triggerNotification} 
              />
            } 
          />
          <Route 
            path="/products/:id" 
            element={
              <ProductDetail 
                user={user} 
                onAddToCart={handleAddToCart} 
                triggerNotification={triggerNotification} 
              />
            } 
          />
          <Route 
            path="/login" 
            element={<Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={<Register onLoginSuccess={handleLoginSuccess} />} 
          />

          {/* Protected Customer Routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Cart 
                  cart={cart} 
                  user={user} 
                  onUpdateCartQty={handleUpdateCartQty} 
                  onRemoveFromCart={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Checkout 
                  cart={cart} 
                  user={user} 
                  onCheckoutSuccess={handleCheckoutSuccess}
                  triggerNotification={triggerNotification}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Orders />
              </ProtectedRoute>
            } 
          />

          {/* Protected Seller Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <Dashboard triggerNotification={triggerNotification} />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Notifications system */}
      {notification && (
        <div className="toast-notification">
          <span>{notification}</span>
        </div>
      )}
    </Router>
  );
}

export default App;
