/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error response
    let status = 500;
    let message = 'Internal Server Error';
    let details = undefined;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
        details = err.message;
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
        details = err.message;
    } else if (err.name === 'NotFoundError') {
        status = 404;
        message = 'Not Found';
        details = err.message;
    } else if (err.name === 'ConflictError') {
        status = 409;
        message = 'Conflict';
        details = err.message;
    } else if (err.status) {
        status = err.status;
        message = err.message || message;
    }

    // Don't expose stack traces in production
    const response = {
        error: message,
        message: details || message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(status).json(response);
}

module.exports = errorHandler;
