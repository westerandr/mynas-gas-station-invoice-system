const db = require('../config/db');
const Client = require('./client');
const Vehicle = require('./vehicle');
const Invoice = require('./invoice');
const Bill = require('./bill');

Client.hasMany(Vehicle);
Vehicle.belongsTo(Client);
Client.hasMany(Invoice);
Invoice.belongsTo(Client);
Client.hasMany(Bill);
Bill.belongsTo(Client);

db.sync().then(() => {
    console.log('DB Synched');   
}).catch(err => console.log(err))

module.exports = { Client, Vehicle, Invoice, Bill}
