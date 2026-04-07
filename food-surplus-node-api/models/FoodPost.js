const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Restaurant = require('./Restaurant');

const FoodPost = sequelize.define('FoodPost', {
    foodId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'food_id'
    },
    restaurantId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'restaurant_id',
        references: {
            model: 'restaurants',
            key: 'restaurant_id'
        }
    },
    foodName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'food_name'
    },
    quantity: {
        type: DataTypes.DOUBLE
    },
    quantityUnit: {
        type: DataTypes.STRING, // kg, plates, etc.
        field: 'quantity_unit'
    },
    pickupAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'pickup_address'
    },
    pickupTime: {
        type: DataTypes.DATE,
        field: 'pickup_time'
    },
    status: {
        type: DataTypes.STRING, // AVAILABLE, CLAIMED, TAKEN, DELIVERED
        defaultValue: 'AVAILABLE'
    },
    postedAt: {
        type: DataTypes.DATE,
        field: 'posted_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'food_posts',
    timestamps: false
});

FoodPost.belongsTo(Restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurantId' });

module.exports = FoodPost;
