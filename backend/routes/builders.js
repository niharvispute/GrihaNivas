const router = require('express').Router();
const builderController = require('../controllers/builderController');
const { validate, schemas } = require('../middleware/validate');

router.get('/', validate(schemas.builder.publicList, 'query'), builderController.listPublic);
router.get('/:slug', validate(schemas.builder.slugParams, 'params'), builderController.getPublicBySlug);

module.exports = router;
