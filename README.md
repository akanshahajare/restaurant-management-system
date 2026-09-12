Absolutely — here is the **complete `README.md` content in one copy-paste-ready Markdown block**.

````markdown
# Restaurant Management System

A full-stack restaurant management application built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Socket.IO, and Razorpay.

The system provides two complete experiences:

- **Customer Experience** — browse the menu, manage cart, place guest or authenticated orders, make payments, track orders, and submit feedback.
- **Admin Experience** — manage orders, kitchen workflow, menu items, categories, tables, billing, reports, reviews, and real-time notifications.

---

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Sonner
- Socket.IO Client
- Razorpay Checkout
- jsPDF
- Browser Print Support

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Razorpay
- CORS
- dotenv

---

# Project Structure

```text
Restaurant_Management_System/
│
├── client/
│   ├── public/
│   │   └── images/
│   │       └── menu/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── customer/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md
````

---

# Features

## Customer Experience

### Welcome Page

* Restaurant landing page
* Featured hero dish
* Random featured food image using local menu images
* Restaurant information
* Ordering introduction
* Table number selection
* QR/table-based ordering support
* Featured and recommended dishes
* Quick add-to-cart functionality
* Cart reminder when items are already added

---

## Menu

Customers can:

* Browse the complete restaurant menu
* Search by food name and description
* Filter by category
* Filter vegetarian/non-vegetarian items
* Filter available items
* Filter recommended items
* Sort by:

  * Recommended
  * Price — Low to High
  * Price — High to Low
  * Rating
  * Popularity
* View food images
* Open detailed food item pages
* Quickly add items to cart

Menu images are stored locally inside:

```text
client/public/images/menu/
```

The application does not require a Pexels API key at runtime.

---

## Cart

The cart supports:

* Add food items
* Remove food items
* Increase/decrease quantities
* Persistent cart data
* Special instructions for individual items
* Table number persistence
* Discount support
* Automatic GST calculation
* Cart subtotal calculation
* Delivery/service charge handling where applicable

---

# Authentication

The application uses a **unified `User` model** with role-based authentication.

Supported roles:

```text
customer
admin
```

Customers can:

* Register
* Log in
* View their profile
* Log out
* View their previous orders

Admins use a dedicated admin login.

Guests can also place orders without creating an account.

---

## Customer Authentication

Customer registration:

```text
POST /api/auth/register
```

Customer login:

```text
POST /api/auth/login
```

Customer profile:

```text
GET /api/auth/profile
```

---

## Admin Authentication

Admin login:

```text
POST /api/auth/admin/login
```

Admin profile:

```text
GET /api/auth/admin/profile
```

Admin routes are protected using JWT authentication and role-based authorization.

---

# Checkout

The checkout system supports:

* Guest checkout
* Authenticated customer checkout
* Order summary
* Table number validation
* Discount calculation
* GST calculation
* Razorpay payment
* Payment verification
* Payment success/failure handling
* Receipt generation
* Print-ready receipts

---

# Order Types

The system supports two types of customer orders.

## Guest Orders

Customers can place an order without logging in.

```text
userId = null
```

Guest customers can still:

* Browse the menu
* Add items to cart
* Checkout
* Make payments
* Track their order

---

## Authenticated Customer Orders

Logged-in customers have their user ID associated with their orders.

```text
userId = authenticated customer ID
```

This allows customers to access their order history and account information.

---

# Order Tracking

Customers can track their orders in real time using Socket.IO.

Order workflow:

```text
RECEIVED
    ↓
PREPARING
    ↓
READY_TO_SERVE
    ↓
SERVED
    ↓
COMPLETED
```

When the admin/kitchen updates an order status, the customer receives the update in real time.

---

# Feedback

Customers can submit feedback for completed orders.

The admin can:

* View feedback
* Review customer comments
* Monitor customer satisfaction
* Manage submitted reviews

---

# Local Menu Images

Menu images are stored locally:

```text
client/public/images/menu/
```

This means the project does not depend on an external image provider for menu images.

A developer cloning the repository can run the project without requiring a Pexels API key.

---

# Admin Experience

## Admin Dashboard

The admin dashboard provides an overview of:

* Orders
* Revenue
* Menu items
* Categories
* Tables
* Billing
* Reports
* Reviews
* Notifications

---

# Order Management

Admins can:

* View customer orders
* View guest orders
* Search orders
* View order details
* View customer information when available
* View payment information
* Update order status
* Monitor active orders
* Receive real-time order notifications

---

# Kitchen Management

The kitchen has a dedicated order workflow.

Order status:

```text
RECEIVED
    ↓
