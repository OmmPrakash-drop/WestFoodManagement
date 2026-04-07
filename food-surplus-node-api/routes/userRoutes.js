const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { getAllUsers, deleteUser, changePassword } = require('../controllers/userController');
const validate = require('../middleware/validate');
const { param, check } = require('express-validator');

// Routes restricted strictly to ADMIN
router.get('/', auth, roleAuth(['ADMIN']), getAllUsers);
router.delete('/:id', [
    auth, 
    roleAuth(['ADMIN']),
    param('id', 'User ID must be an integer').isInt()
], validate, deleteUser);

// Route available to ANY authenticated user
router.put('/change-password', [
    auth,
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], validate, changePassword);

module.exports = router;
