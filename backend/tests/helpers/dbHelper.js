/**
 * dbHelper.js
 *
 * Test database setup utilities.
 *
 * Because Jest runs tests with NODE_ENV=test, the database module automatically
 * uses ':memory:' (a fresh in-memory SQLite database per process).
 *
 * When --runInBand is used (tests run sequentially in one process), the
 * in-memory database singleton is shared across all test files.  To prevent
 * state leaking between test suites, each integration/db test file calls
 * setupTestDb() in its beforeAll hook, which clears and re-seeds the database.
 */

'use strict';

// Setting NODE_ENV before importing any module ensures the database module
// picks up ':memory:' as the database path.
process.env.NODE_ENV = 'test';

const { getDatabase }    = require('../../src/db/database');
const { seedDatabase }   = require('../../src/db/seed');
const locationVisitRepo  = require('../../src/db/repositories/locationVisitRepository');
const aqiReadingRepo     = require('../../src/db/repositories/aqiReadingRepository');
const exposureRecordRepo = require('../../src/db/repositories/exposureRecordRepository');

/**
 * Set up the test database:
 *   1. Ensure the schema exists (idempotent via getDatabase()).
 *   2. Clear all tables in dependency order.
 *   3. Seed with the standard mock data.
 *
 * Call this in beforeAll() for every integration and database test suite.
 */
function setupTestDb() {
  getDatabase();          // ensure schema is applied
  clearTestDb();          // remove any residual data from previous test suite
  seedDatabase();         // insert deterministic sample data
}

/**
 * Delete all rows from all tables in dependency order (foreign keys respected).
 */
function clearTestDb() {
  exposureRecordRepo.deleteAll();
  aqiReadingRepo.deleteAll();
  locationVisitRepo.deleteAll();
}

module.exports = { setupTestDb, clearTestDb };
