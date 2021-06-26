const db = require('../config/db');
const { DataTypes } = require('sequelize');


const Invoice = db.define('Invoice', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    saleType: {
        type: DataTypes.STRING
    },
    license: {
        type: DataTypes.STRING
    },
    purchaseOrder: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.DECIMAL
    }
});

module.exports = Invoice;