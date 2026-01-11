const express = require('express');
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    createBranch
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(getEvents)
    .post(protect, authorize('Organizer', 'Admin'), createEvent);

router
    .route('/:id')
    .get(getEvent)
    .put(protect, authorize('Organizer', 'Admin'), updateEvent)
    .delete(protect, authorize('Organizer', 'Admin'), deleteEvent);

router
    .route('/:id/branch')
    .post(protect, authorize('Organizer', 'Admin'), createBranch);

const { addFeedback, getEventFeedback } = require('../controllers/feedbackController');

// ... existing routes

// Feedback Routes
router
    .route('/:eventId/feedback')
    .get(getEventFeedback)
    .post(protect, addFeedback);

module.exports = router;

