/**
 * app.js
 *
 * Express application factory.
 *
 * Registers middleware, routes, and error handlers.
 * Does NOT call app.listen() — that is handled in server.js so this module
 * can be imported cleanly by Supertest in integration tests.
 */

'use strict';

const express       = require('express');
const cors          = require('cors');
const swaggerUi     = require('swagger-ui-express');
const config        = require('./config/env');
const { openApiSpec } = require('./swagger/openapi');
const { errorHandler } = require('./middleware/errorHandler');
const { ERROR_CODES }  = require('./errors/errorCodes');

// ── Route modules ─────────────────────────────────────────────────────────────
const healthRoutes    = require('./routes/health');
const exposureRoutes  = require('./routes/exposure');
const locationRoutes  = require('./routes/locations');
const aqiRoutes       = require('./routes/aqi');
const analyticsRoutes = require('./routes/analytics');
const visitsRoutes    = require('./routes/visits');

const app = express();

// ── Core middleware ───────────────────────────────────────────────────────────

app.use(cors({
  origin:      config.allowedOrigins,
  methods:     ['GET', 'POST'],
  credentials: false,
}));

// Parse JSON bodies.  This middleware throws a SyntaxError on malformed JSON,
// which is caught by errorHandler and returned as a structured 400 response.
app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────────────────────
// Serves interactive API documentation at /api/docs.
// The frontend developer can explore endpoints and run live requests.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'AirTrace API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// ── Root info endpoint ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service:  'AirTrace Backend API',
    version:  '1.1.0',
    docs:     'http://localhost:3001/api/docs',
    endpoints: [
      'GET  /api/health',
      'GET  /api/exposure/today',
      'GET  /api/exposure/history',
      'GET  /api/exposure/:date',
      'GET  /api/locations/:date',
      'GET  /api/aqi/categories',
      'GET  /api/aqi/:date',
      'GET  /api/analytics/overview',
      'GET  /api/analytics/daily/:date',
      'POST /api/visits',
      'GET  /api/docs',
    ],
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
//
// Route ordering is important:
//   - Literal paths ('today', 'history', 'categories', 'overview') MUST be
//     registered before parameterized paths ('/:date') so Express does not
//     treat them as parameter values.
//   - This is enforced within each route module, and within the order below.

app.use('/api/health',     healthRoutes);
app.use('/api/exposure',   exposureRoutes);
app.use('/api/locations',  locationRoutes);
app.use('/api/aqi',        aqiRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/visits',     visitsRoutes);

// ── 404 — unknown routes ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code:    ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route "${req.method} ${req.path}" does not exist.`,
      status:  404,
      hint:    'Check GET / for a list of available endpoints, or visit GET /api/docs.',
    },
  });
});

// ── Centralized error handler ─────────────────────────────────────────────────
// Must be registered LAST (4-param Express middleware)
app.use(errorHandler);

module.exports = app;
