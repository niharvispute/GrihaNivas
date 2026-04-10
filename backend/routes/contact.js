const router = require('express').Router();
const contactController = require('../controllers/contactController');
const { validate, schemas } = require('../middleware/validate');

router.post('/', validate(schemas.contact.submit), contactController.submit);

module.exports = router;
