const router = require('express').Router();

router.use('/auth',         require('./auth'));
router.use('/properties',   require('./properties'));
router.use('/leads',        require('./leads'));
router.use('/users',        require('./users'));
router.use('/blogs',        require('./blogs'));
router.use('/testimonials', require('./testimonials'));
router.use('/banners',      require('./banners'));
router.use('/stamp-duty',   require('./stampDuty'));
router.use('/calculators',  require('./calculators'));
router.use('/contact',      require('./contact'));
router.use('/dashboard',    require('./dashboard'));

module.exports = router;
