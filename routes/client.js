const express = require("express");
const router = express.Router();
const Client = require('../models/client');

router.get('/', async function(req, res){
    const clients = await Client.findAll();
    res.render('clients', {title: 'Clients', clients});
});

router.get('/create', async function(req, res, next){
    try {
        res.render('clients/form', { title: 'New Client', mode: 'create'});
    } catch (error) {
        next(error);
    }
});

module.exports = router;