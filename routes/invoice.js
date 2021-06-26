const express = require("express");
const router = express.Router();
const Invoice = require('../models/invoice');
const Client = require('../models/client');


router.get('/', async function(req, res, next){
    try {
        const invoices = await Invoice.findAll({
            include: Client
        });
        res.render("invoices", { title: "Invoices", invoices });
      } catch (error) {
        next(error);
      }
})


router.get("/create", async function (req, res, next) {
    try {
      const clients = await Client.findAll();
      res.render("invoices/form", { title: "New Invoice", mode: "create", clients });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/", async function (req, res, next) {
    try {
      const { date, number, saleType, license, purchaseOrder, amount, clientId } = req.body;
      const invoice = await Invoice.create({
        date, 
        number, 
        saleType, 
        license, 
        purchaseOrder, 
        amount,
        ClientId: clientId
      });
  
      res.redirect("/invoice/details/" + invoice.number);
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/details/:id", async function (req, res, next) {
    try {
      const invoice = await Invoice.findOne({
          where: {
              number: req.params.id
          },
          include: Client
      });
      if (!invoice) throw new Error("Invoice not found");

      res.render("invoices/detail", {
        title: "Invoice Details",
        invoice
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/edit/:id", async function (req, res, next) {
    try {
      const clients = await Client.findAll();
      const invoice = await Invoice.findByPk(req.params.id);
      if (!invoice) throw new Error("Invoice not found");
      
      res.render("invoices/form", {
        title: "Edit Invoice",
        invoice,
        clients,
        mode: 'edit'
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/:id", async function (req, res, next) {
    try {
        const { date, saleType, license, purchaseOrder, amount, clientId } = req.body;
        await Invoice.update( 
            { date, saleType, license, purchaseOrder, amount, clientId  },
            { where: { number: req.params.id } }
        );
    
        res.redirect("/invoice/details/" + req.params.id);
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/delete/:id", async function (req, res, next) {
    try {
      await Invoice.destroy({
        where: {
          number: req.params.id,
        },
      });
      res.redirect("/invoice");
    } catch (error) {
      next(error);
    }
  });

module.exports = router;