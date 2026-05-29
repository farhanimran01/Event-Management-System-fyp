const express = require('express');
const {
    bookTicket,
    getMyTickets,
    getEventTickets,
    checkIn,
    getCheckInStatus,
    updatePaymentStatus,
    deleteTicket,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// IMPORTANT: Route order matters! More specific routes MUST come BEFORE generic param routes

// 1. POST routes (create)
router.post('/', protect, bookTicket);

// 2. GET literal routes (no params)
router.get('/my', protect, getMyTickets);
router.get('/me', protect, getMyTickets);

// 3. POST literal routes
router.post('/checkin', protect, authorize('Organizer', 'Admin'), checkIn);

// 4. GET with literal path before ID param
router.get('/event/:eventId', protect, authorize('Organizer', 'Admin'), getEventTickets);
router.get('/checkin/:ticketId', protect, getCheckInStatus);

// 5. PUT/DELETE with specific sub-paths (more specific than just :id)
router.put('/:ticketId/payment-status', protect, authorize('Organizer', 'Admin'), updatePaymentStatus);

// 6. Generic :id routes (LAST - catches DELETE /:id)
router.delete('/:ticketId', protect, authorize('Organizer', 'Admin'), deleteTicket);

module.exports = router;
