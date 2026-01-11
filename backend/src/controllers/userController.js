const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Google login/register
// @route   POST /api/users/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
    try {
        const { email, name, picture, googleId } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, error: 'Please provide email and googleId' });
        }

        // 1. Check if user exists by googleId
        let user = await User.findOne({ googleId });

        // 2. If not found by googleId, check by email
        if (!user) {
            user = await User.findOne({ email });

            if (user) {
                // Link account if email matches
                user.googleId = googleId;
                if (!user.picture) user.picture = picture;
                user.verified = true;
                await user.save();
            }
        }

        // 3. If still no user, create a new one
        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                picture,
                verified: true,
                role: 'Attendee' // Default role
            });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error("❌ GOOGLE LOGIN ERROR:", err);
        res.status(500).json({ success: false, error: 'Server Error during Google Login' });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};
