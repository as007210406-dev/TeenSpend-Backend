const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const logger = require('../utils/logger');
const { DEFAULT_CATEGORIES } = require('./constants');
const bcrypt = require('bcryptjs');

let supabase = null;

if (env.isSupabaseConfigured) {
  try {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    supabase = createClient(env.SUPABASE_URL, key, {
      auth: { persistSession: false }
    });
    logger.info('Supabase client successfully initialized with provided credentials.');
  } catch (err) {
    logger.error('Failed to initialize Supabase client:', err);
    supabase = null;
  }
} else {
  logger.info('Supabase credentials not configured in .env. Operating in resilient Local Development Mode.');
}

/**
 * Local resilient data store matching Supabase query builder interface.
 * Used for local testing and offline execution.
 */
class LocalQueryBuilder {
  constructor(tableName, store) {
    this.tableName = tableName;
    this.store = store;
    this.filters = [];
    this.orderBy = null;
    this.limitCount = null;
    this.singleRecord = false;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column, value) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push(item => item[column] !== value);
    return this;
  }

  gte(column, value) {
    this.filters.push(item => new Date(item[column]) >= new Date(value));
    return this;
  }

  lte(column, value) {
    this.filters.push(item => new Date(item[column]) <= new Date(value));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleRecord = true;
    return this;
  }

  update(updates) {
    this.action = 'update';
    this.updatePayload = updates;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  async executeQuery() {
    if (this.action === 'update') {
      if (!this.store[this.tableName]) {
        return { data: null, error: null };
      }
      let updatedRecords = [];
      const now = new Date().toISOString();

      this.store[this.tableName] = this.store[this.tableName].map(item => {
        const match = this.filters.every(filter => filter(item));
        if (match) {
          const updated = { ...item, ...this.updatePayload, updated_at: now };
          updatedRecords.push(updated);
          return updated;
        }
        return item;
      });

      const resData = this.singleRecord ? (updatedRecords[0] || null) : updatedRecords;
      return { data: resData, error: null };
    }

    if (this.action === 'delete') {
      if (!this.store[this.tableName]) {
        return { data: { count: 0 }, error: null };
      }
      const beforeCount = this.store[this.tableName].length;
      this.store[this.tableName] = this.store[this.tableName].filter(item => {
        const match = this.filters.every(filter => filter(item));
        return !match;
      });
      const deletedCount = beforeCount - this.store[this.tableName].length;
      return { data: { count: deletedCount }, error: null };
    }

    // Default: SELECT
    let rows = [...(this.store[this.tableName] || [])];

    // Apply filters
    for (const filter of this.filters) {
      rows = rows.filter(filter);
    }

    // Apply sorting
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      rows.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    if (this.singleRecord) {
      if (rows.length === 0) {
        return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
      }
      return { data: { ...rows[0] }, error: null };
    }

    return { data: rows.map(r => ({ ...r })), error: null };
  }

  then(resolve, reject) {
    return this.executeQuery().then(resolve, reject);
  }

  async insert(data) {
    const records = Array.isArray(data) ? data : [data];
    if (!this.store[this.tableName]) {
      this.store[this.tableName] = [];
    }

    const inserted = records.map(record => {
      const now = new Date().toISOString();
      const newRec = {
        id: record.id || require('crypto').randomUUID(),
        created_at: now,
        updated_at: now,
        ...record
      };
      this.store[this.tableName].push(newRec);
      return newRec;
    });

    return {
      data: Array.isArray(data) ? inserted : inserted[0],
      error: null,
      select: () => ({
        single: async () => ({ data: inserted[0], error: null })
      })
    };
  }
}

