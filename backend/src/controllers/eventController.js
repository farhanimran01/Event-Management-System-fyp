const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('parentEvent', 'title');
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('parentEvent', 'title');

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (to be implemented)
const createEvent = async (req, res) => {
    try {
        // Handle creation from Template (if templateId is provided in body)
        if (req.body.templateId) {
            const template = await Event.findById(req.body.templateId);
            if (!template) {
                return res.status(404).json({ success: false, error: 'Template not found' });
            }
            // Copy fields from template, override with request body
            const newEventData = {
                ...template.toObject(),
                ...req.body,
                _id: undefined, // Create new ID
                isTemplate: false, // Created instance is not a template by default
                createdAt: undefined,
                updatedAt: undefined,
                lineage: [] // Start fresh lineage
            };
            const event = await Event.create(newEventData);
            return res.status(201).json({ success: true, data: event });
        }

        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Add to lineage before updating
        const changeLog = {
            timestamp: Date.now(),
            modifiedBy: 'System/User', // Replace with actual user ID from auth
            changes: req.body
        };

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
                $push: { lineage: changeLog }
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};
