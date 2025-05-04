const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Specific rate limit for login attempts
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message: 'Too many login attempts from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

// Game action rate limit (for tap actions)
const gameLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 2, // 2 requests per second max
    message: 'Please slow down your game actions',
    standardHeaders: true,
    legacyHeaders: false,
});

const securityMiddleware = {
    // Apply basic security headers
    baseSecurityHeaders: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://toncenter.com", "https://testnet.toncenter.com"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }),

    // Sanitize data
    sanitizeData: [
        // Sanitize request data against NoSQL injection
        mongoSanitize({
            replaceWith: '_',
        }),
        // Clean user input against XSS attacks
        xss(),
        // Prevent HTTP Parameter Pollution
        hpp(),
    ],

    // Rate limiters
    rateLimiters: {
        global: limiter,
        login: loginLimiter,
        game: gameLimiter,
    },

    // Request validation middleware
    validateRequest: (req, res, next) => {
        // Check for suspicious patterns in request
        const suspicious = /[<>{}$]/.test(JSON.stringify(req.body));
        if (suspicious) {
            return res.status(400).json({ 
                error: 'Invalid characters detected in request' 
            });
        }

        // Validate content type
        if (req.method !== 'GET' && !req.is('application/json')) {
            return res.status(415).json({ 
                error: 'Content-Type must be application/json' 
            });
        }

        next();
    },

    // Error handling middleware
    errorHandler: (err, req, res, next) => {
        console.error(err.stack);

        // Handle specific error types
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation Error', 
                details: err.message 
            });
        }

        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({ 
                error: 'Unauthorized Access' 
            });
        }

        // Default error
        res.status(500).json({ 
            error: 'Internal Server Error',
            requestId: req.id // Add request ID for tracking
        });
    }
};

module.exports = securityMiddleware;
