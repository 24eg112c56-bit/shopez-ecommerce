# ShopEZ MERN E-Commerce

ShopEZ is a full-stack shopping application built with MongoDB, Express, React, and Node.js. Buyers can browse products, search and filter the catalog, manage a cart, place simulated wallet orders, and review products. Sellers can manage inventory, update order status, and view sales analytics.

## Features

- JWT authentication with buyer and seller roles
- Product catalog with search, category filters, discounts, stock levels, and reviews
- Cart and secure simulated checkout using a virtual wallet
- Buyer order history with shipping details and order status
- Seller dashboard for product CRUD, incoming orders, and Chart.js analytics
- MongoDB seeding for a default seller and sample product catalog
- Order Management
- Responsive UI
- MongoDB Database Integration

## Tech Stack
- React.js
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Project Structure
client/
server/
models/
routes/
controllers/

## Screenshots

## Register page
<img width="1152" height="1020" alt="Screenshot 2026-06-17 152559" src="https://github.com/user-attachments/assets/c1bc115d-78de-4ac4-8f68-77001392e7d5" />
## Order and Cart page
<img width="1140" height="905" alt="Screenshot 2026-06-17 153145" src="https://github.com/user-attachments/assets/c89a7cd5-bd35-45c2-bbe7-9137468592cf" /> <img width="1145" height="831" alt="Screenshot 2026-06-17 153246" src="https://github.com/user-attachments/assets/624062fc-b1bd-4845-9b20-d4faa692d0a8" />
## Seller Control pages
<img width="1143" height="748" alt="Screenshot 2026-06-17 153515" src="https://github.com/user-attachments/assets/4ea460fd-c904-4e20-8f17-0c6154f930ed" />
<img width="1142" height="903" alt="Screenshot 2026-06-17 153353" src="https://github.com/user-attachments/assets/a40c9707-16e8-41e7-9b3f-16fdfa3a151e" /><img width="1140" height="617" alt="Screenshot 2026-06-17 153556" src="https://github.com/user-attachments/assets/c215d4f6-54b1-4ec2-992e-e6eb98632bfe" />
## Backend & Database
<img width="1151" height="182" alt="Screenshot 2026-06-17 153729" src="https://github.com/user-attachments/assets/d44c18ba-e770-4a76-8963-237af5ca799e" /><img width="1352" height="738" alt="image" src="https://github.com/user-attachments/assets/2251de13-ef86-4c1e-8974-467dd5997fb9" />



## Live demo 
https://shopez-ecommerce-rosy.vercel.app/
NOTE- Frontend deployes on Vercel. Backend runs locally and is not deployed. API- dependent features (login, products, orders, etc.) require the backend server 


## Run Locally

1. Install dependencies from the root, backend, and frontend folders if needed:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Start MongoDB locally.

3. Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopez
JWT_SECRET=replace_with_a_long_secret
```

4. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend API: `http://localhost:5000/api`

If Vite reports a different port, open that displayed URL instead.

## Share On Your Local Network

1. Find your computer's LAN IP address:

```powershell
ipconfig
```

Look for the IPv4 address, for example `192.168.1.25`.

2. In `frontend/.env`, point the React app to your backend:

```env
VITE_API_URL=http://192.168.1.25:5000/api
```

3. In `backend/.env`, allow the frontend URL:

```env
FRONTEND_URL=http://192.168.1.25:3000
```

4. Start MongoDB, then start the backend:

```bash
npm start --prefix backend
```

5. Start the frontend for network access:

```bash
npm run dev:host --prefix frontend
```

Other devices on the same Wi-Fi can open:

```text
http://192.168.1.25:3000
```

Keep both servers and MongoDB running on your computer while others use the site.

## Where Orders Are Stored

Orders are saved in MongoDB in the `orders` collection. Each order stores the buyer, purchased items, total price, shipping fee, shipping address, status, and creation date. Buyers can view their orders at `/orders`; sellers can view and update relevant incoming orders from `/dashboard`.

## Demo Accounts

The backend seeds a seller automatically when MongoDB is connected:

- Seller email: `seller@shopez.com`
- Seller password: `password123`

Buyers can register from the app and receive a default virtual wallet balance.
