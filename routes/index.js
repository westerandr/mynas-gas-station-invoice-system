const express = require('express');
const router = express.Router();
const clientRoutes = require('./client');
const invoiceRoutes = require('./invoice');
const vehicleRoutes = require('./vehicle');
const billRoutes = require('./bill');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Invoice System' });
});

router.use('/client', clientRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/vehicle', vehicleRoutes);
router.use('/bill', billRoutes);




module.exports = router;
