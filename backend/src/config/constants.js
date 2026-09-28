// Standard application constants for TeenSpend

const DEFAULT_CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Food & Drinks', icon: 'Utensils', color: '#F59E0B', is_default: true },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Snacks & Cafes', icon: 'Coffee', color: '#EF4444', is_default: true },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Transportation', icon: 'Bus', color: '#3B82F6', is_default: true },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Entertainment & Movies', icon: 'Film', color: '#8B5CF6', is_default: true },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Gaming & Tech', icon: 'Gamepad2', color: '#EC4899', is_default: true },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Shopping & Clothes', icon: 'ShoppingBag', color: '#10B981', is_default: true },
  { id: '11111111-1111-1111-1111-111111111107', name: 'School & Education', icon: 'BookOpen', color: '#6366F1', is_default: true },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Subscriptions', icon: 'Repeat', color: '#14B8A6', is_default: true },
  { id: '11111111-1111-1111-1111-111111111109', name: 'Sports & Fitness', icon: 'Activity', color: '#F97316', is_default: true },
  { id: '11111111-1111-1111-1111-111111111110', name: 'Gifts & Charity', icon: 'Gift', color: '#A855F7', is_default: true },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Travel & Trips', icon: 'Plane', color: '#06B6D4', is_default: true },
  { id: '11111111-1111-1111-1111-111111111112', name: 'Other', icon: 'MoreHorizontal', color: '#64748B', is_default: true }
];

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Online / Wallet',
  'Other'
];

const BUDGET_PERIODS = ['monthly', 'weekly', 'custom'];

const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'];

module.exports = {
  DEFAULT_CATEGORIES,
  PAYMENT_METHODS,
  BUDGET_PERIODS,
  SUPPORTED_CURRENCIES
};
