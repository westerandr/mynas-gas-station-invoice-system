const db = require('../config/db');
const { DataTypes } = require('sequelize');
const Vehicle = require('./vehicle');
const Invoice = require('./invoice');

const Client = db.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    billingCounter: {
        type: DataTypes.INTEGER,
    }
});


module.exports = Client;