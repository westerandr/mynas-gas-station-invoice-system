const express = require("express");
const router = express.Router();
const moment = require('moment');
const Op = require('sequelize').Op;
const { Invoice } = require("../models");
const { exportBill } = require('../utils/export-excel');
const Bill = require('../models/bill');
const Client = require('../models/client');
const Vehicle = require('../models/vehicle');

router.get('/', async function(req, res, next){
    try {

      var perPage = req.query.perPage || 20;
      var page = req.query.page || 1;
      const bills = await Bill.findAll({
          offset: ((perPage * page) - perPage),
          limit: perPage,
          include: Client
      });
      const count = await Bill.count();
        const clients = await Client.findAll();
        res.render("bills", { title: "Billing", bills, clients, current: page, pages: Math.ceil(count / perPage), curPerPage: perPage });
      } catch (error) {
        next(error);
      }
})


router.get("/create", async function (req, res, next) {
    try {
      const clients = await Client.findAll();
      res.render("bills/form", { title: "New Bill", mode: "create", clients });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/", async function (req, res, next) {
    try {
      const { date, month, year, clientId } = req.body;
      const client = await Client.findByPk(clientId);
      if(!client) throw new Error('Client not found for Bill creation');

      let startDate = moment(new Date(`01 ${month} ${year}`))
      let endDate = moment(startDate).endOf('month');

      let sd = startDate.format('YYYY-MM-DD');
      let ed = endDate.format('YYYY-MM-DD');

      const invoices = await Invoice.findAll({
          where: {
              ClientId: clientId,
              date: {
                  [Op.between]: [sd, ed]
              }
          }
      });

      if(invoices.length < 1) throw new Error(`No Invoices found for the given query`);

      const bill = await Bill.create({
        date, 
        month,
        year,
        number: client.billingCounter, 
        ClientId: clientId
      });

      await client.increment('billingCounter', { by: 1});
  
      res.redirect("/bill/details/" + bill.id);
    } catch (error) {
      next(error);
    }
  });

  router.post('/find', async function(req, res, next){
    try {
      const { clientId, month, year } = req.body;
      const foundBill = await Bill.findOne({
        where: {
          ClientId: clientId,
          month,
          year
        }
      });
      if(!foundBill) throw new Error('Bill not found for the requested parameters');
      res.redirect('/bill/details/'+foundBill?.id);
    } catch (error) {
      next(error);
    }
  })
  
  router.get("/details/:id", async function (req, res, next) {
    try {
      const bill = await Bill.findOne({
          where: {
              id: req.params.id
          },
          include: Client
      });
      if (!bill) throw new Error("Bill not found");

      let billsNotPaid = await Bill.findAll({
        where: {
          id: {
            [Op.not] : bill?.id,
          },
          ClientId: bill?.ClientId,
          isPaid: false,
          year: {
            [Op.lte]: bill?.year, 
          },
        }
      });

      let startDate = moment(new Date(`01 ${bill.month} ${bill.year}`))
      let endDate = moment(startDate).endOf('month');

      let sd = startDate.format('YYYY-MM-DD');
      let ed = endDate.format('YYYY-MM-DD');
   

      if(billsNotPaid?.length > 0){
        billsNotPaid = billsNotPaid.filter(b => {
          let thisBillMonthYear = moment(new Date(`01 ${b?.month} ${b?.year}`));
          return thisBillMonthYear.isBefore(startDate);
        });
      }

   

      const invoices = await Invoice.findAll({
          where: {
              ClientId: bill?.ClientId,
              date: {
                  [Op.between]: [sd, ed]
              }
          }
      });

      const amount = invoices.reduce((total, invoice) => total + invoice?.amount, 0);
      if(bill.amount !== amount){
        bill.amount = amount;
        await bill.save();
      }

      const dateIssued = moment(bill.date).format('Do MMMM YYYY');
      const vehicles = await Vehicle.findAll({
        where: {
          ClientId: bill?.ClientId,
        }
      });
      res.render("bills/detail", {
        title: "Billing Details",
        bill,
        dateIssued,
        invoices,
        vehicles,
        billsNotPaid
      });
    } catch (error) {
      next(error);
    }
  });
  
  
  router.post("/delete/:id", async function (req, res, next) {
    try {
      await Bill.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.redirect("/bill");
    } catch (error) {
      next(error);
    }
  });

  router.post("/pay/:id", async function (req, res, next) {
    try {
      await Bill.update(
        { isPaid: true },
        { where: { id: req.params.id } }
      );
      res.redirect("/bill/details/"+req.params.id);
    } catch (error) {
      next(error);
    }
  });


  router.post("/export/:id", async function(req, res, next){
    try {
      const bill = await Bill.findOne({
        where: {
            id: req.params.id
        },
        include: Client
      });
      if (!bill) throw new Error("Bill not found");

      let billsNotPaid = await Bill.findAll({
        where: {
          id: {
            [Op.not] : bill?.id,
          },
          ClientId: bill?.ClientId,
          isPaid: false,
          year: {
            [Op.lte]: bill?.year, 
          },
        }
      });


      let startDate = moment(new Date(`01 ${bill.month} ${bill.year}`))
      let endDate = moment(startDate).endOf('month');

      let sd = startDate.format('YYYY-MM-DD');
      let ed = endDate.format('YYYY-MM-DD');

      let dueDate = moment(startDate).add(1, 'M')
      let dueMonth = dueDate.format("MMMM");
      let dueYear = dueDate.format("YYYY");

      if(billsNotPaid?.length > 0){
        billsNotPaid = billsNotPaid.filter(b => {
          let thisBillMonthYear = moment(new Date(`01 ${b?.month} ${b?.year}`));
          return thisBillMonthYear.isBefore(startDate);
        });
      }

      const invoices = await Invoice.findAll({
          where: {
              ClientId: bill?.ClientId,
              date: {
                  [Op.between]: [sd, ed]
              }
          }
      });

      const dateIssued = moment(bill.date).format('Do MMMM YYYY');
      const vehicles = await Vehicle.findAll({
        where: {
          ClientId: bill?.ClientId,
        }
      });

      let filename = `${bill?.Client?.name} ${bill.month} ${bill.year}`.toUpperCase();
      filename += ".xlsx"
      await exportBill(res, filename, bill, { dueMonth, dueYear}, dateIssued, vehicles, invoices, billsNotPaid );

    } catch (error) {
      
      next(error);
    }
  });

module.exports = router;