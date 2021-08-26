const express = require("express");
const router = express.Router();
const Client = require("../models/client");
const Vehicle = require("../models/vehicle");
const Invoice = require('../models/invoice');

router.get("/", async function (req, res, next) {
  try {
    var perPage = req.query.perPage || 20;
    var page = req.query.page || 1;
    const clients = await Client.findAll({
      limit: perPage,
      offset: (page * perPage) - perPage
    });
    const count = await Client.count();
    res.render("clients", { title: "Clients", clients, current: page, pages: Math.ceil(count / perPage), curPerPage: perPage });
  } catch (error) {
    next(error);
  }
});

router.get("/create", async function (req, res, next) {
  try {
    res.render("clients/form", { title: "New Client", mode: "create" });
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { name, invoice } = req.body;
    const client = await Client.create({
      name: name,
      billingCounter: invoice,
    });

    res.redirect("/client/details/" + client.id);
  } catch (error) {
    next(error);
  }
});

router.get("/details/:id", async function (req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) throw new Error("Client not found");
    const vehicles = await Vehicle.findAll({
      where: {
        ClientId: client?.id,
      }
    });
    const numInvoices = await Invoice.count({
      where: {
        ClientId: client?.id
      }
    })
    res.render("clients/detail", {
      title: "Client Details",
      clientDetail: client,
      vehicles,
      numInvoices
    });
  } catch (error) {
    next(error);
  }
});

router.get("/edit/:id", async function (req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) throw new Error("Client not found");
    
    res.render("clients/form", {
      title: "Edit Client",
      clientDetail: client,
      mode: 'edit'
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id", async function (req, res, next) {
  try {
    const { name, invoice } = req.body;
    await Client.update(
      { name, billingCounter: invoice },
      { where: { id: req.params.id } }
    );
    res.redirect("/client");
  } catch (error) {
    next(error);
  }
});

router.post("/delete/:id", async function (req, res, next) {
  try {
    await Client.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/client");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
