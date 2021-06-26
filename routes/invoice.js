const express = require("express");
const router = express.Router();

router.get('/', function(req, res){
    res.render('invoices', {title: 'Invoices'});
})

module.exports = router;