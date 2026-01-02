import logger from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    const response = {
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        ...(error.errors && error.errors.length > 0 && { errors: error.errors })
    };

    logger.error(`${error.statusCode} - ${error.message}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?._id,
        statusCode: error.statusCode
    });

    if (error.stack) {
        logger.debug('Error stack trace', { stack: error.stack });
    }

    res.status(error.statusCode).json(response);
};