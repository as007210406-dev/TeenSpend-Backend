# TeenSpend — REST API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require an `Authorization` header formatted as:
`Authorization: Bearer <jwt_token>`

---

## Standard Response Envelopes

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed for request data",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "amount", "message": "Amount must be a numeric value greater than zero" }
    ]
  }
}
```

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Auth**: Public (Rate-limited: 30 requests / 15 min)
- **Body**:
```json
{
  "full_name": "Alex Rivers",
  "username": "alex_teen",
  "email": "alex@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "currency": "INR",
  "monthly_allowance": 5000
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "email": "alex@example.com",
      "full_name": "Alex Rivers",
      "username": "alex_teen",
      "currency": "INR",
      "monthly_allowance": 5000
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
- **POST** `/auth/login`
- **Auth**: Public (Rate-limited: 30 requests / 15 min)
- **Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### Current User Profile
- **GET** `/auth/me`
- **Auth**: Bearer Token
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Current user profile retrieved",
  "data": {
    "user": { ... }
  }
}
```

### Update Profile
- **PUT** `/auth/profile`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "full_name": "Alex Rivers",
  "currency": "INR",
  "monthly_allowance": 6000,
  "date_of_birth": "2008-05-15"
}
```

---

## 2. Expenses Endpoints

### List Expenses
- **GET** `/expenses`
- **Auth**: Bearer Token
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `search` (string, filters description)
  - `categoryId` (UUID)
  - `paymentMethod` (`Cash` | `UPI` | `Debit Card` | `Credit Card` | `Online / Wallet` | `Other`)
  - `startDate` (ISO Date `YYYY-MM-DD`)
  - `endDate` (ISO Date `YYYY-MM-DD`)
  - `sortBy` (`newest` | `oldest` | `highest` | `lowest`)
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "expenses": [
      {
        "id": "exp-1",
        "user_id": "...",
        "amount": 180.00,
        "description": "Lunch at burger cafe",
        "expense_date": "2026-09-27",
        "payment_method": "UPI",
        "is_recurring": false,
        "category": {
          "id": "11111111-1111-1111-1111-111111111101",
          "name": "Food & Drinks",
          "icon": "Utensils",
          "color": "#F59E0B"
        }
      }
    ],
    "pagination": {
      "totalCount": 11,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

### Create Expense
- **POST** `/expenses`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "amount": 250.00,
  "category_id": "11111111-1111-1111-1111-111111111101",
  "description": "Burger Combo with Fries",
  "expense_date": "2026-09-28",
  "payment_method": "UPI",
  "is_recurring": false
}
```

### Update Expense
- **PUT** `/expenses/:id`
- **Auth**: Bearer Token
- **Body**: Any subset of `amount`, `category_id`, `description`, `expense_date`, `payment_method`, `is_recurring`.

### Delete Expense
- **DELETE** `/expenses/:id`
- **Auth**: Bearer Token

---

## 3. Categories Endpoints

### List Categories
- **GET** `/categories`
- **Auth**: Bearer Token
- Returns system default categories + authenticated user's custom categories.

### Create Custom Category
- **POST** `/categories`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "name": "Art & Drawing",
  "icon": "Palette",
  "color": "#10B981"
}
```

---

## 4. Budgets Endpoints

### List Budgets with Progress
- **GET** `/budgets`
- **Auth**: Bearer Token
- Returns list of budgets with current month spent, remaining balance, usage percentage, and health status (`healthy`, `warning`, `danger`).

### Create Budget
- **POST** `/budgets`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "category_id": null,
  "amount": 5000.00,
  "period": "monthly"
}
```
*(Set `category_id: null` for Overall Monthly Budget, or provide a category UUID for category-specific caps).*

---

## 5. Savings Goals Endpoints

### List Savings Goals
- **GET** `/savings-goals`
- **Auth**: Bearer Token

### Create Goal
- **POST** `/savings-goals`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "name": "Pro Gaming Headset",
  "target_amount": 4500.00,
  "current_amount": 1000.00,
  "target_date": "2026-11-30",
  "description": "Noise cancelling headset for gaming and focus"
}
```

### Add Money (Contribute)
- **POST** `/savings-goals/:id/contribute`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "amount": 250.00
}
```

---

## 6. Income Endpoints

### List Income
- **GET** `/income`
- **Auth**: Bearer Token

### Create Income
- **POST** `/income`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "source": "Monthly Allowance",
  "amount": 5000.00,
  "income_date": "2026-09-01",
  "description": "Monthly allowance from parents"
}
```

---

## 7. Analytics & Reports Endpoints

- **GET** `/analytics/summary` - Current month total income, expenses, savings, budget remaining, transaction count.
- **GET** `/analytics/categories` - Category expenditure totals and percentages.
- **GET** `/analytics/monthly?months=6` - Monthly spending and income breakdown over the last N months.
- **GET** `/analytics/trends?timeframe=30d` - Timeframe spending curve (`7d`, `30d`, `3m`, `6m`, `1y`).
- **GET** `/analytics/budget-comparison` - Budget vs Actual comparison across all categories.
- **GET** `/analytics/metrics` - Deep metrics: daily, weekly, and monthly averages, highest category, most expensive transaction, savings rate, days remaining in the month.

---

## 8. Recommendations & Smart Insights

- **GET** `/recommendations`
- **Auth**: Bearer Token
- **Response**:
```json
{
  "success": true,
  "message": "Spending recommendations and smart insights retrieved",
  "data": {
    "recommendations": [
      {
        "id": "rec-entertainment-high",
        "type": "warning",
        "priority": "medium",
        "title": "High Entertainment Spending",
        "message": "You are spending a large share of your money on entertainment. Consider setting a weekly entertainment limit.",
        "category": "Entertainment"
      }
    ],
    "insights": [
      {
        "id": "ins-avg-daily",
        "icon": "Calendar",
        "text": "Your average daily spending is ₹121.23."
      },
      {
        "id": "ins-savings-rate",
        "icon": "PiggyBank",
        "text": "You have saved 58.6% of your income."
      }
    ]
  }
}
```
