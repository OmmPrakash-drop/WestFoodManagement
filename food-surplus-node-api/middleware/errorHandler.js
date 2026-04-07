const logger = require('../utils/logger');

const globalErrorHandler = (err, req, res, next) => {
    // Log the error for internal backend monitoring into Winston files
    logger.error(`ERROR 💥: ${err.message}`, { stack: err.stack, err });

    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    // Different error response based on environment
    // In production, we don't leak stack traces
    if (isProduction) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(statusCode).json({
                status: 'error',
                msg: err.message
            });
        }
        // Programming or other unknown error: don't leak error details
        logger.error(`Unhandled Rejection/Exception: 💥 ${err.message}`, { stack: err.stack, err });
        return res.status(500).json({
            status: 'error',
            msg: 'Something went very wrong!'
        });
    }

    // Development environment gets full stack traces
    res.status(statusCode).json({
        status: 'error',
        error: err,
        msg: err.message,
        stack: err.stack
    });
};

module.exports = globalErrorHandler;
