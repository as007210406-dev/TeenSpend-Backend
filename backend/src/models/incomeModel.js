const { getDb } = require('../config/db');
const { roundCurrency } = require('../utils/precision');

const incomeModel = {
  async findAllByUser(userId, filters = {}) {
    const db = getDb();
    let query = db
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('income_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('income_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId, incomeData) {
    const db = getDb();
    const { data, error } = await db
      .from('income')
      .insert({
        user_id: userId,
        source: incomeData.source.trim(),
        amount: roundCurrency(incomeData.amount),
        income_date: incomeData.income_date || new Date().toISOString().split('T')[0],
        description: incomeData.description ? incomeData.description.trim() : null
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, userId, updates) {
    const db = getDb();
    const cleanUpdates = {};
    if (updates.source !== undefined) cleanUpdates.source = updates.source.trim();
    if (updates.amount !== undefined) cleanUpdates.amount = roundCurrency(updates.amount);
    if (updates.income_date !== undefined) cleanUpdates.income_date = updates.income_date;
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();

    const { data, error } = await db
      .from('income')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async delete(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = incomeModel;
