const db = require('../config/db');
const { DataTypes } = require('sequelize');
const Client = require('./client');

const Vehicle = db.define('Vehicle', {
    license: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.STRING
    }
});


module.exports = Vehicle;
