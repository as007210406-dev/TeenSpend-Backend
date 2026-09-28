const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const incomeValidator = require('../validators/incomeValidator');

router.use(authMiddleware);

router.get('/', incomeController.getIncome);
router.post('/', validate(incomeValidator.validateCreate), incomeController.createIncome);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
