/**
 * database.js
 *
 * SQLite connection singleton using better-sqlite3.
 *
 * better-sqlite3 is synchronous — all operations complete immediately without
 * callbacks or promises.  This keeps the service layer simple (no async/await
 * required) and is appropriate for a local college project with small datasets.
 *
 * A single shared connection is created on the first call to getDatabase() and
 * reused for the lifetime of the process.
 *
 * In test mode (NODE_ENV=test), the database path is ':memory:', which gives
 * each Jest worker process a fresh in-memory database that is discarded when
 * the process exits.
 */

'use strict';

const Database   = require('better-sqlite3');
const config     = require('../config/env');
const { SCHEMA_SQL } = require('./schema');

/** @type {Database.Database | null} */
let _db = null;

/**
 * Return the shared database connection, initialising it on first call.
 *
 * @returns {Database.Database}
 */
function getDatabase() {
  if (_db) return _db;

  _db = new Database(config.databasePath, {
    // Log SQL errors to stderr in development; suppress in test to keep
    // test output clean.
    verbose: config.isDevelopment ? undefined : null,
  });

  // Apply schema (all statements are idempotent due to IF NOT EXISTS)
  _db.exec(SCHEMA_SQL);

  return _db;
}

/**
 * Close the database connection.
 * Called during graceful shutdown and in test teardown.
 */
function closeDatabase() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/**
 * Check whether the database is reachable.
 * Used by the health endpoint.
 *
 * @returns {{ connected: boolean, path: string }}
 */
function checkDatabaseHealth() {
  try {
    const db     = getDatabase();
    const result = db.prepare('SELECT 1 AS ok').get();
    return {
      connected: result.ok === 1,
      path:      config.databasePath,
    };
  } catch (err) {
    return { connected: false, path: config.databasePath, error: err.message };
  }
}

module.exports = { getDatabase, closeDatabase, checkDatabaseHealth };
