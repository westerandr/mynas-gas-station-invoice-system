const Sequelize = require('sequelize');

const db = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB,
    logging: false
});

module.exports = db;