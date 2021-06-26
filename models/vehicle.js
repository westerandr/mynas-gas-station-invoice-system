const db = require('../config/db');
const { DataTypes } = require('sequelize');
const Client = require('./client');

const Vehicle = db.define('Vehicle', {
    license: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING
    }
});


module.exports = Vehicle;
