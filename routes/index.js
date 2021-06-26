const express = require('express');
const router = express.Router();
const clientRoutes = require('./client');
const invoiceRoutes = require('./invoice');
const vehicleRoutes = require('./vehicle');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Invoice System' });
});

router.use('/client', clientRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/vehicle', vehicleRoutes);



module.exports = router;
