const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const FoodPost = require('./FoodPost');
const NGO = require('./NGO');

const FoodRequest = sequelize.define('FoodRequest', {
    requestId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'request_id'
    },
    foodId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'food_id',
        references: {
            model: 'food_posts',
            key: 'food_id'
        }
    },
    ngoId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'ngo_id',
        references: {
            model: 'ngos',
            key: 'ngo_id'
        }
    },
    requestStatus: {
        type: DataTypes.STRING, // PENDING, APPROVED, REJECTED
        field: 'request_status',
        defaultValue: 'PENDING'
    },
    requestTime: {
        type: DataTypes.DATE, // Using DATE for DATETIME in MySQL
        field: 'request_time',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'food_requests',
    timestamps: false
});

FoodRequest.belongsTo(FoodPost, { foreignKey: 'food_id', targetKey: 'foodId' });
FoodRequest.belongsTo(NGO, { foreignKey: 'ngo_id', targetKey: 'ngoId' });

module.exports = FoodRequest;
