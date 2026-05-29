const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.find().populate('user', 'name email location phone');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create/Update Vendor Profile
// @route   POST /api/vendors
// @access  Private (Vendor)
exports.updateVendorProfile = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // Upsert
        const vendor = await Vendor.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Vendor Profile (Me)
// @route   GET /api/vendors/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email');

        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor profile not found' });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get assigned events and schedules
// @route   GET /api/vendors/assignments
// @access  Private (Vendor)
exports.getAssignedEvents = async (req, res, next) => {
    try {
        // Find events where this user is listed as a vendor
        const events = await Event.find({
            'vendors.vendorId': req.user.id
        }).populate('organizer', 'name email');

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Vendor Availability
// @route   PUT /api/vendors/availability
// @access  Private (Vendor)
exports.updateAvailability = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user.id });

        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor profile not found' });
        }

        // Expecting an array of { date, status, note }
        vendor.availability = req.body.availability;
        await vendor.save();

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update task status (Vendor)
// @route   PUT /api/vendors/tasks/:eventId/:taskId
// @access  Private (Vendor)
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        const task = event.tasks.id(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Check if task is assigned to this vendor
        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Task not assigned to you' });
        }

        task.status = req.body.status;
        await event.save();

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add contract to vendor (Organizer)
// @route   POST /api/vendors/:id/contract
// @access  Private (Organizer)
exports.addContract = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const contract = {
            event: req.body.eventId,
            amount: req.body.amount,
            terms: req.body.terms,
            status: 'Draft'
        };

        vendor.contracts.push(contract);
        await vendor.save();

        res.status(200).json({
            success: true,
            data: vendor
        });

    } catch (err) {
        next(err);
    }
};
