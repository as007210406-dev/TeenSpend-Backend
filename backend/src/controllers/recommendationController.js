const recommendationService = require('../services/recommendationService');
const { successResponse } = require('../utils/responseHandler');

const recommendationController = {
  async getRecommendations(req, res, next) {
    try {
      const result = await recommendationService.getRecommendationsAndInsights(req.user.userId);
      return successResponse(res, 200, 'Spending recommendations and smart insights retrieved', result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = recommendationController;
