# 🛒 QuickCart - Modern E-commerce Platform

A full-stack e-commerce platform built with Next.js, featuring user authentication, product management, shopping cart functionality, and secure payment processing.

## ✨ Features

### 🛍️ Customer Features

- **Browse Products** - View all available products with detailed information
- **Product Details** - Complete product information with multiple images
- **Shopping Cart** - Add/remove products with real-time cart updates
- **Stock Management** - Automatic stock validation to prevent overselling
- **Address Management** - Add delivery addresses for orders
- **Multiple Payment Options**:
  - 💳 **Stripe** - Secure credit/debit card payments
  - 💵 **Cash on Delivery (COD)** - Pay when you receive your order
- **Order History** - View all your past orders and their status

### 🏪 Seller Features

- **Product Management** - Add new products with images and details
- **Inventory Control** - Manage product listings and availability
- **Order Management** - View and track all customer orders
- **Stock Monitoring** - Real-time inventory tracking

### 🔧 Potential Future Features

The following features could be implemented to enhance the platform:

#### Customer Enhancements

- **Address Management** - Edit and update existing delivery addresses
- **Order Tracking** - Real-time order status updates with notifications

#### Seller Enhancements

- **Product Editing** - Modify existing product details and pricing
- **Product Removal** - Delete discontinued or out-of-stock products
- **Order Status Management** - Update order status for Cash on Delivery orders
- **Advanced Analytics** - Sales reports and inventory insights

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Clerk** - Authentication and user management
- **Cloudinary** - Image storage and optimization
- **Stripe** - Payment processing
- **Inngest** - Background jobs and event handling
- **React Context API** - State management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Clerk account for authentication
- Cloudinary account for image storage
- Stripe account for payments

### Environment Variables Setup
Configure your environment variables by copying `.env.example` to `.env` and filling in your actual values for all required services (MongoDB, Clerk, Cloudinary, Inngest, and Stripe).

