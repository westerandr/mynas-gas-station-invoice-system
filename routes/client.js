const express = require("express");
const router = express.Router();
const Client = require("../models/client");

router.get("/", async function (req, res, next) {
  try {
    const clients = await Client.findAll();
    res.render("clients", { title: "Clients", clients });
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

    res.redirect("/client/" + client.id);
  } catch (error) {
    next(error);
  }
});

router.get("/details/:id", async function (req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) throw new Error("Client not found");
    res.render("clients/detail", {
      title: "Client Details - " + client?.name,
      clientDetail: JSON.stringify(client),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async function (req, res, next) {
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

router.delete("/:id", async function (req, res, next) {
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
