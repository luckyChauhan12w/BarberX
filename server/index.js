import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import logger from './src/config/logger.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`, {
                port: PORT,
                environment: process.env.NODE_ENV
            });
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        app.on('error', (error) => {
            logger.error('Server error', {
                error: error.message,
                stack: error.stack
            });
        });
    })
    .catch((error) => {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    });

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});