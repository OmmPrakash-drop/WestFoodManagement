const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const timeout = require('connect-timeout');
const globalErrorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Request Logging Middleware (Morgan -> Winston)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Global Security Middlewares

// Set secure HTTP headers
app.use(helmet());

// Rate Limiting: Limit requests from same IP to prevent brute-force and DDoS
const limiter = rateLimit({
    max: 150, // Limit each IP to 150 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Middleware
// Request Timeout logic (15 seconds limit)
app.use(timeout('15s'));

// Enable Cross-Origin Resource Sharing (CORS) with strict secure configuration
const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true); // Temporarily allow all origins for local testing
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Accept'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parser, with size limit to prevent payload-based DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Set custom timeout error logic (optional but helpful)
app.use((req, res, next) => {
    if (!req.timedout) next();
});

// Data sanitization against Cross-Site Scripting (XSS)
// xss-clean is deprecated and causes req.query errors in modern express
// app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/food-posts', require('./routes/foodPostRoutes'));
app.use('/api/food-requests', require('./routes/foodRequestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('Food Surplus Redistribution System API is running');
});

// Fallback for unhandled routes
app.use((req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    err.isOperational = true;
    next(err);
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

// Sync Database and Start Server
sequelize.authenticate()
    .then(() => {
        logger.info('Database connected successfully...');
        // Sync models. Use force: false to avoid dropping existing tables
        return sequelize.sync({ force: false });
    })
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error(`Error connecting to database: ${err.message}`, err);
    });
