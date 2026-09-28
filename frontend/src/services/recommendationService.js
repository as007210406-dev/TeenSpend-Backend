import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const res = await api.get('/recommendations');
    return res.data;
  }
};
