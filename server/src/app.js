import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import serviceRoutes from './routes/service.routes.js';
import { morganMiddleware } from './middlewares/logging/morgan.middleware.js';
import { errorHandler } from './middlewares/error/error.middleware.js';
import logger from './config/logger.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

app.use(morganMiddleware);

app.use('/api/auth', authRoutes);

app.use('/api/services', serviceRoutes);



app.get('/health', (req, res) => {
    logger.info('Health check endpoint accessed');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use((req, res) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.originalUrl
    });
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason: reason,
        promise: promise
    });
});

export default app;