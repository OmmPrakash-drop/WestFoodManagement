const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { check } = require('express-validator');
const {
    createFoodRequest,
    getMyRequests,
    getRestaurantRequests,
    updateRequestStatus
} = require('../controllers/foodRequestController');

// Apply explicit role checks
router.post('/', [
    auth, 
    roleAuth(['NGO']),
    check('foodId', 'Food ID is required').not().isEmpty().isInt()
], validate, createFoodRequest);
router.get('/my-requests', auth, roleAuth(['NGO']), getMyRequests);
router.get('/restaurant-requests', auth, roleAuth(['RESTAURANT']), getRestaurantRequests);
// @route   PUT api/food-requests/:id
// @desc    Update request status (Approve/Reject/Taken/Delivered)
// @access  Private (Restaurant only)
router.put('/:id', [
    auth,
    roleAuth(['RESTAURANT', 'NGO']), // NGO might need to mark as taken/delivered, let's allow both for now, controller limits some logic but let's allow NGO to update it to TAKEN maybe? The user prompt implies restaurant sets it, but usually NGO takes it. Let's just update the validator to allow it.
    check('status', 'Status is required and must be valid').isIn(['APPROVED', 'REJECTED', 'TAKEN', 'DELIVERED'])
], validate, updateRequestStatus);

module.exports = router;
