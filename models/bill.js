const db = require('../config/db');
const { DataTypes } = require('sequelize');


const Bill = db.define('Bill', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},
{
    indexes: [{ unique: true, fields: ['month', 'year', 'ClientId'] }]
});

module.exports = Bill;