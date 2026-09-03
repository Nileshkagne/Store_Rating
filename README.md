# Store Rating Platform

A full-stack web application where users can view registered stores and submit ratings from 1 to 5. Built with ReactJS, ExpressJS, and PostgreSQL.

## Technology Stack

- **Frontend**: ReactJS + Vite
- **Backend**: ExpressJS + Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the project root and update the values:

```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_rating
JWT_SECRET=your_secure_secret_here
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up Database

Ensure PostgreSQL is running, then run the setup script:

```bash
cd backend
node setup-db.js
```

This creates the `store_rating` database, applies the schema, and inserts seed data.

Alternatively, you can manually run the SQL files:

```bash
psql -U postgres -c "CREATE DATABASE store_rating;"
psql -U postgres -d store_rating -f database/schema.sql
psql -U postgres -d store_rating -f database/seed.sql
```

### 4. Start the Application

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Seed Data / Test Accounts

All seed accounts use password: `Password@1`

| Role | Email | Name |
|------|-------|------|
| Admin | admin@example.com | Administrator Of Platform |
| Normal User | user1@example.com | Normal User One Testing |
| Normal User | user2@example.com | Normal User Two Testing |
| Store Owner | owner@example.com | Store Owner One Testing |

## User Roles

### Admin
- Dashboard with total users, stores, and ratings
- Create/view users (Admin, Normal User, Store Owner)
- Create/view stores with owner assignment
- Filter users by name, email, address, role
- Sort all listings by any column
- View user details (Store Owner details include store rating)

### Normal User
- Register and login
- Browse all stores with overall ratings
- Search stores by name or address
- Submit rating (1-5) for any store
- Modify existing rating
- Change password

### Store Owner
- Login
- View store dashboard with average rating
- View list of users who submitted ratings
- Change password

## Validation Rules

| Field | Rule |
|-------|------|
| Name | 20-60 characters |
| Address | Max 400 characters |
| Password | 8-16 chars, at least 1 uppercase, 1 special character |
| Email | Valid email format, unique |
| Rating | Integer 1-5 |

## Implementation Assumptions

1. "Admin users" are users with the `ADMIN` role (no separate fourth role)
2. Store Owner accounts are created by the Admin
3. One Store Owner → One Store relationship
4. Stores with no ratings display "No ratings yet"
5. Store search uses case-insensitive partial matching
6. Average ratings displayed to 1 decimal precision

## Project Structure

```
store-rating-platform/
├── .env.example
├── .gitignore
├── STORE_RATING_PLATFORM_ASSIGNMENT_README.md
├── database/
│   ├── schema.sql
│   └── seed.sql
├── backend/
│   ├── package.json
│   ├── setup-db.js
│   └── src/
│       ├── app.js
│       ├── config/db.js
│       ├── middleware/auth.js, errorHandler.js
│       ├── validators/index.js
│       ├── controllers/authController.js, adminController.js, storeController.js, ownerController.js
│       └── routes/authRoutes.js, adminRoutes.js, storeRoutes.js, ownerRoutes.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── hooks/useAuth.jsx
        ├── services/api.js
        ├── components/Navbar.jsx, ProtectedRoute.jsx
        └── pages/LoginPage.jsx, RegisterPage.jsx, ChangePasswordPage.jsx,
                  AdminDashboard.jsx, AdminUsersPage.jsx, AdminUserDetailPage.jsx,
                  AdminStoresPage.jsx, UserStoresPage.jsx, OwnerDashboard.jsx
```
