const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser, updateRegistration } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { check } = require('express-validator');
const upload = require('../middleware/upload');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('document'), [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either RESTAURANT or NGO').isIn(['RESTAURANT', 'NGO']),
    check('contactNumber', 'Contact number is required').not().isEmpty(),
    check('address', 'Physical address is required for verification').not().isEmpty(),
    check('registrationCertificate', 'Government registration/certification ID is required').not().isEmpty()
], validate, registerUser);

// @route   PUT api/auth/update-registration
// @desc    Re-submit registration details
// @access  Private (Needs token)
router.put('/update-registration', auth, upload.single('document'), [
    check('address', 'Physical address is required').not().isEmpty(),
    check('registrationCertificate', 'Government registration ID is required').not().isEmpty()
], validate, updateRegistration);  

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', [
    check('username', 'Username is required').exists(),
    check('password', 'Password is required').exists()
], validate, loginUser);

// @route   GET api/auth/user
// @desc    Get current user (protected)
// @access  Private
router.get('/user', auth, getUser);

module.exports = router;
