# TeenSpend — Teenager Expense Tracker 🚀

A modern, production-grade full-stack web application designed to help teenagers, high schoolers, and college students understand where their allowance goes, set achievable budgets, save for their dream goals, and receive smart, actionable spending coaching before university starts.

---

## 🏗️ Architecture & Technology Stack

```
teen-expense-tracker/
│
├── frontend/                     # React.js + Vite Web Application
│   ├── src/
│   │   ├── components/           # Reusable UI components & Recharts charts
│   │   ├── pages/                # Primary pages (Dashboard, Expenses, Budgets, etc.)
│   │   ├── layouts/              # Main layout shell with Sidebar and Mobile Nav
│   │   ├── services/             # Axios API client modules
│   │   ├── context/              # AuthContext & ThemeContext
│   │   ├── utils/                # Currency formatters & helpers
│   │   ├── styles/               # Design system CSS & components CSS
│   │   ├── App.jsx               # React Router config
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── backend/                      # Node.js + Express.js REST API (Strict MVC)
│   ├── src/
│   │   ├── config/               # Supabase client & local development adapter
│   │   ├── controllers/          # Thin request/response controllers
│   │   ├── middleware/           # JWT auth, centralized errors, rate limiting
│   │   ├── models/               # Data access layer interfacing with PostgreSQL
│   │   ├── routes/               # REST API route handlers
│   │   ├── services/             # Business logic & recommendation engine
│   │   ├── utils/                # Monetary precision & financial math formulas
│   │   ├── validators/           # Strict input validation schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                    # 21 automated test suites
│   ├── package.json
│   └── .env.example
│
├── database/                     # PostgreSQL / Supabase scripts
│   ├── schema.sql                # Normalized schema, indexes, and RLS policies
│   ├── seed.sql                  # Realistic teenage sample dataset
│   └── README.md
│
├── API.md                        # Complete REST API specifications
└── README.md
```

### Frontend Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Data Visualizations**: Recharts (Pie/Donut Category chart, Monthly Spending bar chart, Budget vs Actual chart, Spending Trend area chart)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System with responsive mobile bottom navigation, glassmorphism cards, and complete Dark / Light theme toggles.

### Backend Stack
- **Runtime & Server**: Node.js 24 + Express.js (MVC Pattern)
- **Database**: Supabase PostgreSQL with local development fallback adapter
- **Authentication**: JWT tokens + bcryptjs password hashing (10 salt rounds)
- **Security**: Helmet HTTP headers, CORS whitelisting, express-rate-limit brute-force protection, sanitized error logging.

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Server starts on `http://localhost:5000`
- Health check available at `http://localhost:5000/api/health`
- Run automated tests: `npm test` (all 21 unit & integration tests)

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Frontend starts on `http://localhost:5173`
- Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

### Deploying the Backend (Render / Railway / Fly.io / Heroku)
1. **Root Directory**: `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=super_secret_teenspend_jwt_key_2026_change_in_production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   SUPABASE_URL=https://ldrqeggmglcubydmwuyj.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_YxA5YfYes-U6_oZ4GLnGFQ_Ly7V-i3m
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

### Deploying the Frontend (Vercel / Netlify / Cloudflare Pages)
1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-domain.onrender.com/api
   VITE_SUPABASE_URL=https://ldrqeggmglcubydmwuyj.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_YxA5YfYes-U6_oZ4GLnGFQ_Ly7V-i3m
   ```
*(Note: Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend).*

---

## 🔑 One-Click Demo Student Login

For instant testing without filling forms:
- **Email**: `alex@example.com`
- **Password**: `Password123!`
- Or simply click the **"⚡ One-Click Demo Student Login"** button on the Login page or Landing page!

---

## 💡 The Deterministic Recommendation Engine

Recommendations are **never randomly generated**. TeenSpend uses a rules engine in `backend/src/services/recommendationService.js` that evaluates actual spending transactions against defined thresholds:

1. **Rule 1 (High Entertainment Burden)**: If Entertainment & Gaming expenses exceed 20% of total spending, advises setting a weekly limit.
2. **Rule 2 (Snack Frequency Surge)**: If Food & Snack expenses exceed 30% of total expenses, alerts to create a snack allowance.
3. **Rule 3 (Budget Exceeded)**: When a category's spending passes its assigned limit, flags a high-priority red alert with the exact overage amount.
4. **Rule 4 (Low Savings Rate)**: If the savings rate falls below 15% of income, encourages micro-saving habits upon receiving allowance.
5. **Rule 5 (Spending Reduction)**: If current month spending is lower than the previous month, congratulates the student with the amount saved.
6. **Rule 6 (Subscription Review)**: If recurring subscriptions consume more than 8-10% of monthly income, prompts a service audit.

---

## 🔒 Security & Privacy Measures

- **No Secrets in Frontend**: Supabase Service Role keys and JWT secrets are kept exclusively on the server.
- **Strict User Isolation**: All database queries filter strictly by the verified JWT `user_id`. Client-passed user IDs are never trusted.
- **No Plaintext Passwords**: Passwords hashed with bcrypt (cost 10). Hashes are never returned in API payloads.
- **Row Level Security (RLS)**: PostgreSQL policies prevent users from querying each other's expenses or budgets even with direct database access.
- **Sanitized Logging**: Passwords, tokens, and authorization headers are scrubbed before logging.
