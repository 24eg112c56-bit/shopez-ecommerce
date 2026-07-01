# ShopEZ MERN E-Commerce

ShopEZ is a full-stack shopping application built with MongoDB, Express, React, and Node.js. Buyers can browse products, search and filter the catalog, manage a cart, place simulated wallet orders, and review products. Sellers can manage inventory, update order status, and view sales analytics.

## DOCUMENTATION
[ShopEZ project  MERN.docx](https://github.com/user-attachments/files/29058776/ShopEZ.project.MERN.docx)

📂 MERN Phase Wise Templates
This project includes a structured set of phase-wise templates and design documentation located in the MERN Phase Wise folder.

📁 Phase-wise Templates
Brainstorming & Ideation Phase:
[Brainstorming - Idea Generation.docx](https://github.com/user-attachments/files/29555396/Brainstorming.-.Idea.Generation.docx)
[Define Problem Statement.docx](https://github.com/user-attachments/files/29555408/Define.Problem.Statement.docx)
[Empathy Map Canvas.pdf](https://github.com/user-attachments/files/29555414/Empathy.Map.Canvas.pdf)
Project Design Phase:
[Problem - Solution Fit.pdf](https://github.com/user-attachments/files/29555421/Problem.-.Solution.Fit.pdf)
[Proposed Solution.pdf](https://github.com/user-attachments/files/29555435/Proposed.Solution.pdf)
[Solution Architecture.pdf](https://github.com/user-attachments/files/29555444/Solution.Architecture.pdf)
Project Development:
[User Acceptance Testing.pdf](https://github.com/user-attachments/files/29555450/User.Acceptance.Testing.pdf)
Project Planning Phase:
[Project Planning.pdf](https://github.com/user-attachments/files/29555462/Project.Planning.pdf)
Requirement Analysis:
[Data Flow Diagrams.pdf](https://github.com/user-attachments/files/29555479/Data.Flow.Diagrams.pdf)
[Solution Requirements.pdf](https://github.com/user-attachments/files/29555480/Solution.Requirements.pdf)
[Technology Stack.pdf](https://github.com/user-attachments/files/29555485/Technology.Stack.pdf)
📁 Project Documentation Reference
[FSD Documentation Format.pdf](https://github.com/user-attachments/files/29555494/FSD.Documentation.Format.pdf)


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

## Technical Architecture, ER diagram, MVC architecture
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/bb781816-6953-4194-b6ce-a7117eda8441" />


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
