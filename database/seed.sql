-- ==============================================================================
-- TeenSpend — Seed Data for Development & Testing
-- ==============================================================================

-- 1. Default Global Categories
INSERT INTO public.categories (id, user_id, name, icon, color, is_default)
VALUES 
    ('11111111-1111-1111-1111-111111111101', NULL, 'Food & Drinks', 'Utensils', '#F59E0B', TRUE),
    ('11111111-1111-1111-1111-111111111102', NULL, 'Snacks & Cafes', 'Coffee', '#EF4444', TRUE),
    ('11111111-1111-1111-1111-111111111103', NULL, 'Transportation', 'Bus', '#3B82F6', TRUE),
    ('11111111-1111-1111-1111-111111111104', NULL, 'Entertainment & Movies', 'Film', '#8B5CF6', TRUE),
    ('11111111-1111-1111-1111-111111111105', NULL, 'Gaming & Tech', 'Gamepad2', '#EC4899', TRUE),
    ('11111111-1111-1111-1111-111111111106', NULL, 'Shopping & Clothes', 'ShoppingBag', '#10B981', TRUE),
    ('11111111-1111-1111-1111-111111111107', NULL, 'School & Education', 'BookOpen', '#6366F1', TRUE),
    ('11111111-1111-1111-1111-111111111108', NULL, 'Subscriptions', 'Repeat', '#14B8A6', TRUE),
    ('11111111-1111-1111-1111-111111111109', NULL, 'Sports & Fitness', 'Activity', '#F97316', TRUE),
    ('11111111-1111-1111-1111-111111111110', NULL, 'Gifts & Charity', 'Gift', '#A855F7', TRUE),
    ('11111111-1111-1111-1111-111111111111', NULL, 'Travel & Trips', 'Plane', '#06B6D4', TRUE),
    ('11111111-1111-1111-1111-111111111112', NULL, 'Other', 'MoreHorizontal', '#64748B', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Development Test User Profile (Password: "Password123!")
-- Note: In production Supabase, users are created through Supabase Auth, and the profile is inserted.
-- Hashed with bcrypt (cost 10) for 'Password123!'
INSERT INTO public.profiles (
    id, email, password_hash, full_name, username, date_of_birth, currency, monthly_allowance
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'alex@example.com',
    '$2a$10$wTqXU9bKzJ3cO1E2xK7X..qA4n3m8n7h8n1v6r5t4y3u2i1o0p9a', -- placeholder bcrypt hash for demo
    'Alex Rivers',
    'alex_teen',
    '2008-05-15',
    'INR',
    5000.00
) ON CONFLICT (email) DO NOTHING;

-- 3. Incomes for Alex
INSERT INTO public.income (id, user_id, source, amount, income_date, description)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Monthly Allowance', 5000.00, CURRENT_DATE - INTERVAL '15 days', 'Monthly allowance from parents'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Birthday Gift', 2000.00, CURRENT_DATE - INTERVAL '25 days', 'Gift from Grandma'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Math Tutoring', 1200.00, CURRENT_DATE - INTERVAL '5 days', 'Tutored middle school student')
ON CONFLICT (id) DO NOTHING;

-- 4. Budgets for Alex
INSERT INTO public.budgets (id, user_id, category_id, amount, period, start_date)
VALUES
    -- Total overall monthly budget
    ('cccccccc-cccc-cccc-cccc-cccccccc0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 4500.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE)),
    -- Category budgets
    ('cccccccc-cccc-cccc-cccc-cccccccc0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111101', 1200.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE)), -- Food
    ('cccccccc-cccc-cccc-cccc-cccccccc0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111102', 600.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE)),  -- Snacks
    ('cccccccc-cccc-cccc-cccc-cccccccc0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111105', 800.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE)),  -- Gaming
    ('cccccccc-cccc-cccc-cccc-cccccccc0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111103', 500.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE))   -- Transport
ON CONFLICT (id) DO NOTHING;

-- 5. Savings Goals for Alex
INSERT INTO public.savings_goals (id, user_id, name, target_amount, current_amount, target_date, description)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pro Gaming Headset', 4500.00, 3200.00, CURRENT_DATE + INTERVAL '60 days', 'Noise cancelling headset for gaming and music'),
    ('dddddddd-dddd-dddd-dddd-dddddddd0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Weekend Trip with Friends', 3000.00, 1100.00, CURRENT_DATE + INTERVAL '90 days', 'Camping and water park weekend'),
    ('dddddddd-dddd-dddd-dddd-dddddddd0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'College Fund Kickstart', 10000.00, 2500.00, CURRENT_DATE + INTERVAL '365 days', 'Personal long-term savings fund')
ON CONFLICT (id) DO NOTHING;

-- 6. Sample Realistic Expenses
INSERT INTO public.expenses (id, user_id, category_id, amount, description, expense_date, payment_method, is_recurring)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111101', 180.00, 'Lunch at burger cafe', CURRENT_DATE - INTERVAL '1 day', 'UPI', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111103', 50.00, 'Bus pass recharge', CURRENT_DATE - INTERVAL '2 days', 'Cash', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111104', 350.00, 'Movie ticket - Marvel Premiere', CURRENT_DATE - INTERVAL '3 days', 'UPI', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111105', 700.00, 'Steam Game Sale - Indie Bundle', CURRENT_DATE - INTERVAL '4 days', 'Debit Card', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111102', 120.00, 'After-school Boba & Chips', CURRENT_DATE - INTERVAL '5 days', 'Cash', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111107', 450.00, 'Geometry set & Notebooks', CURRENT_DATE - INTERVAL '7 days', 'Cash', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111108', 299.00, 'Spotify Premium Student', CURRENT_DATE - INTERVAL '10 days', 'UPI', TRUE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111101', 250.00, 'Pizza slice with teammates', CURRENT_DATE - INTERVAL '12 days', 'UPI', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111106', 850.00, 'Graphic Tee on sale', CURRENT_DATE - INTERVAL '14 days', 'Debit Card', FALSE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111103', 60.00, 'Metro rail token', CURRENT_DATE - INTERVAL '18 days', 'Cash', FALSE)
ON CONFLICT (id) DO NOTHING;
