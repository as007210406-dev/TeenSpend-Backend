const { getDb } = require('../config/db');
const { roundCurrency } = require('../utils/precision');

const savingsModel = {
  async findAllByUser(userId) {
    const db = getDb();
    const { data, error } = await db
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId, goalData) {
    const db = getDb();
    const { data, error } = await db
      .from('savings_goals')
      .insert({
        user_id: userId,
        name: goalData.name.trim(),
        target_amount: roundCurrency(goalData.target_amount),
        current_amount: roundCurrency(goalData.current_amount || 0),
        target_date: goalData.target_date || null,
        description: goalData.description ? goalData.description.trim() : null
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, userId, updates) {
    const db = getDb();
    const cleanUpdates = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.target_amount !== undefined) cleanUpdates.target_amount = roundCurrency(updates.target_amount);
    if (updates.current_amount !== undefined) cleanUpdates.current_amount = roundCurrency(updates.current_amount);
    if (updates.target_date !== undefined) cleanUpdates.target_date = updates.target_date;
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();

    const { data, error } = await db
      .from('savings_goals')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async contribute(id, userId, contributionAmount) {
    const goal = await this.findById(id, userId);
    if (!goal) return null;

    const newAmount = roundCurrency((Number(goal.current_amount) || 0) + Number(contributionAmount));
    return this.update(id, userId, { current_amount: newAmount });
  },

  async delete(id, userId) {
    const db = getDb();
    const { data, error } = await db
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = savingsModel;
