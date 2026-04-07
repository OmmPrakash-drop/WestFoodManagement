const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Restaurant = sequelize.define('Restaurant', {
    restaurantId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'restaurant_id'
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
    },
    restaurantName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'restaurant_name'
    },
    address: {
        type: DataTypes.STRING
    },
    contactNumber: {
        type: DataTypes.STRING,
        field: 'contact_number'
    },
    registrationCertificate: {
        type: DataTypes.STRING,
        field: 'registration_certificate'
    },
    documentUrl: {
        type: DataTypes.STRING,
        field: 'document_url'
    },
    verificationStatus: {
        type: DataTypes.STRING, // PENDING, APPROVED, REJECTED, REVERTED
        field: 'verification_status',
        defaultValue: 'PENDING'
    },
    adminMessage: {
        type: DataTypes.TEXT,
        field: 'admin_message',
        allowNull: true
    },
}, {
    tableName: 'restaurants',
    timestamps: false
});

// Associations defined here or in index.js. 
// For now, let's keep it simple and define in index.js to avoid circular deps if possible, 
// but putting FK here:
Restaurant.belongsTo(User, { foreignKey: 'user_id', targetKey: 'userId' });

module.exports = Restaurant;
