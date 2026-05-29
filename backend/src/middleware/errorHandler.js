const ErrorResponse = require('../utils/ErrorResponse');
const Logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error with full context
    Logger.error('Error Handler Triggered', err, {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        statusCode: err.statusCode,
        params: req.params,
        body: req.body
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with ID: ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `This ${field} is already registered. Please use a different ${field}.`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = new ErrorResponse(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid authentication token. Please log in again.';
        error = new ErrorResponse(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your session has expired. Please log in again.';
        error = new ErrorResponse(message, 401);
    }

    // MongoDB connection errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
        const message = 'Database connection failed. Please try again later.';
        error = new ErrorResponse(message, 503);
    }

    // Send response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'An unexpected server error occurred. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
