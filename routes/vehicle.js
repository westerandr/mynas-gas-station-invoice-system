const express = require("express");
const router = express.Router();
const Vehicle = require('../models/vehicle');
const Client = require('../models/client');


router.get('/', async function(req, res){
    try {
      var perPage = req.query.perPage || 20;
      var page = req.query.page || 1;
        const vehicles = await Vehicle.findAll({
            limit: perPage,
            offset: (perPage * page) - perPage,
            include: Client
        });
        const count = await Vehicle.count();
        res.render("vehicles", { title: "Vehicles", vehicles, current: page, pages: Math.ceil(count / perPage), curPerPage: perPage });
      } catch (error) {
        next(error);
      }
})


router.get("/create", async function (req, res, next) {
    try {
      const clients = await Client.findAll();
      res.render("vehicles/form", { title: "New Vehicle", mode: "create", clients });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/", async function (req, res, next) {
    try {
      const { license, type, clientId } = req.body;
      const vehicle = await Vehicle.create({
        license,
        type,
        ClientId: clientId
      });
  
      res.redirect("/vehicle/details/" + vehicle.id);
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/details/:id", async function (req, res, next) {
    try {
      const vehicle = await Vehicle.findOne({
          where: {
              id: req.params.id
          },
          include: Client
      });
      if (!vehicle) throw new Error("Vehicle not found");

      res.render("vehicles/detail", {
        title: "Vehicle Details",
        vehicle
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/edit/:id", async function (req, res, next) {
    try {
      const clients = await Client.findAll();
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle) throw new Error("Vehicle not found");
      
      res.render("vehicles/form", {
        title: "Edit Vehicle",
        vehicle,
        clients,
        mode: 'edit'
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/:id", async function (req, res, next) {
    try {
        const { license, type, clientId } = req.body;
        await Vehicle.update( 
            {  license, type, ClientId: clientId },
            { where: { id: req.params.id } }
        );
    
        res.redirect("/vehicle/details/" + req.params.id);
    } catch (error) {
      next(error);
    }
  });
  
  router.post("/delete/:id", async function (req, res, next) {
    try {
      await Vehicle.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.redirect("/vehicle");
    } catch (error) {
      next(error);
    }
  });

module.exports = router;