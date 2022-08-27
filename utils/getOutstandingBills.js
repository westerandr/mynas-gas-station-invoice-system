const Bill = require("../models/bill");
const Client = require("../models/client");

module.exports = {
  getOutstandingBills: async () => {
    let unpaidBills = await Bill.findAll({
      where: {
        isPaid: false
      },
      include: [Client]
    });
    unpaidBills.sort((a, b) => {
      if (a.Client.name < b.Client.name) return -1;
      if (a.Client.name > b.Client.name) return 1;
      return 0;
    });
    return unpaidBills;
  }
}