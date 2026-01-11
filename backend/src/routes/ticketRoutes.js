const express = require('express');
const {
    bookTicket,
    getMyTickets,
    getEventTickets,
    checkIn,
    getCheckInStatus,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.post('/', protect, bookTicket);
router.get('/me', protect, getMyTickets);
router.post('/checkin', protect, authorize('Organizer', 'Admin'), checkIn);
router.get('/checkin/:ticketId', protect, getCheckInStatus);
router.get('/event/:eventId', protect, authorize('Organizer', 'Admin'), getEventTickets);

module.exports = router;
