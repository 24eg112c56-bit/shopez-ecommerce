# ShopEZ: E-Commerce Application

## Project Overview

ShopEZ is a full-stack MERN e-commerce web application that allows buyers to browse products, view detailed product information, add items to a cart, place orders using a simulated wallet balance, and track order history. Sellers can manage product listings, view incoming orders, update order status, and monitor business performance through dashboard analytics.

The application uses React.js for the frontend, Express.js and Node.js for the backend, and MongoDB for persistent storage.

## Tech Stack

- Frontend: React.js, React Router, Axios, Chart.js
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt.js
- Styling: CSS
- Tools: npm, Vite, MongoDB Compass

## Main Features

### Buyer Features

- User registration and login
- Product browsing with category filtering and search
- Product detail page with price, discount, stock, seller information, and reviews
- Add to cart and update item quantity
- Simulated wallet checkout
- Order placement with shipping address
- Order history page
- Product review submission

### Seller Features

- Seller registration and login
- Product create, update, and delete operations
- Seller dashboard
- Incoming order management
- Order status update
- Sales and category analytics using charts

### Backend Features

- REST API for authentication, products, reviews, orders, and seller management
- JWT-based protected routes
- Role-based access control for buyers and sellers
- Password hashing with bcrypt.js
- MongoDB storage for users, products, and orders
- Auto-seeding of default seller and sample product catalog

## Database Design

### Users Collection

Stores user account data.

Fields:

- name
- email
- password
- role: USER or SELLER
- balance
- createdAt

### Products Collection

Stores product catalog data.

Fields:

- name
- description
- price
- discount
- category
- image
- stock
- ratings
- reviews
- seller
- createdAt

### Orders Collection

Stores buyer order data.

Fields:

- buyer
- items
- totalPrice
- shippingFee
- shippingAddress
- status
- createdAt

## API Routes

### API Index

```text
GET /api
```

Shows backend API route information.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/topup
```

### Products

```text
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
POST /api/products/:id/review
```

### Orders

```text
POST /api/orders
GET /api/orders/my-orders
GET /api/orders/seller-orders
PUT /api/orders/:id/status
```

## How To Run The Project

### 1. Start MongoDB

Make sure MongoDB is running locally.

MongoDB connection:

```text
mongodb://127.0.0.1:27017/shopez
```

### 2. Start Backend

```bash
npm start --prefix backend
```

Backend URL:

```text
http://127.0.0.1:5000/api
```

### 3. Start Frontend

```bash
npm run dev --prefix frontend
```

Open the Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:3000
```

If port 3000 is busy, Vite may use another port such as:

```text
http://127.0.0.1:3001
```

## Demo Login Details

### Seller Account

```text
Email: seller@shopez.com
Password: password123
```

### Buyer Account

Buyers can register directly from the website.

## MongoDB Verification

To view data in MongoDB Compass:

```text
mongodb://127.0.0.1:27017
```

Open database:

```text
shopez
```

Collections:

```text
users
products
orders
```

## SkillWallet Submission Details

Project Title:

```text
ShopEZ: E-Commerce Application
```

Project Description:

```text
ShopEZ is a full-stack MERN e-commerce application that provides a complete online shopping experience for buyers and sellers. Buyers can register, browse products, search and filter items, view product details and reviews, add products to cart, complete simulated wallet checkout, and track order history. Sellers can manage product listings, monitor incoming orders, update order status, and view sales analytics through a dashboard. The system uses JWT authentication, role-based access control, MongoDB storage, Express REST APIs, and a responsive React frontend.
```

Demo Link:

```text
Add your Google Drive demo video link here.
```

GitHub Link:

```text
Add your GitHub repository link here.
```

Documentation Link:

```text
Add your Google Drive documentation file link here, or upload this PROJECT_DOCUMENTATION.md as a PDF.
```

## Project Outcome

The completed project demonstrates practical MERN stack development, secure authentication, role-based access control, CRUD operations, order management, MongoDB data storage, REST API integration, and frontend data visualization.

