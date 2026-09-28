import api from './api';

export const savingsService = {
  async getGoals() {
    const res = await api.get('/savings-goals');
    return res.data;
  },

  async createGoal(goalData) {
    const res = await api.post('/savings-goals', goalData);
    return res.data.goal;
  },

  async updateGoal(id, updates) {
    const res = await api.put(`/savings-goals/${id}`, updates);
    return res.data.goal;
  },

  async contribute(id, amount) {
    const res = await api.post(`/savings-goals/${id}/contribute`, { amount });
    return res.data.goal;
  },

  async deleteGoal(id) {
    const res = await api.delete(`/savings-goals/${id}`);
    return res;
  }
};
