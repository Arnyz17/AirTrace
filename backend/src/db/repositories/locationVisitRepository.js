/**
 * locationVisitRepository.js
 *
 * Data-access layer for the location_visits table.
 *
 * All functions use better-sqlite3 prepared statements for both performance
 * (the DB reuses the compiled query plan) and safety (no string interpolation,
 * so SQL injection is not possible).
 *
 * Naming convention:
 *   - snake_case columns   → camelCase JavaScript properties
 *   - All public functions return plain JS objects (not class instances)
 */

'use strict';

const { getDatabase } = require('../database');

// ── Row → Object mapping ─────────────────────────────────────────────────────

/**
 * Map a raw database row to a LocationVisit plain object.
 *
 * @param {object} row - Raw row from the DB.
 * @returns {object}   - LocationVisit plain object.
 */
function mapRow(row) {
  return {
    id:              row.id,
    locationName:    row.location_name,
    latitude:        row.latitude,
    longitude:       row.longitude,
    startTime:       row.start_time,
    endTime:         row.end_time,
    durationMinutes: row.duration_minutes,
    date:            row.date,
    aqi:             row.aqi,
    aqiCategory:     row.aqi_category,
  };
}

// ── Read operations ───────────────────────────────────────────────────────────

/**
 * Return all location visits for a specific date, ordered chronologically.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {object[]}  - Array of LocationVisit objects.
 */
function findByDate(date) {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM location_visits WHERE date = ? ORDER BY start_time ASC'
  );
  return stmt.all(date).map(mapRow);
}

/**
 * Return all distinct dates that have at least one visit, sorted ascending.
 *
 * @returns {string[]} - Array of YYYY-MM-DD strings.
 */
function getAvailableDates() {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT DISTINCT date FROM location_visits ORDER BY date ASC'
  );
  return stmt.all().map((row) => row.date);
}

/**
 * Find a single visit by its ID.
 *
 * @param {string} id
 * @returns {object | null}
 */
function findById(id) {
  const db   = getDatabase();
  const stmt = db.prepare('SELECT * FROM location_visits WHERE id = ?');
  const row  = stmt.get(id);
  return row ? mapRow(row) : null;
}

/**
 * Return the total number of visits in the table.
 *
 * @returns {number}
 */
function count() {
  const db   = getDatabase();
  const row  = db.prepare('SELECT COUNT(*) AS n FROM location_visits').get();
  return row.n;
}

// ── Write operations ──────────────────────────────────────────────────────────

/**
 * Insert a new location visit record.
 *
 * @param {object} visit - LocationVisit plain object.
 * @returns {object}     - The inserted visit (same as input).
 */
function insert(visit) {
  const db   = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO location_visits
      (id, location_name, latitude, longitude,
       start_time, end_time, duration_minutes, date,
       aqi, aqi_category)
    VALUES
      (@id, @locationName, @latitude, @longitude,
       @startTime, @endTime, @durationMinutes, @date,
       @aqi, @aqiCategory)
  `);
  stmt.run(visit);
  return visit;
}

/**
 * Delete all rows from location_visits.
 * Used during seeding and test setup.
 */
function deleteAll() {
  getDatabase().prepare('DELETE FROM location_visits').run();
}

module.exports = {
  findByDate,
  getAvailableDates,
  findById,
  count,
  insert,
  deleteAll,
};
