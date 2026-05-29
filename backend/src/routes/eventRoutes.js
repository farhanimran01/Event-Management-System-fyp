const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getOrganizerEvents,
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    createBranch,
    addExpense,
    manageVendorStatus,
    getOrganizerStats,
    getEventBranches,
    removeVendor,
    getVendorEvents
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

// Get organizer's events
router.get('/organizer', protect, authorize('Organizer', 'Admin'), getOrganizerEvents);

router
    .route('/')
    .get(getEvents)
    .post(protect, authorize('Organizer', 'Admin'), createEvent);

router.get('/stats/overview', protect, authorize('Organizer', 'Admin'), getOrganizerStats);

router
    .route('/:id')
    .get(getEvent)
    .put(protect, authorize('Organizer', 'Admin'), updateEvent)
    .delete(protect, authorize('Organizer', 'Admin'), deleteEvent);

router
    .route('/:id/branch')
    .post(protect, authorize('Organizer', 'Admin'), createBranch);

router.get('/:id/branches', protect, authorize('Organizer', 'Admin'), getEventBranches);

router
    .route('/:id/budget/expenses')
    .post(protect, authorize('Organizer', 'Admin'), addExpense);

router
    .route('/:id/vendors/manage')
    .post(protect, authorize('Organizer', 'Admin'), manageVendorStatus);

router
    .route('/:id/vendors/:vendorId')
    .delete(protect, authorize('Organizer', 'Admin'), removeVendor);

// Specific route for vendors to see their events
router.get('/assigned/me', protect, authorize('Vendor'), getVendorEvents);

const { submitFeedback, getEventFeedback } = require('../controllers/feedbackController');

// ... existing routes

// Feedback Routes
router
    .route('/:eventId/feedback')
    .get(getEventFeedback)
    .post(protect, submitFeedback);

module.exports = router;

