/**
 * env.js
 *
 * Loads environment variables from .env (if present) and exports typed,
 * validated configuration values used throughout the application.
 *
 * The backend works entirely without a .env file — all values have sensible
 * defaults appropriate for local development.
 */

'use strict';

const path = require('path');
require('dotenv').config();

/**
 * Parse and deduplicate FRONTEND_URL, which may be a comma-separated list of
 * allowed origins (e.g. "http://localhost:3000,http://localhost:5173").
 *
 * @returns {string[]} Array of allowed origin strings.
 */
function parseFrontendOrigins() {
  const raw = process.env.FRONTEND_URL ||
    'http://localhost:3000,http://localhost:5173,http://localhost:5174';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

/**
 * Resolve the SQLite database path.
 *
 * In test mode (NODE_ENV=test) always uses ':memory:' so tests do not write
 * to disk and each test run starts with a clean slate.
 *
 * @returns {string} Database path or ':memory:'.
 */
function resolveDatabasePath() {
  if (process.env.NODE_ENV === 'test') return ':memory:';
  const raw = process.env.DATABASE_PATH || './data/airtrace.db';
  // Resolve relative to the project root (backend/), not the CWD
  return path.isAbsolute(raw) ? raw : path.resolve(__dirname, '../../', raw);
}

const config = {
  /** TCP port the Express server will listen on. */
  port: parseInt(process.env.PORT, 10) || 3001,

  /** Runtime environment.  Affects error verbosity and logging. */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** List of origins the CORS middleware will allow. */
  allowedOrigins: parseFrontendOrigins(),

  /**
   * Resolved path to the SQLite database file.
   * ':memory:' in test mode.
   */
  databasePath: resolveDatabasePath(),

  /** Whether detailed internal errors are included in API responses. */
  get isDevelopment() {
    return this.nodeEnv === 'development';
  },

  get isTest() {
    return this.nodeEnv === 'test';
  },
};

module.exports = config;
