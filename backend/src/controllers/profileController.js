const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                role: user.role,
                picture: user.profileImage || user.picture,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('❌ GET PROFILE ERROR:', err);
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        console.log('--- STEP 1: Route Hit (Update Profile) ---');
        console.log('User ID:', req.user.id);
        console.log('Request Body:', req.body);

        const { name, phone, location, profileImage } = req.body;

        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (phone) fieldsToUpdate.phone = phone;
        if (location) fieldsToUpdate.location = location;
        if (profileImage) fieldsToUpdate.profileImage = profileImage;

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        if (user) {
            console.log('--- STEP 2: MongoDB Operation Succeeded ---');
            console.log('Updated User Data:', user.name, user.phone, user.location);
        } else {
            console.log('--- STEP 2: MongoDB Operation FAILED (User not found) ---');
        }

        const responseData = {
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                role: user.role,
                picture: user.profileImage || user.picture,
                createdAt: user.createdAt
            }
        };

        console.log('--- STEP 3: Returning HTTP 200 Response ---');
        console.log('Response JSON:', JSON.stringify(responseData));

        res.status(200).json(responseData);
    } catch (err) {
        console.error('❌ UPDATE PROFILE ERROR (Step Failure):', err);
        next(err);
    }
};

// @desc    Update password
// @route   PUT /api/profile/change-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('❌ UPDATE PASSWORD ERROR:', err);
        next(err);
    }
};
