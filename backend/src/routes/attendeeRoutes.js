const express = require('express');
const {
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/attendeeProfileController');
const { protect, isUser } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');

const router = express.Router();

// @desc    Get attendee dashboard
// @route   GET /api/attendee/dashboard
// @access  Private (Attendee only)
router.get('/dashboard', protect, isUser, async (req, res) => {
    try {
        const registrations = await Registration.countDocuments({ attendee: req.user.id });
        res.status(200).json({
            success: true,
            message: 'Welcome to Attendee Dashboard',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    phone: req.user.phone,
                    location: req.user.location
                },
                stats: {
                    eventsRegistered: registrations,
                    upcomingEvents: 0,
                    pastEvents: 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to load dashboard' });
    }
});

// @desc    Get attendee's registered events
// @route   GET /api/attendee/my-events
// @access  Private (Attendee only)
router.get('/my-events', protect, isUser, async (req, res) => {
    try {
        const registrations = await Registration.find({ attendee: req.user.id })
            .populate('event', 'title date location status');
        res.status(200).json({
            success: true,
            data: { events: registrations, total: registrations.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve events' });
    }
});

// @desc    Get attendee's tickets
// @route   GET /api/attendee/my-tickets
// @access  Private (Attendee only)
router.get('/my-tickets', protect, isUser, async (req, res) => {
    try {
        const tickets = await Ticket.find({ attendee: req.user.id })
            .populate('event', 'title date location');
        res.status(200).json({
            success: true,
            data: { tickets, total: tickets.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve tickets' });
    }
});

// @desc    Get attendee profile
// @route   GET /api/attendee/profile
// @access  Private (Attendee only)
router.get('/profile', protect, isUser, getProfile);

// @desc    Update attendee profile
// @route   PUT /api/attendee/profile
// @access  Private (Attendee only)
router.put('/profile', protect, isUser, updateProfile);

// @desc    Change attendee password
// @route   PUT /api/attendee/change-password
// @access  Private (Attendee only)
router.put('/change-password', protect, isUser, changePassword);

module.exports = router;
