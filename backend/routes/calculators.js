const router = require('express').Router();
const calculatorController = require('../controllers/calculatorController');
const { validate, schemas } = require('../middleware/validate');

router.post('/emi',              validate(schemas.calculator.emi),              calculatorController.emi);
router.post('/stamp-duty',       validate(schemas.calculator.stampDuty),        calculatorController.stampDuty);
router.post('/rent-stamp-duty',  validate(schemas.calculator.rentStampDuty),    calculatorController.rentStampDuty);

module.exports = router;
