const Feedback = require('../models/Feedback');
const Event = require('../models/Event');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Attendee)
exports.submitFeedback = async (req, res, next) => {
    try {
        const { eventId, rating, comment } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Check if event is completed (In a real app, you might want to wait)
        // For this module, we allow it for any event the user might have attended.

        const feedback = await Feedback.create({
            event: eventId,
            user: req.user.id,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'You have already submitted feedback for this event' });
        }
        next(err);
    }
};

// @desc    Get feedback for an event
// @route   GET /api/feedback/event/:eventId
// @access  Public
exports.getEventFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.find({ event: req.params.eventId }).populate('user', 'name picture');

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (err) {
        next(err);
    }
};
