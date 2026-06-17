const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./config/seeder');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Auto-seed data on successful DB connection
  seedData();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic API Check
app.get('/api', (req, res) => {
  res.json({
    name: 'ShopEZ Backend API',
    status: 'running',
    message: 'Use the React frontend for the shopping website. These API routes store and serve ShopEZ data.',
    frontend: process.env.FRONTEND_URL || 'http://127.0.0.1:3001',
    routes: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        topupWallet: 'POST /api/auth/topup'
      },
      products: {
        list: 'GET /api/products',
        detail: 'GET /api/products/:id',
        createSellerProduct: 'POST /api/products',
        updateSellerProduct: 'PUT /api/products/:id',
        deleteSellerProduct: 'DELETE /api/products/:id',
        review: 'POST /api/products/:id/review'
      },
      orders: {
        create: 'POST /api/orders',
        buyerOrders: 'GET /api/orders/my-orders',
        sellerOrders: 'GET /api/orders/seller-orders',
        updateStatus: 'PUT /api/orders/:id/status'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'ShopEZ Backend API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
