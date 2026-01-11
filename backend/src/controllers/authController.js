const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        console.log("👉 REGISTER REQUEST RECEIVED:", req.body);
        const { name, email, password, role, phone, location } = req.body;

        // 1. Validate fields
        if (!name || !email || !password || !role) {
            console.log("❌ Validation Failed: Missing fields");
            return res.status(400).json({ success: false, error: 'Please provide all required fields (name, email, password, role)' });
        }

        // 2. Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("❌ Registration Failed: Email already exists (Explicit Check)");
            return res.status(409).json({ success: false, message: 'Email already exists', error: 'Email already exists' });
        }

        // 3. Create User (Include phone/location)
        const user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            location
        });

        console.log("✅ User Created Successfully:", user._id);

        // 4. Generate Verification Token
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        // 5. Create Verification URL
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

        const message = `You are receiving this email because you (or someone else) has registered an account with this email address. Please click the link below to verify your email:\n\n ${verifyUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification',
                message,
                html: `<h1>Email Verification</h1><p>Please click the link below to verify your email address:</p><a href="${verifyUrl}">Verify Email</a>`
            });

            return res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.'
            });
        } catch (err) {
            console.error("❌ EMAIL SEND ERROR:", err);
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, error: 'Email could not be sent. Please contact support.' });
        }

    } catch (err) {
        console.error("❌ REGISTER CONTROLLER ERROR:", err);
        // Handle Mongoose duplicate key if race condition
        if (err.code === 11000) {
            console.log("❌ Registration Failed: Email already exists (Mongo Error)");
            return res.status(409).json({ success: false, message: "Email already exists", error: "Email already exists" });
        }
        return res.status(500).json({ success: false, message: "Server Error", error: 'Server Error during registration' });
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

        // Check if verified
        if (!user.verified) {
            return res.status(401).json({ success: false, error: 'Please verify your email address to log in' });
        }

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
