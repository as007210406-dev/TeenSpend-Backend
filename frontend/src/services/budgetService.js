import api from './api';

export const budgetService = {
  async getBudgets() {
    const res = await api.get('/budgets');
    return res.data;
  },

  async createBudget(budgetData) {
    const res = await api.post('/budgets', budgetData);
    return res.data.budget;
  },

  async updateBudget(id, updates) {
    const res = await api.put(`/budgets/${id}`, updates);
    return res.data.budget;
  },

  async deleteBudget(id) {
    const res = await api.delete(`/budgets/${id}`);
    return res;
  }
};
