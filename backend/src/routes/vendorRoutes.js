const express = require('express');
const {
    getVendors,
    updateVendorProfile,
    getMe,
    addContract,
    getAssignedEvents,
    updateAvailability,
    updateTaskStatus
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getVendors);
router.post('/', protect, authorize('Vendor'), updateVendorProfile);
router.get('/me', protect, authorize('Vendor'), getMe);
router.get('/assignments', protect, authorize('Vendor'), getAssignedEvents);
router.put('/availability', protect, authorize('Vendor'), updateAvailability);
router.put('/tasks/:eventId/:taskId', protect, authorize('Vendor'), updateTaskStatus);
router.post('/:id/contract', protect, authorize('Organizer', 'Admin'), addContract);

module.exports = router;
