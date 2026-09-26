/**
 * exposureRecordRepository.js
 *
 * Data-access layer for the exposure_records table.
 *
 * The exposure_records table stores pre-computed Exposure Index values
 * (AQI × durationMinutes) so that the API can return results without
 * re-running the calculation on every request.
 */

'use strict';

const { getDatabase } = require('../database');

// ── Row → Object mapping ─────────────────────────────────────────────────────

/**
 * Map a raw DB row to an ExposureRecord plain object (camelCase fields).
 *
 * @param {object} row
 * @returns {object}
 */
function mapRow(row) {
  return {
    id:              row.id,
    visitId:         row.visit_id,
    locationName:    row.location_name,
    latitude:        row.latitude,
    longitude:       row.longitude,
    date:            row.date,
    startTime:       row.start_time,
    endTime:         row.end_time,
    durationMinutes: row.duration_minutes,
    aqi:             row.aqi,
    category:        row.category,
    exposure:        row.exposure,
  };
}

// ── Read operations ───────────────────────────────────────────────────────────

/**
 * Return all exposure records for a specific date, ordered chronologically.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {object[]}  - Array of ExposureRecord objects.
 */
function findByDate(date) {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM exposure_records WHERE date = ? ORDER BY start_time ASC'
  );
  return stmt.all(date).map(mapRow);
}

/**
 * Return all exposure records across all dates.
 * Used by the analytics service for aggregate calculations.
 *
 * @returns {object[]}
 */
function findAll() {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM exposure_records ORDER BY date ASC, start_time ASC'
  );
  return stmt.all().map(mapRow);
}

/**
 * Return all distinct dates that have exposure records.
 *
 * @returns {string[]}
 */
function getAvailableDates() {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT DISTINCT date FROM exposure_records ORDER BY date ASC'
  );
  return stmt.all().map((row) => row.date);
}

/**
 * Return the total number of exposure records in the table.
 *
 * @returns {number}
 */
function count() {
  const db  = getDatabase();
  const row = db.prepare('SELECT COUNT(*) AS n FROM exposure_records').get();
  return row.n;
}

// ── Write operations ──────────────────────────────────────────────────────────

/**
 * Insert a new exposure record.
 *
 * @param {object} record - ExposureRecord-shaped plain object.
 *                          Must include an `id` field.
 * @returns {object}      - The inserted record.
 */
function insert(record) {
  const db   = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO exposure_records
      (id, visit_id, location_name, latitude, longitude,
       date, start_time, end_time, duration_minutes,
       aqi, category, exposure)
    VALUES
      (@id, @visitId, @locationName, @latitude, @longitude,
       @date, @startTime, @endTime, @durationMinutes,
       @aqi, @category, @exposure)
  `);
  stmt.run(record);
  return record;
}

/**
 * Delete all rows from exposure_records.
 */
function deleteAll() {
  getDatabase().prepare('DELETE FROM exposure_records').run();
}

module.exports = {
  findByDate,
  findAll,
  getAvailableDates,
  count,
  insert,
  deleteAll,
};
