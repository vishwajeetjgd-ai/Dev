# Campus Canteen - Food Ordering System

A complete canteen food ordering web application with React frontend and Node.js backend.

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS + Socket.IO Client
- **Backend**: Node.js + Express.js + Socket.IO
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO

## Features

- 3 User Roles: Admin, Student, Teacher
- JWT-based authentication with role-based access
- Menu management (CRUD by admin)
- Cart and order placement
- Auto-cancel orders after 30 minutes if not accepted
- Token/queue system with daily reset
- Coupon & offer system (welcome coupons for new users)
- Real-time order status updates via Socket.IO
- Admin dashboard with analytics
- Mobile responsive UI

## Setup Instructions

### Prerequisites

- Node.js v18+ installed
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone & Navigate

```bash
cd canteen-app
```

### 2. Backend Setup

```bash
cd backend

# Create .env file from example
cp .env.example .env

# Edit .env with your MongoDB URI
# For MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/canteen
# For local MongoDB: mongodb://localhost:27017/canteen

npm install
npm run dev
```

The backend starts on `http://localhost:5000`.

On first run, it automatically:
- Seeds an admin user (admin@canteen.com / Admin@123)
- Seeds 10 sample menu items

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

### 4. Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@canteen.com | Admin@123 |
| Student | Register new account | - |
| Teacher | Register new account | - |

## Environment Variables (.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/canteen
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@canteen.com
ADMIN_PASSWORD=Admin@123
AUTO_CANCEL_MINUTES=30
CORS_ORIGIN=http://localhost:5173
```

## API Routes

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/register | Public | Register student/teacher |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Auth | Get profile |
| PUT | /api/auth/me | Auth | Update profile |

### Menu
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/menu | Public | Get all items |
| GET | /api/menu/:id | Public | Get single item |
| POST | /api/menu | Admin | Create item |
| PUT | /api/menu/:id | Admin | Update item |
| DELETE | /api/menu/:id | Admin | Delete item |
| PATCH | /api/menu/:id/availability | Admin | Toggle availability |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/orders | Student/Teacher | Place order |
| GET | /api/orders | Student/Teacher | My orders |
| GET | /api/orders/active | Student/Teacher | Active orders |
| GET | /api/orders/:id | Auth | Single order |
| PATCH | /api/orders/:id/cancel | Student/Teacher | Cancel order |
| PATCH | /api/orders/:id/status | Admin | Update status |

### Coupons
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/coupons | Admin | Create coupon |
| GET | /api/coupons | Admin | List coupons |
| PUT | /api/coupons/:id | Admin | Update coupon |
| DELETE | /api/coupons/:id | Admin | Deactivate coupon |
| POST | /api/coupons/validate | Student/Teacher | Validate coupon |
| GET | /api/coupons/my | Student/Teacher | My coupons |

### Tokens
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/tokens/current | Public | Current serving token |
| GET | /api/tokens/queue | Public | Queue info |
| PATCH | /api/tokens/advance | Admin | Advance serving token |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/orders | Admin | All orders (filtered) |

## Folder Structure

```
canteen-app/
├── backend/
│   ├── server.js                  # Entry point
│   ├── src/
│   │   ├── config/                # DB connection, Socket.IO setup
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # Express route definitions
│   │   ├── controllers/           # Route handlers
│   │   ├── middlewares/           # Auth, role, error middleware
│   │   ├── services/              # Business logic (timers, tokens, coupons)
│   │   ├── seeds/                 # Admin & menu seed data
│   │   └── utils/                 # ApiError, asyncHandler, constants
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/                # Constants
│   │   ├── contexts/              # Auth, Cart, Socket contexts
│   │   ├── hooks/                 # useAuth, useCart, useSocket
│   │   ├── services/              # API service layer
│   │   ├── socket/                # Socket.IO client
│   │   ├── router/                # App routes, protected routes
│   │   ├── layouts/               # Dashboard layout
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   └── utils/                 # Formatters, helpers
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Future Improvements

- Image upload with Multer/Cloudinary instead of URLs
- Payment gateway integration (Razorpay/Stripe)
- Email/SMS notifications for order updates
- Push notifications via service workers
- Admin analytics charts with date range filters
- Rate and review system for menu items
- Multiple canteen support
- Order scheduling (pre-order for specific time)
- PWA support for mobile app experience
- Unit and integration tests
