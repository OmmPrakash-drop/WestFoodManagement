const sequelize = require('../config/db');
const User = require('./User');
const Restaurant = require('./Restaurant');
const NGO = require('./NGO');
const FoodPost = require('./FoodPost');
const FoodRequest = require('./FoodRequest');
const Notification = require('./Notification');

// Define associations centrally
User.hasOne(Restaurant, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Restaurant.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(NGO, { foreignKey: 'user_id', onDelete: 'CASCADE' });
NGO.belongsTo(User, { foreignKey: 'user_id' });

Restaurant.hasMany(FoodPost, { foreignKey: 'restaurant_id' });
FoodPost.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

FoodPost.hasMany(FoodRequest, { foreignKey: 'food_id' });
FoodRequest.belongsTo(FoodPost, { foreignKey: 'food_id' });

NGO.hasMany(FoodRequest, { foreignKey: 'ngo_id' });
FoodRequest.belongsTo(NGO, { foreignKey: 'ngo_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Export all models
module.exports = {
    sequelize,
    User,
    Restaurant,
    NGO,
    FoodPost,
    FoodRequest,
    Notification
};
