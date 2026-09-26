/**
 * healthController.js
 *
 * Handles GET /api/health
 *
 * Returns a status payload that confirms the backend is running, reports the
 * runtime environment, and checks database connectivity.
 */

'use strict';

const { sendSuccess }       = require('../utils/responseHelpers');
const { checkDatabaseHealth } = require('../db/database');

/**
 * GET /api/health
 *
 * Response: { success: true, data: { status, uptime, timestamp, version, database } }
 */
function getHealth(req, res) {
  const dbHealth = checkDatabaseHealth();

  sendSuccess(res, {
    status:    'ok',
    uptime:    Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version:   '1.1.0',
    service:   'AirTrace Backend API',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbHealth.connected,
      // Omit full path in production to avoid info leakage
      path: process.env.NODE_ENV === 'production'
        ? '[configured]'
        : dbHealth.path,
    },
  });
}

module.exports = { getHealth };
