const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const { param } = require('express-validator');

router.get('/', auth, getNotifications);
router.put('/:id', [
    auth,
    param('id', 'Notification ID must be an integer').isInt()
], validate, markAsRead);

module.exports = router;