### Installation
```bash
# Clone the repository
git clone https://github.com/AlfonsoVidrio/quickcart.git

# Navigate to project directory
cd quickcart

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
# Edit .env.local with your actual values

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📋 Environment Setup

### Seller Account Setup
To enable seller functionality for a user:

1. Go to your Clerk Dashboard
2. Navigate to Users section
3. Edit the user's public metadata
4. Add the following JSON:
   ```json
   {
     "role": "seller"
   }
   ```
5. Save changes - the user will now have access to seller features

## 📁 Project Structure

```text
quickcart/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 api/                # API routes
│   │   ├── 📁 cart/           # Cart operations
│   │   ├── 📁 inngest/        # Inngest webhook endpoint
│   │   ├── 📁 order/          # Order management
│   │   ├── 📁 product/        # Product operations
│   │   ├── 📁 stripe/         # Payment webhooks
│   │   └── 📁 user/           # User operations
│   ├── 📁 add-address/        # Add delivery address page
│   ├── 📁 all-products/       # Product catalog page
│   ├── 📁 cart/               # Shopping cart pages
│   ├── 📁 my-orders/          # User order history
│   ├── 📁 order-placed/       # Order confirmation page
│   ├── 📁 product/            # Product detail pages
│   ├── 📁 seller/             # Seller dashboard
│   ├── � favicon.ico         # Site favicon
│   ├── 📄 globals.css         # Global styles
│   ├── 📄 layout.js           # Root layout component
│   └── 📄 page.jsx            # Homepage
├── 📁 assets/                 # Static assets
│   ├── 📄 assets.js           # Asset exports
│   ├── 📄 productData.js      # Sample product data
│   └── 🖼️ [images]           # Product and UI images
├── 📁 components/             # Reusable components
│   ├── 📁 seller/             # Seller-specific components
│   ├── 📄 Banner.jsx          # Hero banner component
│   ├── 📄 FeaturedProduct.jsx # Featured product display
│   ├── 📄 Footer.jsx          # Footer component
│   ├── 📄 HeaderSlider.jsx    # Image slider component
│   ├── 📄 HomeProducts.jsx    # Product grid for homepage
│   ├── 📄 Loading.jsx         # Loading spinner component
│   ├── 📄 Navbar.jsx          # Navigation component
│   ├── 📄 NewsLetter.jsx      # Newsletter subscription
│   ├── 📄 OrderSummary.jsx    # Order summary component
│   └── 📄 ProductCard.jsx     # Product display card
├── 📁 config/                 # Configuration
│   ├── 📄 db.js               # Database connection
│   └── 📄 inngest.js          # Background jobs setup
├── 📁 context/                # React Context
│   └── 📄 AppContext.jsx      # Global state management
├── 📁 lib/                    # Utility functions
│   └── 📄 authSeller.js       # Seller authentication utilities
├── 📁 models/                 # Database models
│   ├── 📄 Address.js          # Address schema
│   ├── 📄 Order.js            # Order schema
│   ├── 📄 Product.js          # Product schema
│   └── 📄 User.js             # User schema
├── 📁 public/                 # Public static files
│   ├── 📄 file.svg            # File icon
│   ├── 📄 globe.svg           # Globe icon
│   ├── 📄 next.svg            # Next.js logo
│   ├── 📄 vercel.svg          # Vercel logo
│   └── 📄 window.svg          # Window icon
├── � .env.example            # Environment variables template
├── 📄 .gitignore              # Git ignore rules
├── � eslint.config.mjs       # ESLint configuration
├── 📄 jsconfig.json           # JavaScript configuration
├── 📄 middleware.ts           # Next.js middleware
├── 📄 next.config.mjs         # Next.js configuration
├── 📄 package.json            # Dependencies and scripts
├── 📄 postcss.config.mjs      # PostCSS configuration
├── 📄 README.md               # Project documentation
└── 📄 tailwind.config.mjs     # Tailwind CSS configuration
```

## 🚦 API Routes

### Public Routes
- `GET /api/product/list` - Get all products
- `GET /api/product/[id]` - Get product details

### Protected Routes (User)
- `POST /api/cart/update` - Update cart items
- `GET /api/cart/get` - Get user cart
- `POST /api/order/create` - Create new order (COD)
- `POST /api/order/stripe` - Create Stripe checkout
- `POST /api/user/add-address` - Add shipping address
- `GET /api/user/get-address` - Get user addresses
- `GET /api/user/data` - Get user profile data

### Protected Routes (Seller)
- `POST /api/product/add` - Add new product
- `GET /api/product/seller-list` - Get seller products
- `GET /api/order/seller-orders` - Get seller orders

## 📸 Screenshots

### 🏠 Homepage

<img width="1920" height="3761" alt="home" src="https://github.com/user-attachments/assets/8c255095-74e8-48c5-9987-08f5bb3450d4" />

### 📱 Product Catalog

<img width="1920" height="1556" alt="all-produts" src="https://github.com/user-attachments/assets/d1ea1ed9-237e-4aa5-907c-a5ad23c83222" />

### 🔍 Product Details

<img width="1920" height="2093" alt="product-details" src="https://github.com/user-attachments/assets/24c7b33e-e462-4b6a-9b47-327aaec7d5e4" />

### 🛒 Shopping Cart

<img width="1920" height="868" alt="cart" src="https://github.com/user-attachments/assets/f2ef988e-70be-448d-a696-25f4c727903a" />

### 📦 Order History

<img width="1920" height="1333" alt="my-orders" src="https://github.com/user-attachments/assets/5e07caee-799b-4a67-8121-f9c231396868" />

### ➕ Add Product (Seller)

<img width="1920" height="953" alt="add-product" src="https://github.com/user-attachments/assets/0b528e4b-260c-433b-a111-23dd42efad5a" />


### 📊 List of Products (Seller)

<img width="1920" height="1473" alt="product-list" src="https://github.com/user-attachments/assets/d2e72919-77aa-4f9d-8597-edc737939a83" />



