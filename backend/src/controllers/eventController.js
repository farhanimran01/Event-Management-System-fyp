const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Event.find(JSON.parse(queryStr)).populate('organizer', 'name email');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Event.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const events = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: events.length,
            pagination,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({ success: false, error: `Event not found with id of ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer)
exports.createEvent = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.organizer = req.user.id;

        const event = await Event.create(req.body);

        // Update lineage
        event.lineage.push({
            modifiedBy: req.user.id,
            action: 'CREATED',
            note: 'Event created'
        });
        await event.save();

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create event branch
// @route   POST /api/events/:id/branch
// @access  Private (Organizer)
exports.createBranch = async (req, res, next) => {
    try {
        const parentEvent = await Event.findById(req.params.id);

        if (!parentEvent) {
            return res.status(404).json({ success: false, error: `Event not found with id of ${req.params.id}` });
        }

        // Make sure user is event organizer
        if (parentEvent.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: `User ${req.user.id} is not authorized to branch this event` });
        }

        // Clone event data
        const eventData = parentEvent.toObject();
        delete eventData._id;
        delete eventData.createdAt;
        delete eventData.updatedAt;

        eventData.isBranch = true;
        eventData.parentEvent = parentEvent._id;
        eventData.branchName = req.body.branchName || `Branch of ${parentEvent.title}`;
        eventData.lineage = [{
            modifiedBy: req.user.id,
            action: 'BRANCHED',
            note: `Branched from event ${parentEvent._id}`
        }];

        const branch = await Event.create(eventData);

        res.status(201).json({
            success: true,
            data: branch
        });

    } catch (err) {
        next(err);
    }
};


// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: `Event not found with id of ${req.params.id}` });
        }

        // Make sure user is event organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: `User ${req.user.id} is not authorized to update this event` });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Update Lineage (manual push needed for update if not using a different pattern, doing it simply here)
        event.lineage.push({
            modifiedBy: req.user.id,
            action: 'UPDATED',
            note: 'Event details updated'
        });
        await event.save();

        res.status(200).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: `Event not found with id of ${req.params.id}` });
        }

        // Make sure user is event organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: `User ${req.user.id} is not authorized to delete this event` });
        }

        await event.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
