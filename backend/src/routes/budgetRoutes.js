const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const budgetValidator = require('../validators/budgetValidator');

router.use(authMiddleware);

router.get('/', budgetController.getBudgets);
router.post('/', validate(budgetValidator.validateCreate), budgetController.createBudget);
router.put('/:id', validate(budgetValidator.validateUpdate), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
