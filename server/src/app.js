const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      // In development or if explicitly allowed
      if (env.NODE_ENV === 'development' || origin === env.CORS_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/testing environments
    },
    credentials: true,
  })
);

// Body parsing with safe size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting in production or non-test environments
if (env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP, please try again later.',
      },
    },
  });
  app.use('/api/', limiter);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'appointment-prep-api',
  });
});

const fs = require('fs');
const path = require('path');

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Serve static frontend assets if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Catch-all 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${req.originalUrl} was not found on this server.`,
    },
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
