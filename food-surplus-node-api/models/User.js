const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'user_id'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING, // RESTAURANT, NGO, ADMIN
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // ACTIVE, INACTIVE
        defaultValue: 'ACTIVE'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false // We use custom createdAt
});

module.exports = User;
