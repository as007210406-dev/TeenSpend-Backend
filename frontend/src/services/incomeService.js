import api from './api';

export const incomeService = {
  async getIncome(params = {}) {
    const res = await api.get('/income', { params });
    return res.data;
  },

  async createIncome(incomeData) {
    const res = await api.post('/income', incomeData);
    return res.data.income;
  },

  async updateIncome(id, updates) {
    const res = await api.put(`/income/${id}`, updates);
    return res.data.income;
  },

  async deleteIncome(id) {
    const res = await api.delete(`/income/${id}`);
    return res;
  }
};
