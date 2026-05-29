const User = require('../models/User');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['Admin', 'Organizer', 'User'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role. Only Admin, Organizer, or User allowed.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getSystemAnalytics = async (req, res, next) => {
    try {
        const [userCount, eventCount, vendorCount] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Vendor.countDocuments()
        ]);

        // Role distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Event status distribution
        const eventStatus = await Event.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Calculate revenue and expenses
        const events = await Event.find().select('budget ticketTypes');
        let totalIncome = 0;
        let totalExpenses = 0;

        events.forEach(event => {
            if (event.ticketTypes) {
                event.ticketTypes.forEach(type => {
                    totalIncome += (type.sold * type.price);
                });
            }

            if (event.budget && event.budget.expenses) {
                event.budget.expenses.forEach(exp => {
                    totalExpenses += exp.amount;
                });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userCount,
                totalEvents: eventCount,
                totalVendors: vendorCount,
                roleDistribution,
                eventStatus,
                totalIncome,
                totalExpenses,
                profit: totalIncome - totalExpenses
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get audit logs (from event lineage)
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
    try {
        const events = await Event.find()
            .select('title lineage')
            .populate('lineage.modifiedBy', 'name email')
            .sort({ 'lineage.timestamp': -1 })
            .limit(100);

        // Flatten all lineage entries
        const logs = [];
        events.forEach(event => {
            if (event.lineage && event.lineage.length > 0) {
                event.lineage.forEach(entry => {
                    logs.push({
                        eventTitle: event.title,
                        eventId: event._id,
                        timestamp: entry.timestamp,
                        modifiedBy: entry.modifiedBy,
                        action: entry.action,
                        note: entry.note
                    });
                });
            }
        });

        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs.slice(0, 50) // Return top 50
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'email', 'phone', 'location', 'verified'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user activity summary
// @route   GET /api/admin/users/:id/activity
// @access  Private (Admin)
exports.getUserActivity = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Count events organized
        const eventsOrganized = await Event.countDocuments({ organizer: userId });

        // Count events attended (registered)
        const eventsAttended = await Event.countDocuments({ registeredUsers: userId });

        // Check if vendor
        const vendorProfile = await Vendor.findOne({ user: userId });

        res.status(200).json({
            success: true,
            data: {
                eventsOrganized,
                eventsAttended,
                vendorAssignments: vendorProfile?.contracts?.length || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create organizer account (Admin only)
// @route   POST /api/admin/organizers
// @access  Private (Admin)
exports.createOrganizer = async (req, res, next) => {
    try {
        const { name, email, password, organizerContact, organizerLocations, organizerLogo } = req.body;

        // 1. Validate fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide name, email, and password' 
            });
        }

        // 2. Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // 3. Check duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                error: 'Email already exists. Please use a different email.' 
            });
        }

        // 4. Create organizer account
        const organizerData = {
            name,
            email,
            password,
            role: 'Organizer'
        };

        // Add optional fields if provided
        if (organizerContact) organizerData.organizerContact = organizerContact;
        if (organizerLocations && Array.isArray(organizerLocations)) {
            organizerData.organizerLocations = organizerLocations;
        }
        if (organizerLogo) organizerData.organizerLogo = organizerLogo;

        const organizer = await User.create(organizerData);

        // Return organizer details without password
        const responseData = {
            _id: organizer._id,
            name: organizer.name,
            email: organizer.email,
            role: organizer.role,
            organizerLogo: organizer.organizerLogo,
            organizerContact: organizer.organizerContact,
            organizerLocations: organizer.organizerLocations,
            createdAt: organizer.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Organizer account created successfully',
            data: responseData
        });
    } catch (err) {
        next(err);
    }
};
