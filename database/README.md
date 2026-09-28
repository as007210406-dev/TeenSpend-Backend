# TeenSpend Database Setup (Supabase PostgreSQL)

This directory contains the database schema and seed data for the **TeenSpend — Teenager Expense Tracker** application.

---

## 1. Quick Setup on Supabase

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - Note down your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings > API**.

2. **Execute Database Schema**:
   - In your Supabase Dashboard, navigate to the **SQL Editor**.
   - Open `schema.sql` from this directory, paste its contents into the editor, and click **Run**.
   - This creates:
     - `profiles`: Teenager profile information, currency, allowance, and preferences.
     - `categories`: Default categories (Food, Gaming, School, etc.) and user-created custom categories.
     - `expenses`: Individual expense transactions with dates, payment methods, and recurring flags.
     - `budgets`: Category budgets and overall monthly budgets.
     - `savings_goals`: Target savings goals with progress tracking.
     - `income`: Allowances, gifts, part-time jobs, and earnings.
     - Indexes on `(user_id, expense_date)`, `(user_id, category_id)`, etc.
     - Triggers for automatic `updated_at` timestamps.
     - Row Level Security (RLS) policies enforcing strict user data isolation.

3. **Insert Seed Data (Optional for testing)**:
   - In the SQL Editor, copy and execute `seed.sql`.
   - This populates 12 default teenager-friendly categories, an example student user (`alex@example.com`), initial income, budgets, goals, and realistic expenses.

---

## 2. Row Level Security (RLS) Overview

All tables have Row Level Security enabled.
- **Profiles**: Authenticated users can only read and update their own record.
- **Categories**: Global categories (`user_id IS NULL`) are viewable by all users. Users can only insert, update, or delete their own custom categories.
- **Expenses, Budgets, Savings Goals, Income**: Strictly isolated by `user_id`. Users can never query or manipulate records belonging to another teenager.

---

## 3. Local Development Mode

The backend also includes a resilient local database adapter (`backend/src/config/db.js`). If `SUPABASE_URL` is omitted in development, it automatically operates in local mode seeded with realistic teenager data, so the application runs immediately without requiring an internet connection or pre-configured cloud database.
