const { User, Restaurant, NGO } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        // Enhance user data with profile info if needed, or just return basic user info
        // For a simple dashboard, basic info + role is enough
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Manual cascade for safety if DB constraints aren't set up perfectly yet
        if (user.role === 'RESTAURANT') {
            await Restaurant.destroy({ where: { userId: user.userId } });
        } else if (user.role === 'NGO') {
            await NGO.destroy({ where: { userId: user.userId } });
        }

        await user.destroy();
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private (Any authenticated user)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
