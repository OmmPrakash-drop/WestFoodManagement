const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const NGO = sequelize.define('NGO', {
    ngoId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'ngo_id'
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
    },
    ngoName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ngo_name'
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
    tableName: 'ngos',
    timestamps: false
});

NGO.belongsTo(User, { foreignKey: 'user_id', targetKey: 'userId' });

module.exports = NGO;
