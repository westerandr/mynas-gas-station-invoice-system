"use strict";

var express = require("express");

var router = express.Router();

var Invoice = require('../models/invoice');

var Client = require('../models/client');

router.get('/', function _callee(req, res, next) {
  var perPage, page, invoices, count;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          perPage = req.query.perPage || 20;
          page = req.query.page || 1;
          _context.next = 5;
          return regeneratorRuntime.awrap(Invoice.findAll({
            order: [['date', 'DESC']],
            offset: perPage * page - perPage,
            limit: perPage,
            include: Client
          }));

        case 5:
          invoices = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(Invoice.count());

        case 8:
          count = _context.sent;
          res.render("invoices", {
            title: "Invoices",
            invoices: invoices,
            current: page,
            pages: Math.ceil(count / perPage),
            curPerPage: perPage
          });
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          next(_context.t0);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
router.get("/create", function _callee2(req, res, next) {
  var clients;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Client.findAll());

        case 3:
          clients = _context2.sent;
          // sort clients by name
          clients.sort(function (a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
          res.render("invoices/form", {
            title: "New Invoice",
            mode: "create",
            clients: clients
          });
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
router.post("/", function _callee3(req, res, next) {
  var _req$body, date, number, saleType, license, purchaseOrder, amount, clientId, invoice;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body = req.body, date = _req$body.date, number = _req$body.number, saleType = _req$body.saleType, license = _req$body.license, purchaseOrder = _req$body.purchaseOrder, amount = _req$body.amount, clientId = _req$body.clientId;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Invoice.create({
            date: date,
            number: number,
            saleType: saleType,
            license: license,
            purchaseOrder: purchaseOrder,
            amount: amount,
            ClientId: clientId
          }));

        case 4:
          invoice = _context3.sent;
          res.redirect("/invoice/details/" + invoice.number);
          _context3.next = 11;
          break;

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
router.get("/details/:id", function _callee4(req, res, next) {
  var invoice;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Invoice.findOne({
            where: {
              number: req.params.id
            },
            include: Client
          }));

        case 3:
          invoice = _context4.sent;

          if (invoice) {
            _context4.next = 6;
            break;
          }

          throw new Error("Invoice not found");

        case 6:
          res.render("invoices/detail", {
            title: "Invoice Details",
            invoice: invoice
          });
          _context4.next = 12;
          break;

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](0);
          next(_context4.t0);

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
router.get("/edit/:id", function _callee5(req, res, next) {
  var clients, invoice;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(Client.findAll());

        case 3:
          clients = _context5.sent;
          _context5.next = 6;
          return regeneratorRuntime.awrap(Invoice.findByPk(req.params.id));

        case 6:
          invoice = _context5.sent;

          if (invoice) {
            _context5.next = 9;
            break;
          }

          throw new Error("Invoice not found");

        case 9:
          res.render("invoices/form", {
            title: "Edit Invoice",
            invoice: invoice,
            clients: clients,
            mode: 'edit'
          });
          _context5.next = 15;
          break;

        case 12:
          _context5.prev = 12;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);

        case 15:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
router.post("/:id", function _callee6(req, res, next) {
  var _req$body2, date, number, saleType, license, purchaseOrder, amount, clientId;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _req$body2 = req.body, date = _req$body2.date, number = _req$body2.number, saleType = _req$body2.saleType, license = _req$body2.license, purchaseOrder = _req$body2.purchaseOrder, amount = _req$body2.amount, clientId = _req$body2.clientId;
          _context6.next = 4;
          return regeneratorRuntime.awrap(Invoice.update({
            date: date,
            number: number,
            saleType: saleType,
            license: license,
            purchaseOrder: purchaseOrder,
            amount: amount,
            ClientId: clientId
          }, {
            where: {
              number: req.params.id
            }
          }));

        case 4:
          res.redirect("/invoice/details/" + number);
          _context6.next = 10;
          break;

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
router.post("/delete/:id", function _callee7(req, res, next) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(Invoice.destroy({
            where: {
              number: req.params.id
            }
          }));

        case 3:
          res.redirect("/invoice");
          _context7.next = 9;
          break;

        case 6:
          _context7.prev = 6;
          _context7.t0 = _context7["catch"](0);
          next(_context7.t0);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 6]]);
});
module.exports = router;