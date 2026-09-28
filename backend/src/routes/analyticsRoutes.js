const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/summary', analyticsController.getSummary);
router.get('/categories', analyticsController.getCategoryBreakdown);
router.get('/monthly', analyticsController.getMonthlySpending);
router.get('/trends', analyticsController.getSpendingTrends);
router.get('/budget-comparison', analyticsController.getBudgetComparison);
router.get('/metrics', analyticsController.getDeepMetrics);

module.exports = router;
