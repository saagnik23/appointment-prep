const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const cookieParser = require('cookie-parser');
const verifyCsrf = require('./middleware/csrf');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const assistantRoutes = require('./modules/assistant/assistant.routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration with explicit allowlist
const allowedOrigins = (env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Deliberate development allowlist
if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
  if (!allowedOrigins.includes('http://localhost:5173')) allowedOrigins.push('http://localhost:5173');
  if (!allowedOrigins.includes('http://127.0.0.1:5173')) allowedOrigins.push('http://127.0.0.1:5173');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permit requests with no Origin header (e.g. mobile apps, curl, internal/same-origin)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsError = new Error('Cross-Origin Request Blocked: Origin is not permitted.');
      corsError.statusCode = 403;
      corsError.code = 'FORBIDDEN';
      return callback(corsError, false);
    },
    credentials: true,
  })
);

// Cookie parsing
app.use(cookieParser());

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

// Health check endpoint (Liveness probe)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'appointment-prep-api',
  });
});

// Readiness probe
app.get('/ready', (req, res) => {
  const ready = db.isDBConnected();
  if (ready) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(503).json({
    status: 'not_ready',
    database: 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

const fs = require('fs');
const path = require('path');

// CSRF validation for state-changing requests using cookie authentication
app.use(verifyCsrf);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/assistant', assistantRoutes);

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
