const { getDb } = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const db = getDb();
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByUsername(username) {
    const db = getDb();
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findById(id) {
    const db = getDb();
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userData) {
    const db = getDb();
    const { data, error } = await db
      .from('profiles')
      .insert({
        email: userData.email.toLowerCase().trim(),
        password_hash: userData.password_hash,
        full_name: userData.full_name.trim(),
        username: userData.username.toLowerCase().trim(),
        date_of_birth: userData.date_of_birth || null,
        currency: userData.currency || 'INR',
        monthly_allowance: Number(userData.monthly_allowance) || 0,
        theme_preference: userData.theme_preference || 'light'
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, updates) {
    const db = getDb();
    const cleanUpdates = {};
    if (updates.full_name !== undefined) cleanUpdates.full_name = updates.full_name.trim();
    if (updates.currency !== undefined) cleanUpdates.currency = updates.currency;
    if (updates.monthly_allowance !== undefined) cleanUpdates.monthly_allowance = Number(updates.monthly_allowance);
    if (updates.date_of_birth !== undefined) cleanUpdates.date_of_birth = updates.date_of_birth;
    if (updates.theme_preference !== undefined) cleanUpdates.theme_preference = updates.theme_preference;

    const { data, error } = await db
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', id);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  }
};

module.exports = userModel;
