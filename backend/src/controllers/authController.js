const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const ErrorResponse = require('../utils/ErrorResponse');
const Logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        Logger.request(req);
        const { name, email, password, phone, location, role } = req.body;

        // 1. Validate fields
        if (!name || !email || !password) {
            Logger.warn('Registration validation failed: Missing required fields');
            return next(new ErrorResponse('Please provide all required fields (name, email, password)', 400));
        }

        // 2. Validate role
        const validRoles = ['Admin', 'Organizer', 'User'];
        const userRole = role && validRoles.includes(role) ? role : 'User';

        // 3. Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            Logger.warn('Registration failed: Email already exists', { email });
            return next(new ErrorResponse('This email is already registered. Please use a different email or log in.', 409));
        }

        // 4. Create User with selected role
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            phone,
            location
        });

        Logger.success('User registered successfully', { userId: user._id, role: user.role });

        // 5. Automatically authenticate the user after registration
        sendTokenResponse(user, 201, res);

    } catch (err) {
        Logger.error('Registration error', err);
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate emil & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if verified (Bypassed)
        // if (!user.verified) {
        //     return res.status(401).json({ success: false, error: 'Please verify your email address to log in' });
        // }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture || user.profileImage,
                phone: user.phone,
                location: user.location,
                createdAt: user.createdAt
            },
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000), // 10 seconds
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        // Hash token from URL
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
        }

        // Set verified to true
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });
    } catch (err) {
        next(err);
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
                role: user.role,
                picture: user.picture || user.profileImage,
                phone: user.phone,
                location: user.location
            }
        });
};
