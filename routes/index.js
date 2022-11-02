const express = require('express');
const router = express.Router();
const clientRoutes = require('./client');
const invoiceRoutes = require('./invoice');
const vehicleRoutes = require('./vehicle');
const billRoutes = require('./bill');
const customBillRoutes = require('./customBill');
const { Invoice, Client, Bill, Vehicle, CustomBill } = require("../models");


/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const invoices = await Invoice.count();
    const bills = await Bill.count();
    const clients = await Client.count();
    const vehicles = await Vehicle.count();
    
    res.render('index', { title: 'Invoice System', invoices, bills, clients, vehicles });
  } catch (error) {
    next(error);
  }
});

router.use('/client', clientRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/vehicle', vehicleRoutes);
router.use('/bill', billRoutes);
router.use('/customBills', customBillRoutes);




module.exports = router;
