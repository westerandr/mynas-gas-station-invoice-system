"use strict";

var db = require('../config/db');

var _require = require('sequelize'),
    DataTypes = _require.DataTypes;

var CustomBill = db.define('CustomBill', {
  dateIssued: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [{
    unique: true,
    fields: ['startDate', 'endDate', 'ClientId']
  }]
});
module.exports = CustomBill;