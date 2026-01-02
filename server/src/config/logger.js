import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(logColors);

const fileLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }

        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

const jsonLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        let log = `${timestamp} ${level}: ${message}`;
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    })
);

const allLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'all-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const errorLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const warnLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'warn-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const infoLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'info-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const httpLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'http-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileLogFormat,
});

const debugLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'debug',
    maxSize: '20m',
    maxFiles: '7d',
    format: fileLogFormat,
});

const jsonLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'json-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: jsonLogFormat,
});

const authLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'auth-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const databaseLogsRotate = new DailyRotateFile({
    dirname: logsDir,
    filename: 'database-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileLogFormat,
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    levels: logLevels,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
        allLogsRotate,
        errorLogsRotate,
        warnLogsRotate,
        infoLogsRotate,
        httpLogsRotate,
        debugLogsRotate,
        jsonLogsRotate,
    ],
    exceptionHandlers: [
        new DailyRotateFile({
            dirname: logsDir,
            filename: 'exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            format: fileLogFormat,
        }),
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            dirname: logsDir,
            filename: 'rejections-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            format: fileLogFormat,
        }),
    ],
});

const authLogger = winston.createLogger({
    level: 'info',
    format: fileLogFormat,
    transports: [authLogsRotate],
});

const databaseLogger = winston.createLogger({
    level: 'info',
    format: fileLogFormat,
    transports: [databaseLogsRotate],
});

logger.authLogger = authLogger;
logger.databaseLogger = databaseLogger;

export default logger;