PREPARING
    ↓
READY_TO_SERVE
    ↓
SERVED
    ↓
COMPLETED
```

Kitchen status updates are synchronized with customers using Socket.IO.

---

# Menu Management

Admins can:

* Create food items
* Edit food items
* Delete food items
* Set food prices
* Add descriptions
* Add ingredients
* Set preparation time
* Set spice level
* Set vegetarian/non-vegetarian status
* Control food availability
* Set stock quantity
* Mark items as special
* Mark items as recommended
* Manage popularity
* Manage ratings

---

## Low Stock Notifications

The system supports low-stock detection.

Default low-stock threshold:

```text
LOW_STOCK_THRESHOLD = 5
```

When stock reaches the configured threshold, the admin can receive a low-stock notification.

---

# Category Management

Admins can:

* Create categories
* Edit categories
* Delete categories
* View categories
* Associate food items with categories

---

# Manual Orders

Admins can create orders manually for customers at the restaurant.

This can be used for:

* Walk-in customers
* Counter orders
* Staff-created orders
* Offline/customer-assisted ordering

---

# Table Management

Admins can:

* Create restaurant tables
* View tables
* Update table status
* Delete tables
* Generate QR-code ordering links

QR codes point customers to:

```text
/menu?table=<table-number>
```

When a customer opens the QR link:

1. The table number is detected.
2. The table number is stored in session storage.
3. The customer browses the menu.
4. The order is associated with the selected table.

---

# Billing

The billing module supports:

* Creating custom bills
* Viewing billing history
* Viewing bill details
* Printing bills
* Generating PDF-ready billing documents

---

# Reports

The admin reports provide information such as:

* Revenue
* Order statistics
* Best-selling dishes
* Peak ordering hours
* Sales insights

---

# Reviews

Admins can:

* View customer reviews
* Monitor customer feedback
* Moderate submitted reviews

---

# Real-Time Notifications

Socket.IO is used for real-time communication between the frontend and backend.

Admin notifications include:

* New orders
* Payment updates
* Low-stock alerts

Customers receive:

* Order status updates
* Real-time order tracking information

---

# Authentication Architecture

The application uses a unified `User` model with role-based authentication.

Supported roles:

```text
customer
admin
```

JWT tokens contain the authenticated user's ID and role.

Example customer token payload:

```json
{
  "id": "<user-id>",
  "role": "customer"
}
```

Example admin token payload:

```json
{
  "id": "<user-id>",
  "role": "admin"
}
```

Guest customers do not require authentication to place orders.

---

# Customer Routes

| Route          | Description                       |
| -------------- | --------------------------------- |
| `/`            | Welcome / Restaurant Landing Page |
| `/menu`        | Menu Browsing                     |
| `/menu/:id`    | Food Item Details                 |
| `/checkout`    | Cart and Checkout                 |
| `/order/:id`   | Live Order Tracking               |
| `/receipt/:id` | Order Receipt                     |
| `/feedback`    | Customer Feedback                 |
| `/contact`     | Restaurant Contact Information    |
| `/login`       | Customer Login                    |
| `/register`    | Customer Registration             |
| `/profile`     | Customer Profile                  |
| `/my-orders`   | Customer Order History            |

---

# Admin Routes

| Route                  | Description             |
| ---------------------- | ----------------------- |
| `/admin/login`         | Admin Login             |
| `/admin/dashboard`     | Admin Dashboard         |
| `/admin/orders`        | Order Management        |
| `/admin/kitchen`       | Kitchen Workflow        |
| `/admin/menu`          | Menu Management         |
| `/admin/categories`    | Category Management     |
| `/admin/manual-orders` | Manual Order Creation   |
| `/admin/tables`        | Table and QR Management |
| `/admin/billing`       | Billing Management      |
| `/admin/reports`       | Sales Reports           |
| `/admin/reviews`       | Review Management       |

---

# Backend API

All backend API routes are prefixed with:

```text
/api
```

---

## Authentication API

### Customer

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Admin

```text
POST /api/auth/admin/login
GET  /api/auth/admin/profile
```

---

# Tables API

```text
GET    /api/tables
POST   /api/tables
DELETE /api/tables/:id
PATCH  /api/tables/:id/status
```

---

# Categories API

```text
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

