const express = require("express");
const router = express.Router();

router.get('/', function(req, res){
    res.render('vehicles', {title: 'Vehicles'});
})

module.exports = router;