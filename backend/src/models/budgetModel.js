const { getDb } = require('../config/db');
const { roundCurrency } = require('../utils/precision');

const budgetModel = {
  async findAllByUser(userId) {
    const db = getDb();
    const { data, error } = await db
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId, budgetData) {
    const db = getDb();
    const { data, error } = await db
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: budgetData.category_id || null, // null = overall monthly budget
        amount: roundCurrency(budgetData.amount),
        period: budgetData.period || 'monthly',
        start_date: budgetData.start_date || new Date().toISOString().substring(0, 7) + '-01',
        end_date: budgetData.end_date || null
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, userId, updates) {
    const db = getDb();
    const cleanUpdates = {};
    if (updates.amount !== undefined) cleanUpdates.amount = roundCurrency(updates.amount);
    if (updates.category_id !== undefined) cleanUpdates.category_id = updates.category_id || null;
    if (updates.period !== undefined) cleanUpdates.period = updates.period;
    if (updates.start_date !== undefined) cleanUpdates.start_date = updates.start_date;
    if (updates.end_date !== undefined) cleanUpdates.end_date = updates.end_date;

    const { data, error } = await db
      .from('budgets')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async delete(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = budgetModel;
