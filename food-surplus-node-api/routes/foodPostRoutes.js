const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { check } = require('express-validator');
const {
    createFoodPost,
    getAllFoodPosts,
    getMyFoodPosts,
    deleteFoodPost
} = require('../controllers/foodPostController');

// All routes are protected by JWT, and specific endpoints are protected by RBAC
router.post('/', [
    auth, 
    roleAuth(['RESTAURANT']),
    check('foodName', 'Food name is required').not().isEmpty(),
    check('quantity', 'Quantity must be a positive number').isFloat({ min: 0.1 }),
    check('quantityUnit', 'Quantity unit is required').not().isEmpty(),
    check('pickupTime', 'Valid pickup time is required').isISO8601()
], validate, createFoodPost);
router.get('/', auth, roleAuth(['NGO', 'ADMIN']), getAllFoodPosts); // Usually NGOs check for available food
router.get('/my-posts', auth, roleAuth(['RESTAURANT']), getMyFoodPosts);
router.delete('/:id', auth, roleAuth(['RESTAURANT', 'ADMIN']), deleteFoodPost);

module.exports = router;
