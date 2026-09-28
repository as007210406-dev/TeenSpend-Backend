const { getDb } = require('../config/db');

const categoryModel = {
  async findAllForUser(userId) {
    const db = getDb();
    // Default categories (user_id IS NULL) + user's custom categories
    const { data: allCategories, error } = await db
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (allCategories || []).filter(c => c.user_id === null || c.user_id === userId);
  },

  async findById(id) {
    const db = getDb();
    const { data, error } = await db
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId, categoryData) {
    const db = getDb();
    const { data, error } = await db
      .from('categories')
      .insert({
        user_id: userId,
        name: categoryData.name.trim(),
        icon: categoryData.icon || 'Tag',
        color: categoryData.color || '#6366F1',
        is_default: false
      });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async update(id, userId, updates) {
    const db = getDb();
    // Enforce ownership: can only update custom categories created by user
    const { data, error } = await db
      .from('categories')
      .update({
        name: updates.name ? updates.name.trim() : undefined,
        icon: updates.icon,
        color: updates.color
      })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async delete(id, userId) {
    const db = getDb();
    // Enforce ownership: cannot delete default categories
    const { data, error } = await db
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = categoryModel;
