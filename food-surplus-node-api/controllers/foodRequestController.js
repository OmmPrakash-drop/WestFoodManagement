const { FoodRequest, FoodPost, NGO, Restaurant, User, Notification } = require('../models');

// @desc    Create a new food request
// @route   POST /api/food-requests
// @access  Private (NGO only)
exports.createFoodRequest = async (req, res) => {
    try {
        const { foodId } = req.body;

        // Check if user is an NGO
        if (req.user.role !== 'NGO') {
            return res.status(403).json({ msg: 'Access denied. Only NGOs can request food.' });
        }

        const ngo = await NGO.findOne({ where: { userId: req.user.id } });
        if (!ngo) {
            return res.status(404).json({ msg: 'NGO profile not found' });
        }

        const foodPost = await FoodPost.findByPk(foodId);
        if (!foodPost) {
            return res.status(404).json({ msg: 'Food post not found' });
        }

        if (foodPost.status !== 'AVAILABLE') {
            return res.status(400).json({ msg: 'Food is no longer available' });
        }

        const request = await FoodRequest.create({
            foodId,
            ngoId: ngo.ngoId,
            requestStatus: 'PENDING'
        });

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get requests for current NGO
// @route   GET /api/food-requests/my-requests
// @access  Private (NGO only)
exports.getMyRequests = async (req, res) => {
    try {
        const ngo = await NGO.findOne({ where: { userId: req.user.id } });
        if (!ngo) return res.status(404).json({ msg: 'NGO profile not found' });

        const requests = await FoodRequest.findAll({
            where: { ngoId: ngo.ngoId },
            include: [
                {
                    model: FoodPost,
                    include: [Restaurant]
                }
            ],
            order: [['requestTime', 'DESC']]
        });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get requests received by a Restaurant
// @route   GET /api/food-requests/restaurant-requests
// @access  Private (Restaurant only)
exports.getRestaurantRequests = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
        if (!restaurant) return res.status(404).json({ msg: 'Restaurant profile not found' });

        // Find all food posts by this restaurant
        // Then find requests for those posts
        // Alternatively, use associations if set up deeper: Request -> Post -> Restaurant
        // Let's do a join query via FoodPost
        const requests = await FoodRequest.findAll({
            include: [
                {
                    model: FoodPost,
                    where: { restaurantId: restaurant.restaurantId },
                    required: true
                },
                {
                    model: NGO,
                    attributes: ['ngoName', 'contactNumber', 'address']
                }
            ],
            order: [['requestTime', 'DESC']]
        });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/food-requests/:id
// @access  Private (Restaurant only)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // APPROVED, REJECTED, TAKEN, DELIVERED
        const requestId = req.params.id;

        // Ensure status is one of the valid ones
        if (!['APPROVED', 'REJECTED', 'TAKEN', 'DELIVERED'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status update' });
        }

        const request = await FoodRequest.findByPk(requestId, {
            include: [
                FoodPost,
                { model: NGO, include: [User] }
            ]
        });

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        // Verify ownership based on user role
        if (req.user.role === 'RESTAURANT') {
            const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
            if (!restaurant || request.FoodPost.restaurantId !== restaurant.restaurantId) {
                return res.status(403).json({ msg: 'Not authorized to manage this request' });
            }
        } else if (req.user.role === 'NGO') {
            const ngo = await NGO.findOne({ where: { userId: req.user.id } });
            if (!ngo || request.ngoId !== ngo.ngoId || !['TAKEN', 'DELIVERED'].includes(status)) {
                return res.status(403).json({ msg: 'Not authorized, NGOs can only set status to TAKEN or DELIVERED' });
            }
        }

        request.requestStatus = status;
        await request.save();

        // Sync Food Post Status based on Request Status
        const post = await FoodPost.findByPk(request.foodId);
        if (post) {
            if (status === 'APPROVED') {
                post.status = 'CLAIMED';
                await post.save();
                // Optionally reject other pending requests for the same food
            } else if (status === 'TAKEN') {
                post.status = 'TAKEN';
                await post.save();
            } else if (status === 'DELIVERED') {
                post.status = 'DELIVERED';
                await post.save();
            }
        }

        // Create notification for the NGO
        // Ensure NGO relation is loaded
        if (request.NGO && request.NGO.userId) {
            await Notification.create({
                userId: request.NGO.userId,
                message: `Your request for ${request.FoodPost.foodName} has been ${status.toLowerCase()}.`,
                isRead: false
            });
        }

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
