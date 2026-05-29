const express = require('express');
const router = express.Router();
const {
    createContactInquiry,
    getContactInquiries,
    markAsRead,
    deleteInquiry
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route - create contact inquiry
router.post('/organizer', createContactInquiry);

// Protected routes - organizer/admin only
router.get('/inquiries', protect, getContactInquiries);
router.put('/inquiries/:id/read', protect, markAsRead);
router.delete('/inquiries/:id', protect, deleteInquiry);

module.exports = router;
