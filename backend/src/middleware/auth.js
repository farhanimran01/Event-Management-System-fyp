const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

// Middleware to ensure user is an Organizer
exports.isOrganizer = (req, res, next) => {
    if (req.user.role !== 'Organizer') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. This route is only accessible to Organizers.',
        });
    }
    next();
};

// Middleware to ensure user is a regular User
exports.isUser = (req, res, next) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. This route is only accessible to Users.',
        });
    }
    next();
};

// Middleware to ensure user is an Admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. This route is only accessible to Admins.',
        });
    }
    next();
};
