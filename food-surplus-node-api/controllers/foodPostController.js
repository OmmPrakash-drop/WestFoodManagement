const FoodPost = require('../models/FoodPost');
const Restaurant = require('../models/Restaurant');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

// @desc    Create a new food post
// @route   POST /api/food-posts
// @access  Private (Restaurant only)
exports.createFoodPost = async (req, res) => {
    try {
        const { foodName, quantity, quantityUnit, pickupTime } = req.body;

        // Check if user is a restaurant
        if (req.user.role !== 'RESTAURANT') {
            return res.status(403).json({ msg: 'Access denied. Only restaurants can post food.' });
        }

        // Get restaurant details
        const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant profile not found' });
        }

        if (restaurant.verificationStatus !== 'APPROVED') {
            return res.status(403).json({ msg: 'Your account must be manually verified by an Admin before you can post food.' });
        }

        const newPost = await FoodPost.create({
            restaurantId: restaurant.restaurantId,
            foodName,
            quantity,
            quantityUnit,
            pickupTime,
            pickupAddress: restaurant.address,
            status: 'AVAILABLE'
        });

        if (req.io) {
            req.io.emit('newFoodPost', newPost);
        }

        console.log('Post created successfully:', newPost);
        res.json(newPost);
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Get all available food posts (With Pagination)
// @route   GET /api/food-posts
// @access  Private (Authenticated users)
exports.getAllFoodPosts = catchAsync(async (req, res, next) => {
    // 1. Pagination values
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 2. Query with findAndCountAll for large data sets
    const { count, rows } = await FoodPost.findAndCountAll({
        where: { 
            status: 'AVAILABLE',
            pickupTime: { [Op.gt]: new Date() }
        },
        include: [
            {
                model: Restaurant,
                attributes: ['restaurantName', 'address', 'contactNumber']
            }
        ],
        order: [['postedAt', 'DESC']],
        limit,
        offset
    });

    // 3. Send payload with pagination metadata
    res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        results: rows.length,
        data: rows
    });
});

// @desc    Get posts by current restaurant
// @route   GET /api/food-posts/my-posts
// @access  Private (Restaurant only)
exports.getMyFoodPosts = async (req, res) => {
    try {
        if (req.user.role !== 'RESTAURANT') {
            return res.status(403).json({ msg: 'Access denied.' });
        }

        const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant profile not found' });
        }

        const posts = await FoodPost.findAll({
            where: { restaurantId: restaurant.restaurantId },
            order: [['postedAt', 'DESC']]
        });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a food post
// @route   DELETE /api/food-posts/:id
// @access  Private (Restaurant only + Owner)
exports.deleteFoodPost = async (req, res) => {
    try {
        const post = await FoodPost.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user authorization
        const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });

        if (!restaurant || post.restaurantId !== restaurant.restaurantId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.destroy();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