---

# Menu API

```text
GET    /api/menu
GET    /api/menu/:id
POST   /api/menu
PUT    /api/menu/:id
DELETE /api/menu/:id
```

Supported menu filters include:

```text
search
category
isVeg
availability
recommended
```

---

# Orders API

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
POST   /api/orders/manual
PATCH  /api/orders/:id/status
```

Orders can be created as:

* Guest orders
* Authenticated customer orders
* Admin/manual orders

---

# Payments API

```text
POST /api/payments/create
POST /api/payments/verify
GET  /api/payments/:orderId
```

Razorpay is used for payment processing.

The Razorpay secret must remain on the backend.

---

# Reviews API

```text
POST /api/reviews
GET  /api/reviews
```

---

# Billing API

```text
POST /api/billing
GET  /api/billing
GET  /api/billing/:id
```

---

# Reports API

```text
GET /api/reports
```

---

# Notifications API

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

---

# Real-Time Communication

Socket.IO provides real-time communication between customers, admins, and the backend.

## Admin

Admins join the:

```text
joinAdmin
```

channel.

Admin notifications are sent using:

```text
notification
```

events.

---

## Customer Order Tracking

Customers join the:

```text
joinTable
```

channel.

Order status updates are sent using:

```text
orderUpdate
```

events.

---

# Payment Integration

The project uses Razorpay for online payments.

Payment flow:

```text
1. Customer creates an order
          ↓
2. Backend creates Razorpay payment order
          ↓
3. Razorpay Checkout opens
          ↓
4. Customer completes payment
          ↓
5. Frontend sends payment details to backend
          ↓
6. Backend verifies Razorpay signature
          ↓
7. Order/payment status is updated
          ↓
8. Customer receives confirmation
```

The following key can safely be exposed to the frontend:

```text
VITE_RAZORPAY_KEY_ID
```

The following key must remain backend-only:

```text
RAZORPAY_KEY_SECRET
```

---

# Environment Variables

## Server

Create:

```text
server/.env
```

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_here

CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=rzp_test_example
RAZORPAY_KEY_SECRET=your_razorpay_secret

PORT=5000

NODE_ENV=development
```

For production:

```env
CLIENT_URL=https://your-frontend-url
NODE_ENV=production
```

---

# Client Environment Variables

Create:

```text
client/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api

VITE_RAZORPAY_KEY_ID=rzp_test_example

VITE_FRONTEND_URL=http://localhost:5173
```

For production:

```env
VITE_API_BASE_URL=https://your-backend-url/api

VITE_RAZORPAY_KEY_ID=rzp_test_example

VITE_FRONTEND_URL=https://your-frontend-url
```

---

# Installation

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Git

---

# Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create:

```text
server/.env
```

Add the required environment variables.

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal.

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

# Database Seeding

The project includes sample data for:

* Admin users
* Categories
* Food items
* Restaurant tables
* Other required sample data

Run:

```bash
cd server
npm run seed
```

After seeding, start the backend:

```bash
npm run dev
```

---

# Available Scripts

## Server

### Development

```bash
npm run dev
```

Starts the backend using nodemon.

### Production/Normal Start

```bash
npm start
```

Starts the backend normally.

### Database Seed

```bash
npm run seed
```

Seeds the database with sample data.

---

# Client

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Production Build

```bash
npm run build
```

Creates the production frontend build.

### Preview

```bash
npm run preview
```

Previews the production build locally.

---

# Deployment

The application is designed to support separate frontend and backend deployment.

A typical deployment architecture is:

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │      Browser        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend            │
                    └──────────┬──────────┘
                               │
                     HTTP / Socket.IO
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend             │
                    └──────┬───────┬──────┘
                           │       │
                           │       ▼
                           │  ┌──────────────┐
                           │  │   Razorpay   │
                           │  └──────────────┘
                           │
                           ▼
                    ┌─────────────────────┐
                    │ MongoDB Atlas        │
                    └─────────────────────┘
```

---

# Frontend Deployment

The React/Vite frontend can be deployed to platforms such as Vercel.

Configure:

```env
VITE_API_BASE_URL=https://your-backend-url/api

VITE_RAZORPAY_KEY_ID=your_razorpay_key

