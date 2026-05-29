class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Marks this as an expected operational error

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorResponse;
