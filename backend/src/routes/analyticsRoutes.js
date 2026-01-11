const express = require('express');
const { getAdminAnalytics, getOrganizerAnalytics } = require('../controllers/budgetController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', protect, authorize('Admin'), getAdminAnalytics);
router.get('/organizer', protect, authorize('Organizer', 'Admin'), getOrganizerAnalytics);

module.exports = router;