// Initial Local Memory Store pre-seeded with sample teen data
const hashSync = (pw) => bcrypt.hashSync(pw, 10);
const demoUserId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const localStore = {
  profiles: [
    {
      id: demoUserId,
      auth_user_id: demoUserId,
      email: 'alex@example.com',
      password_hash: hashSync('Password123!'),
      full_name: 'Alex Rivers',
      username: 'alex_teen',
      date_of_birth: '2008-05-15',
      currency: 'INR',
      monthly_allowance: 5000,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  categories: DEFAULT_CATEGORIES.map(c => ({
    ...c,
    user_id: null,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  })),
  expenses: [
    { id: 'exp-1', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111101', amount: 180, description: 'Lunch at burger cafe', expense_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], payment_method: 'UPI', is_recurring: false },
    { id: 'exp-2', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111103', amount: 50, description: 'Bus pass recharge', expense_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], payment_method: 'Cash', is_recurring: false },
    { id: 'exp-3', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111104', amount: 350, description: 'Movie ticket - Marvel Premiere', expense_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], payment_method: 'UPI', is_recurring: false },
    { id: 'exp-4', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111105', amount: 700, description: 'Steam Game Sale - Indie Bundle', expense_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], payment_method: 'Debit Card', is_recurring: false },
    { id: 'exp-5', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111102', amount: 120, description: 'After-school Boba & Chips', expense_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], payment_method: 'Cash', is_recurring: false },
    { id: 'exp-6', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111107', amount: 450, description: 'Geometry set & Notebooks', expense_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], payment_method: 'Cash', is_recurring: false },
    { id: 'exp-7', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111108', amount: 299, description: 'Spotify Premium Student', expense_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], payment_method: 'UPI', is_recurring: true },
    { id: 'exp-8', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111101', amount: 250, description: 'Pizza slice with teammates', expense_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], payment_method: 'UPI', is_recurring: false },
    { id: 'exp-9', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111106', amount: 850, description: 'Graphic Tee on sale', expense_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], payment_method: 'Debit Card', is_recurring: false },
    { id: 'exp-10', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111103', amount: 60, description: 'Metro rail token', expense_date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0], payment_method: 'Cash', is_recurring: false }
  ],
  budgets: [
    { id: 'bud-1', user_id: demoUserId, category_id: null, amount: 4500, period: 'monthly', start_date: new Date().toISOString().substring(0, 7) + '-01' },
    { id: 'bud-2', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111101', amount: 1200, period: 'monthly', start_date: new Date().toISOString().substring(0, 7) + '-01' },
    { id: 'bud-3', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111102', amount: 600, period: 'monthly', start_date: new Date().toISOString().substring(0, 7) + '-01' },
    { id: 'bud-4', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111105', amount: 800, period: 'monthly', start_date: new Date().toISOString().substring(0, 7) + '-01' },
    { id: 'bud-5', user_id: demoUserId, category_id: '11111111-1111-1111-1111-111111111103', amount: 500, period: 'monthly', start_date: new Date().toISOString().substring(0, 7) + '-01' }
  ],
  savings_goals: [
    { id: 'sav-1', user_id: demoUserId, name: 'Pro Gaming Headset', target_amount: 4500, current_amount: 3200, target_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], description: 'Noise cancelling headset for gaming and music' },
    { id: 'sav-2', user_id: demoUserId, name: 'Weekend Trip with Friends', target_amount: 3000, current_amount: 1100, target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0], description: 'Camping and water park weekend' },
    { id: 'sav-3', user_id: demoUserId, name: 'College Fund Kickstart', target_amount: 10000, current_amount: 2500, target_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0], description: 'Personal long-term savings fund' }
  ],
  income: [
    { id: 'inc-1', user_id: demoUserId, source: 'Monthly Allowance', amount: 5000, income_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0], description: 'Monthly allowance from parents' },
    { id: 'inc-2', user_id: demoUserId, source: 'Birthday Gift', amount: 2000, income_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0], description: 'Gift from Grandma' },
    { id: 'inc-3', user_id: demoUserId, source: 'Math Tutoring', amount: 1200, income_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], description: 'Tutored middle school student' }
  ]
};

const localDbClient = {
  from: (table) => new LocalQueryBuilder(table, localStore)
};

const getDb = () => {
  if (process.env.NODE_ENV === 'test') {
    return localDbClient;
  }
  return supabase || localDbClient;
};

// Reset function for testing purposes
const resetLocalStore = () => {
  // Can be called in tests if needed
};

module.exports = {
  getDb,
  supabase,
  resetLocalStore,
  localStore
};
