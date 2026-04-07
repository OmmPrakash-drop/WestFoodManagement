const { User, Restaurant, NGO } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/emailService');

// @desc    Get all pending entity verifications
// @route   GET /api/admin/verifications
// @access  Private (ADMIN only)
exports.getPendingVerifications = catchAsync(async (req, res) => {
    const pendingRestaurants = await Restaurant.findAll({
        where: { verificationStatus: { [Op.in]: ['PENDING', 'REVERTED'] } },
        include: [{ model: User, attributes: ['username'] }]
    });

    const pendingNGOs = await NGO.findAll({
        where: { verificationStatus: { [Op.in]: ['PENDING', 'REVERTED'] } },
        include: [{ model: User, attributes: ['username'] }]
    });

    res.json({
        restaurants: pendingRestaurants,
        ngos: pendingNGOs
    });
});

// @desc    Get all entities
// @route   GET /api/admin/entities
// @access  Private (ADMIN only)
exports.getAllEntities = catchAsync(async (req, res) => {
    const restaurants = await Restaurant.findAll({
        include: [{ model: User, attributes: ['username', 'email'] }]
    });

    const ngos = await NGO.findAll({
        include: [{ model: User, attributes: ['username', 'email'] }]
    });

    res.json({
        restaurants,
        ngos
    });
});

// @desc    Approve or Reject an entity
// @route   PUT /api/admin/verify/:type/:id
// @access  Private (ADMIN only)
exports.updateVerificationStatus = catchAsync(async (req, res) => {
    const { type, id } = req.params; // type = 'restaurant' or 'ngo', id = entity ID
    const { status, message: adminMessage } = req.body; // 'APPROVED', 'REJECTED', 'REVERTED'

    if (!['APPROVED', 'REJECTED', 'REVERTED'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status. Must be APPROVED, REJECTED, or REVERTED' });
    }

    if (type === 'restaurant') {
        const restaurant = await Restaurant.findByPk(id, { include: [{ model: User }] });
        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
        restaurant.verificationStatus = status;
        if (adminMessage !== undefined) {
            restaurant.adminMessage = adminMessage;
        }
        await restaurant.save();

        if (restaurant.User && restaurant.User.email) {
            let subject = 'Registration Update';
            let emailMsg = '';
            
            if (status === 'APPROVED') {
                subject = 'Your Restaurant is Verified!';
                emailMsg = `Hello ${restaurant.User.username},\n\nYour account has been officially verified! Welcome to the Food Surplus Network.\n\n"Every meal shared is a step towards a hunger-free world. Thank you for your kindness!"\n\n🚨 IMPORTANT ALERT: Please ensure that all food provided is absolutely safe and hygienic for human consumption.\n\nLog in now to start posting surplus food.`;
            } else if (status === 'REVERTED') {
                subject = 'Action Required: Application Reverted';
                emailMsg = `Hello ${restaurant.User.username},\n\nYour application has been reviewed but we need more details from you:\n\nMessage from Admin: ${adminMessage}\n\nPlease update your profile or reply to this email to continue your registration.`;
            } else {
                subject = 'Application Rejected';
                emailMsg = `Hello ${restaurant.User.username},\n\nUnfortunately, your application could not be verified at this time using the provided documents.\n\nMessage from Admin: ${adminMessage}\n\nPlease reach out to support for more details.`;
            }
            
            await sendEmail({ email: restaurant.User.email, subject, message: emailMsg });
        }

        return res.json({ msg: `Restaurant ${status.toLowerCase()} successfully`, data: restaurant });
    } else if (type === 'ngo') {
        const ngo = await NGO.findByPk(id, { include: [{ model: User }] });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });
        ngo.verificationStatus = status;
        if (adminMessage !== undefined) {
            ngo.adminMessage = adminMessage;
        }
        await ngo.save();

        if (ngo.User && ngo.User.email) {
            let subject = 'Registration Update';
            let emailMsg = '';
            
            if (status === 'APPROVED') {
                subject = 'Your NGO is Verified!';
                emailMsg = `Hello ${ngo.User.username},\n\nYour account has been officially verified! Welcome to the Food Surplus Network.\n\n"Together, we can bridge the gap between waste and want."\n\n🚨 IMPORTANT ALERT: Please inspect all food upon pickup and ensure it remains safe and hygienic for those you serve.\n\nLog in now to start claiming surplus food.`;
            } else if (status === 'REVERTED') {
                subject = 'Action Required: Application Reverted';
                emailMsg = `Hello ${ngo.User.username},\n\nYour application has been reviewed but we need more details from you:\n\nMessage from Admin: ${adminMessage}\n\nPlease update your profile or reply to this email to continue your registration.`;
            } else {
                subject = 'Application Rejected';
                emailMsg = `Hello ${ngo.User.username},\n\nUnfortunately, your application could not be verified at this time using the provided documents.\n\nMessage from Admin: ${adminMessage}\n\nPlease reach out to support for more details.`;
            }

            await sendEmail({ email: ngo.User.email, subject, message: emailMsg });
        }

        return res.json({ msg: `NGO ${status.toLowerCase()} successfully`, data: ngo });
    } else {
        return res.status(400).json({ msg: 'Invalid entity type' });
    }
});

// @desc    Delete a user
// @route   DELETE /api/admin/user/:id
// @access  Private (ADMIN only)
exports.deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'ADMIN') {
        return res.status(400).json({ msg: 'Cannot delete an ADMIN user' });
    }

    await user.destroy(); // Should cascade to Restaurant/NGO/FoodPosts due to DB rules

    return res.json({ msg: 'User and all associated data have been permanently deleted.' });
});