VITE_FRONTEND_URL=https://your-frontend-url
```

If the frontend is deployed separately from the backend, configure SPA fallback/routing so React Router routes correctly resolve to `index.html`.

---

# Backend Deployment

The Express backend can be deployed to platforms such as Render.

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Configure the required environment variables:

```env
PORT
MONGODB_URI
JWT_SECRET
CLIENT_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NODE_ENV
```

---

# Production Database

MongoDB Atlas is recommended for production.

Do not use:

```text
mongodb://127.0.0.1:27017/...
```

for a deployed backend.

In production, `localhost` refers to the deployment server itself rather than your local computer.

Use a MongoDB Atlas connection string instead:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
```

---

# CORS and Socket.IO

The backend uses:

```env
CLIENT_URL
```

to configure the allowed frontend origin.

The same frontend URL should be used when configuring Socket.IO communication.

Example:

```env
CLIENT_URL=https://your-frontend-url
```

---

# Security

Never commit secrets to Git.

Do not commit:

```text
.env
```

or files containing:

```text
MONGODB_URI
JWT_SECRET
RAZORPAY_KEY_SECRET
```

Frontend environment variables beginning with:

```text
VITE_
```

are exposed to the browser.

Only public/client-safe values should therefore use the `VITE_` prefix.

---

# Local Menu Images

Menu images are stored inside:

```text
client/public/images/menu/
```

This allows the application to load menu images without depending on an external image API.

The project therefore does not require a Pexels API key for normal operation.

---

# Table QR Ordering

The system supports QR-code based restaurant ordering.

Each table can have its own QR code.

Example QR destination:

```text
/menu?table=5
```

When a customer scans the QR code:

```text
QR Code
   ↓
/menu?table=5
   ↓
Table number detected
   ↓
Table number stored in session storage
   ↓
Customer browses menu
   ↓
Customer adds items to cart
   ↓
Customer places order
   ↓
Order associated with table 5
```

---

# Cart Persistence

The customer cart is persisted using browser storage.

The cart can survive navigation between pages and authentication changes.

The application maintains:

* Cart items
* Quantities
* Table number
* Favorites
* Other required customer-side state

---

# Order Lifecycle

The complete order lifecycle is:

```text
Customer
    │
    ▼
Browse Menu
    │
    ▼
Add Items to Cart
    │
    ▼
Checkout
    │
    ├───────────────┐
    │               │
 Guest          Logged-in
    │               │
    └───────┬───────┘
            ▼
       Create Order
            │
            ▼
     Payment Processing
            │
            ▼
         RECEIVED
            │
            ▼
        PREPARING
            │
            ▼
      READY_TO_SERVE
            │
            ▼
          SERVED
            │
            ▼
        COMPLETED
            │
            ▼
        Feedback
```

---

# Project Notes

* The application supports both guest and authenticated customer ordering.
* Customer and admin accounts use the unified `User` model.
* Authentication is JWT-based.
* Admin functionality is protected using role-based authorization.
* Customers can register and log in.
* Guests can place orders without creating an account.
* Menu images are stored locally.
* Socket.IO provides real-time order tracking.
* Socket.IO provides real-time admin notifications.
* Razorpay is used for online payments.
* Razorpay secrets remain backend-only.
* MongoDB Atlas is recommended for production.
* The application uses separate frontend and backend processes during development.
* QR-code based table ordering is supported.
* Admins can create manual orders.
* Admins can manage menu items, categories, tables, orders, billing, reports, and reviews.

---

# Development

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

# Troubleshooting

## Backend cannot connect to MongoDB

Check:

```env
MONGODB_URI
```

Make sure the MongoDB connection string is valid.

For local MongoDB:

```text
mongodb://127.0.0.1:27017/restaurant_management
```

For MongoDB Atlas:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
```

---

## Frontend cannot connect to backend

Check:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Make sure the backend is running:

```bash
cd server
npm run dev
```

---

## Socket.IO is not connecting

Check that:

* Backend is running.
* `CLIENT_URL` is correct.
* Frontend is using the correct backend URL.
* CORS allows the frontend origin.
* Production frontend and backend URLs are correctly configured.

---

## Razorpay is not opening

Check:

```env
VITE_RAZORPAY_KEY_ID
```

Also verify the backend contains:

```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Never expose:

```text
RAZORPAY_KEY_SECRET
```

to the frontend.

---

# License

This project is intended for educational and project-development purposes.

```

You can copy everything inside the outer code block directly into your **`README.md`**.
```
