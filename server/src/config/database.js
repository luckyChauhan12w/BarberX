import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
    try {
        logger.info('Attempting to connect to MongoDB...');
        logger.databaseLogger.info('MongoDB connection attempt', {
            timestamp: new Date().toISOString()
        });

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        logger.info('MongoDB connected successfully', {
            host: conn.connection.host,
            database: conn.connection.name
        });
        logger.databaseLogger.info('MongoDB connected', {
            host: conn.connection.host,
            database: conn.connection.name,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('MongoDB connection failed', {
            error: error.message,
            stack: error.stack
        });
        logger.databaseLogger.error('MongoDB connection error', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
    logger.databaseLogger.error('MongoDB error', {
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    logger.databaseLogger.warn('MongoDB disconnected', {
        timestamp: new Date().toISOString()
    });
});

export default connectDB;
