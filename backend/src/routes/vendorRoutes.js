const express = require('express');
const { getVendors, updateVendorProfile, getMe, addContract } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getVendors);
router.post('/', protect, authorize('Vendor'), updateVendorProfile);
router.get('/me', protect, authorize('Vendor'), getMe);
router.post('/:id/contract', protect, authorize('Organizer', 'Admin'), addContract);

module.exports = router;
