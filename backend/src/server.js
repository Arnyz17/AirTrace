/**
 * server.js
 *
 * Entry point: initialises the database, optionally seeds it, then
 * starts the HTTP server.
 */

'use strict';

const app    = require('./app');
const config = require('./config/env');
const { getDatabase, closeDatabase } = require('./db/database');
const locationVisitRepo = require('./db/repositories/locationVisitRepository');

// ── Initialise database ───────────────────────────────────────────────────────
// getDatabase() creates the connection and applies the schema if it does not
// already exist.  This is safe to call multiple times (idempotent).
getDatabase();

// ── Auto-seed if empty ────────────────────────────────────────────────────────
// On the first run, if the database has no visits, automatically seed it so the
// developer gets working API responses immediately without running npm run seed.
if (locationVisitRepo.count() === 0 && !config.isTest) {
  console.log('\n  🌱 Database is empty — auto-seeding sample data...');
  try {
    const { seedDatabase } = require('./db/seed');
    const result = seedDatabase();
    console.log(`  ✅ Seeded: ${result.visits} visits, ${result.exposureRecords} exposure records\n`);
  } catch (err) {
    console.error('  ⚠️  Auto-seed failed:', err.message);
    console.error('     Run `npm run seed` manually to populate the database.\n');
  }
}

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     AirTrace Backend API v1.1.0      ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  ► Server running at http://localhost:${config.port}`);
  console.log(`  ► Environment  : ${config.nodeEnv}`);
  console.log(`  ► Allowed CORS : ${config.allowedOrigins.join(', ')}`);
  console.log(`  ► API docs     : http://localhost:${config.port}/api/docs`);
  console.log('');
  console.log('  Endpoints:');
  console.log(`    GET  http://localhost:${config.port}/api/health`);
  console.log(`    GET  http://localhost:${config.port}/api/exposure/today`);
  console.log(`    GET  http://localhost:${config.port}/api/exposure/history`);
  console.log(`    GET  http://localhost:${config.port}/api/exposure/2026-09-25`);
  console.log(`    GET  http://localhost:${config.port}/api/locations/2026-09-25`);
  console.log(`    GET  http://localhost:${config.port}/api/aqi/categories`);
  console.log(`    GET  http://localhost:${config.port}/api/aqi/2026-09-25`);
  console.log(`    GET  http://localhost:${config.port}/api/analytics/overview`);
  console.log(`    GET  http://localhost:${config.port}/api/analytics/daily/2026-09-25`);
  console.log(`    POST http://localhost:${config.port}/api/visits`);
  console.log('');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n  Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('  Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = server;
