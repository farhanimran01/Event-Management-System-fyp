const mongoose = require('mongoose');
const Event = require('../models/Event');

// @desc    Get events created by the current organizer
// @route   GET /api/events/organizer
// @access  Private (Organizer)
exports.getOrganizerEvents = async (req, res, next) => {
    try {
        const events = await Event.find({ organizer: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get organizer stats (Total events, tickets sold, revenue)
// @route   GET /api/events/stats/overview
// @access  Private (Organizer)
exports.getOrganizerStats = async (req, res, next) => {
    try {
        const stats = await Event.aggregate([
            {
                $match: { organizer: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    totalRevenue: { $sum: '$budget.total' },
                    totalTicketsSold: {
                        $sum: {
                            $sum: '$ticketTypes.sold'
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || { totalEvents: 0, totalRevenue: 0, totalTicketsSold: 0 }
        });
    } catch (err) {
        next(err);
    }
};

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

        let finalQuery = JSON.parse(queryStr);

        // Handle title search
        if (req.query.search) {
            finalQuery.title = { $regex: req.query.search, $options: 'i' };
        }

        // Finding resource
        query = Event.find(finalQuery).populate('organizer', 'name email');

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
// @desc    Get branches for an event
// @route   GET /api/events/:id/branches
// @access  Private (Organizer)
exports.getEventBranches = async (req, res, next) => {
    try {
        const branches = await Event.find({ parentEvent: req.params.id });

        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
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

        // Check for active branches
        const branchCount = await Event.countDocuments({ parentEvent: req.params.id });
        if (branchCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete event with active branches. Please delete branches first.'
            });
        }

        await event.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @route   POST /api/events/:id/budget/expenses
// @access  Private (Organizer/Admin)
exports.addExpense = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const { title, amount, category } = req.body;
        event.budget.expenses.push({ title, amount, category });

        // Update lineage
        event.lineage.push({
            modifiedBy: req.user.id,
            action: 'UPDATED',
            note: `Added expense: ${title}`
        });

        await event.save();

        res.status(200).json({ success: true, data: event.budget });
    } catch (err) {
        next(err);
    }
};

// @desc    Manage vendor status for event
// @route   POST /api/events/:id/vendors/manage
// @access  Private (Organizer/Admin)
exports.manageVendorStatus = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const { vendorId, role, status } = req.body;

        const vendorIndex = event.vendors.findIndex(v => v.vendorId.toString() === vendorId);

        if (vendorIndex > -1) {
            if (status) event.vendors[vendorIndex].status = status;
            if (role) event.vendors[vendorIndex].role = role;
        } else {
            event.vendors.push({ vendorId, role, status });
        }

        // Update lineage
        event.lineage.push({
            modifiedBy: req.user.id,
            action: 'UPDATED',
            note: `Updated vendor: ${vendorId}`
        });

        await event.save();

        res.status(200).json({ success: true, data: event.vendors });
    } catch (err) {
        next(err);
    }
};

// @desc    Remove vendor from event
// @route   DELETE /api/events/:id/vendors/:vendorId
// @access  Private (Organizer/Admin)
exports.removeVendor = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        event.vendors = event.vendors.filter(v => v.vendorId.toString() !== req.params.vendorId);

        // Update lineage
        event.lineage.push({
            modifiedBy: req.user.id,
            action: 'UPDATED',
            note: `Removed vendor: ${req.params.vendorId}`
        });

        await event.save();

        res.status(200).json({ success: true, data: event.vendors });
    } catch (err) {
        next(err);
    }
};

// @desc    Get events assigned to vendor
// @route   GET /api/events/assigned/me
// @access  Private (Vendor)
exports.getVendorEvents = async (req, res, next) => {
    try {
        const events = await Event.find({ "vendors.vendorId": req.user.id })
            .populate('organizer', 'name email')
            .select('title date location status vendors');

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        next(err);
    }
};
