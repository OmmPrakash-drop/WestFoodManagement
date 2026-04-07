const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        // Database Connection Pooling
        pool: {
            max: 10,     // Maximum number of connections in pool
            min: 0,      // Minimum number of connections in pool
            acquire: 30000, // Maximum time (ms) to wait before throwing error finding available connection
            idle: 10000  // Maximum time (ms) connection can be idle before being released
        }
    }
);

module.exports = sequelize;
