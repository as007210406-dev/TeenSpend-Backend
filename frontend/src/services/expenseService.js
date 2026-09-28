import api from './api';

export const expenseService = {
  async getExpenses(params = {}) {
    const res = await api.get('/expenses', { params });
    return res.data;
  },

  async getExpenseById(id) {
    const res = await api.get(`/expenses/${id}`);
    return res.data.expense;
  },

  async createExpense(expenseData) {
    const res = await api.post('/expenses', expenseData);
    return res.data.expense;
  },

  async updateExpense(id, updates) {
    const res = await api.put(`/expenses/${id}`, updates);
    return res.data.expense;
  },

  async deleteExpense(id) {
    const res = await api.delete(`/expenses/${id}`);
    return res;
  }
};
