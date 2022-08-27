"use strict";

var Bill = require("../models/bill");

var Client = require("../models/client");

module.exports = {
  getOutstandingBills: function getOutstandingBills() {
    var unpaidBills;
    return regeneratorRuntime.async(function getOutstandingBills$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(Bill.findAll({
              where: {
                isPaid: false
              },
              include: [Client]
            }));

          case 2:
            unpaidBills = _context.sent;
            unpaidBills.sort(function (a, b) {
              if (a.Client.name < b.Client.name) return -1;
              if (a.Client.name > b.Client.name) return 1;
              return 0;
            });
            return _context.abrupt("return", unpaidBills);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  }
};