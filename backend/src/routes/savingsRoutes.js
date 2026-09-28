const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const savingsValidator = require('../validators/savingsValidator');

router.use(authMiddleware);

router.get('/', savingsController.getGoals);
router.post('/', validate(savingsValidator.validateCreate), savingsController.createGoal);
router.put('/:id', savingsController.updateGoal);
router.post('/:id/contribute', validate(savingsValidator.validateContribute), savingsController.contribute);
router.delete('/:id', savingsController.deleteGoal);

module.exports = router;
