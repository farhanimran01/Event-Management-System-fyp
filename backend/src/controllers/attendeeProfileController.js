const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get attendee's own profile
// @route   GET /api/attendee/profile
// @access  Private (Attendee only)
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update attendee's own profile
// @route   PUT /api/attendee/profile
// @access  Private (Attendee only)
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, location } = req.body;

        // Validate fields
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (phone) fieldsToUpdate.phone = phone;
        if (location) fieldsToUpdate.location = location;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Change attendee's password
// @route   PUT /api/attendee/change-password
// @access  Private (Attendee only)
exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return next(new ErrorResponse('Please provide both current and new passwords', 400));
        }

        if (newPassword.length < 6) {
            return next(new ErrorResponse('New password must be at least 6 characters', 400));
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Verify old password
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return next(new ErrorResponse('Current password is incorrect', 401));
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        next(err);
    }
};
