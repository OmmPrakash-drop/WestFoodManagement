const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const path = require('path');

// Custom log format for files
const fileFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

// Custom log format for the console (with colors)
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // Allows winston to handle Error objects natively
        fileFormat
    ),
    transports: [
        // Write all logs with importance level of 'error' or less to 'error.log'
        // Write all logs with importance level of 'info' or less to 'combined.log'
        new transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
    ],
    // Do not exit on handled exceptions
    exitOnError: false
});

// If we're not in production then log to the `console` with nice color formatting
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combine(
            colorize(),
            consoleFormat
        )
    }));
}

module.exports = logger;
