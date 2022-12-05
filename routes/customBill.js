const express = require("express");
const router = express.Router();
const moment = require("moment");
const Op = require("sequelize").Op;
const { Invoice } = require("../models");
const { exportBill } = require("../utils/exportExcel");
const CustomBill = require("../models/customBill");
const Client = require("../models/client");
const Vehicle = require("../models/vehicle");

router.get("/", async function (req, res, next) {
  try {
    var perPage = req.query.perPage || 20;
    var page = req.query.page || 1;
    const customBills = await CustomBill.findAll({
      offset: perPage * page - perPage,
      limit: perPage,
      include: Client,
    });
    const count = await CustomBill.count();
    const clients = await Client.findAll();
    res.render("customBills", {
      title: "Custom Bills",
      customBills,
      clients,
      current: page,
      pages: Math.ceil(count / perPage),
      curPerPage: perPage,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/create", async function (req, res, next) {
  try {
    const clients = await Client.findAll();
    res.render("customBills/form", { title: "New Custom Bill", mode: "create", clients });
  } catch (error) {
    next(error);
  }
});

router.get("/edit/:id", async function (req, res, next) {
  try {
    const clients = await Client.findAll();
    const customBill = await CustomBill.findByPk(req.params.id);
    if (!customBill) throw new Error("Custom Bill not found");

    res.render("customBills/form", {
      title: "Edit Custom Bill",
      customBill,
      clients,
      mode: "edit",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { dateIssued, startDate, endDate, clientId } = req.body;
    const client = await Client.findByPk(clientId);
    if (!client) throw new Error("Client not found for Bill creation");

    let sd = moment(startDate).format("YYYY-MM-DD");
    let ed = moment(endDate).format("YYYY-MM-DD");

    const invoices = await Invoice.findAll({
      where: {
        ClientId: clientId,
        date: {
          [Op.between]: [sd, ed],
        },
      },
    });

    if (invoices.length < 1)
      throw new Error(`No Invoices found for the given query`);

    const customBill = await CustomBill.create({
      dateIssued,
      startDate,
      endDate,
      number: client.billingCounter,
      ClientId: clientId,
    });

    await customBill.save();

    await client.increment("billingCounter", { by: 1 });

    res.redirect("/customBills/details/" + customBill.id);
  } catch (error) {
    next(error);
  }
});

router.post("/update/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { date, startDate, endDate, clientId, isPaid } = req.body;

    let billPaid = (isPaid && isPaid == "on") ? true : false;
    const client = await Client.findByPk(clientId);
    if (!client) throw new Error("Client not found for Custom Bill creation");

    let sd = moment(startDate).format("YYYY-MM-DD");
    let ed = moment(endDate).format("YYYY-MM-DD");

    const invoices = await Invoice.findAll({
      where: {
        ClientId: clientId,
        date: {
          [Op.between]: [sd, ed],
        },
      },
    });

    if (invoices.length < 1)
      throw new Error(`No Invoices found for the given query`);
 
    await CustomBill.update({
      date,
      startDate,
      endDate,
      isPaid: billPaid,
      ClientId: clientId,
    },{ where: { id}});

    res.redirect("/customBills/details/" + id);
  } catch (error) {
    next(error);
  }
});

router.post("/find", async function (req, res, next) {
  try {
    const { clientId, startDate, endDate } = req.body;
    const foundBill = await CustomBill.findOne({
      where: {
        ClientId: clientId,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
      },
    });
    if (!foundBill)
      throw new Error("Bill not found for the requested parameters");
    res.redirect("/customBills/details/" + foundBill?.id);
  } catch (error) {
    next(error);
  }
});

router.get("/details/:id", async function (req, res, next) {
  try {
    const customBill = await CustomBill.findOne({
      where: {
        id: req.params.id,
      },
      include: Client,
    });
    if (!customBill) throw new Error("Custom Bill not found");

    let billsNotPaid = await CustomBill.findAll({
      where: {
        id: {
          [Op.not]: customBill?.id,
        },
        ClientId: customBill?.ClientId,
        isPaid: false,
      },
    });

    let startDate = moment(customBill.startDate);
    let endDate = moment(customBill.endDate);

    let sd = startDate.format("YYYY-MM-DD");
    let ed = endDate.format("YYYY-MM-DD");

    const invoices = await Invoice.findAll({
      where: {
        ClientId: customBill?.ClientId,
        date: {
          [Op.between]: [sd, ed],
        },
      },
      order: [
        ['date', 'ASC']
      ]
    });

    const amount = invoices.reduce(
      (total, invoice) => total + invoice?.amount,
      0
    );
    if (customBill.amount !== amount) {
      customBill.amount = amount;
      await customBill.save();
    }

    const dateIssued = moment(customBill.dateIssued).format("Do MMMM YYYY");
    const vehicles = await Vehicle.findAll({
      where: {
        ClientId: customBill?.ClientId,
      },
    });
    res.render("customBills/detail", {
      title: "Custom Bill Details",
      customBill,
      dateIssued,
      invoices,
      vehicles,
      billsNotPaid,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/delete/:id", async function (req, res, next) {
  try {
    await CustomBill.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/customBills");
  } catch (error) {
    next(error);
  }
});

router.post("/pay/:id", async function (req, res, next) {
  try {
    await CustomBill.update({ isPaid: true }, { where: { id: req.params.id } });
    res.redirect("/customBills/details/" + req.params.id);
  } catch (error) {
    next(error);
  }
});

router.post("/export/:id", async function (req, res, next) {
  try {
    const customBill = await CustomBill.findOne({
      where: {
        id: req.params.id,
      },
      include: Client,
    });
    if (!customBill) throw new Error("Bill not found");

    let billsNotPaid = await CustomBill.findAll({
      where: {
        id: {
          [Op.not]: customBill?.id,
        },
        ClientId: customBill?.ClientId,
        isPaid: false,
      },
    });

    let startDate = moment(customBill.startDate);
    let endDate = moment(customBill.endDate);

    let sd = startDate.format("YYYY-MM-DD");
    let ed = endDate.format("YYYY-MM-DD");

    let dueDate = moment(endDate).add(1, "w");
    let dueMonth = dueDate.format("MMMM");
    let dueYear = dueDate.format("YYYY");

    const invoices = await Invoice.findAll({
      where: {
        ClientId: customBill?.Client?.id,
        date: {
          [Op.between]: [sd, ed],
        },
      },
    });

    const dateIssued = moment(customBill.dateIssued).format("Do MMMM YYYY");
    const vehicles = await Vehicle.findAll({
      where: {
        ClientId: customBill?.ClientId,
      },
    });

    let filename =
      `${customBill?.Client?.name} ${moment(customBill.startDate).format('DD-MM-YYYY')} ${moment(customBill.endDate).format('DD-MM-YYYY')}`.toUpperCase();
    filename += ".xlsx";
    await exportBill(
      res,
      filename,
      customBill,
      { dueMonth, dueYear },
      dateIssued,
      vehicles,
      invoices,
      []
    );
  } catch (error) {
    next(error);
  }
});


module.exports = router;
