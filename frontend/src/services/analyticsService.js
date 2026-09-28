import api from './api';

export const analyticsService = {
  async getSummary() {
    const res = await api.get('/analytics/summary');
    return res.data.summary;
  },

  async getCategoryBreakdown(params = {}) {
    const res = await api.get('/analytics/categories', { params });
    return res.data.breakdown;
  },

  async getMonthlySpending(months = 6) {
    const res = await api.get('/analytics/monthly', { params: { months } });
    return res.data.history;
  },

  async getSpendingTrends(timeframe = '30d') {
    const res = await api.get('/analytics/trends', { params: { timeframe } });
    return res.data.trends;
  },

  async getBudgetComparison() {
    const res = await api.get('/analytics/budget-comparison');
    return res.data.comparison;
  },

  async getDeepMetrics() {
    const res = await api.get('/analytics/metrics');
    return res.data.metrics;
  }
};
