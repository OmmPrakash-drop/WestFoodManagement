const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { getPendingVerifications, updateVerificationStatus, getAllEntities, deleteUser } = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { param, body } = require('express-validator');

// Both routes protected specifically for ADMIN role
router.get('/verifications', auth, roleAuth(['ADMIN']), getPendingVerifications);
router.get('/entities', auth, roleAuth(['ADMIN']), getAllEntities);
router.delete('/user/:id', auth, roleAuth(['ADMIN']), deleteUser);

router.put('/verify/:type/:id', [
    auth, 
    roleAuth(['ADMIN']),
    param('type').isIn(['restaurant', 'ngo']),
    param('id').isInt(),
    body('status').isIn(['APPROVED', 'REJECTED', 'REVERTED'])
], validate, updateVerificationStatus);

module.exports = router;
