const { getDb } = require('../config/db');
const { roundCurrency } = require('../utils/precision');

const expenseModel = {
  async findAllByUser(userId, filters = {}) {
    const db = getDb();
    let query = db
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];

    // Filter by search keyword in description if provided
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(e => e.description && e.description.toLowerCase().includes(q));
    }

    // Sorting
    const sortBy = filters.sortBy || 'newest';
    switch (sortBy) {
      case 'oldest':
        results.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
        break;
      case 'highest':
        results.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        results.sort((a, b) => a.amount - b.amount);
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date) || new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    // Pagination
    const totalCount = results.length;
    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = filters.limit ? Math.max(1, parseInt(filters.limit, 10)) : null;

    if (limit) {
      const offset = (page - 1) * limit;
      results = results.slice(offset, offset + limit);
    }

    return {
      expenses: results,
      totalCount,
      page,
      limit: limit || totalCount,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1
    };
  },

  async findById(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId, expenseData) {
    const db = getDb();
    const cleanAmount = roundCurrency(expenseData.amount);
    const { data, error } = await db
      .from('expenses')
      .insert({
        user_id: userId,
        amount: cleanAmount,
        category_id: expenseData.category_id,
        description: expenseData.description.trim(),
        expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
        payment_method: expenseData.payment_method || 'Cash',
        is_recurring: Boolean(expenseData.is_recurring)
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, userId, updates) {
    const db = getDb();
    const cleanUpdates = {};
    if (updates.amount !== undefined) cleanUpdates.amount = roundCurrency(updates.amount);
    if (updates.category_id !== undefined) cleanUpdates.category_id = updates.category_id;
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
    if (updates.expense_date !== undefined) cleanUpdates.expense_date = updates.expense_date;
    if (updates.payment_method !== undefined) cleanUpdates.payment_method = updates.payment_method;
    if (updates.is_recurring !== undefined) cleanUpdates.is_recurring = Boolean(updates.is_recurring);

    const { data, error } = await db
      .from('expenses')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async delete(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = expenseModel;
