# TeenSpend — Backend REST API

Production-ready Node.js & Express.js REST API for **TeenSpend — Teenager Expense Tracker**, adhering to strict MVC architectural principles.

---

## 1. Architecture Overview (MVC)

```
backend/
├── src/
│   ├── config/          # Environment configuration, constants, and database adapter
│   ├── controllers/     # Thin controllers handling HTTP requests and responses
│   ├── middleware/      # Authentication (JWT), centralized error handling, rate limiting, validation
│   ├── models/          # Data access layer interfacing with Supabase PostgreSQL
│   ├── routes/          # RESTful endpoint definitions
│   ├── services/        # Core business logic (budgets, analytics, deterministic recommendations)
│   ├── utils/           # Financial math calculations, monetary precision, sanitized logger
│   ├── validators/      # Request input validation rules
│   ├── app.js           # Express app setup and middleware pipeline
│   └── server.js        # Server listener and graceful shutdown
├── tests/               # Automated test suites (Auth, Expenses, Budgets, Analytics, Recommendations)
├── package.json
└── .env.example
```

---

## 2. Key Features

- **Strict User Isolation**: Every database query scopes strictly by the authenticated JWT user context.
- **Deterministic Recommendation Engine**: Evaluates spending patterns against concrete rules (entertainment thresholds, budget caps, savings targets, subscription monitoring).
- **Monetary Precision**: Dedicated utility functions avoid binary floating-point rounding errors.
- **Security First**: Helmet security headers, CORS protection, express-rate-limit brute-force prevention, bcrypt password hashing (10 salt rounds), sanitized logging (no credentials/tokens printed).
- **Database Flexibility**: Native `@supabase/supabase-js` client with an offline-capable local development adapter.

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
cd backend
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Running Locally
```bash
npm run dev
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Running Automated Tests
```bash
npm test
```
All 21 comprehensive test suites will execute and validate authentication, expenses, budgets, calculations, and recommendation rules.

---

## 4. Production Deployment Guide (Render, Railway, Heroku, AWS)

When deploying this backend to platforms like Render, Railway, or Fly.io:

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by platform)
   - `JWT_SECRET`: A long secure random string
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g. `https://your-frontend.vercel.app`)
   - `SUPABASE_URL`: `https://ldrqeggmglcubydmwuyj.supabase.co`
   - `SUPABASE_ANON_KEY`: `sb_publishable_YxA5YfYes-U6_oZ4GLnGFQ_Ly7V-i3m`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key_here`
