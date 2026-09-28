import api from './api';

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories');
    return res.data.categories;
  },

  async createCategory(categoryData) {
    const res = await api.post('/categories', categoryData);
    return res.data.category;
  },

  async updateCategory(id, updates) {
    const res = await api.put(`/categories/${id}`, updates);
    return res.data.category;
  },

  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res;
  }
};
