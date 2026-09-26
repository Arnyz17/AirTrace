/**
 * aqiReadingRepository.js
 *
 * Data-access layer for the aqi_readings table.
 */

'use strict';

const { getDatabase } = require('../database');

// ── Row → Object mapping ─────────────────────────────────────────────────────

function mapRow(row) {
  return {
    id:           row.id,
    locationName: row.location_name,
    date:         row.date,
    timestamp:    row.timestamp,
    aqi:          row.aqi,
    category:     row.category,
    pollutant:    row.pollutant,
    source:       row.source,
  };
}

// ── Read operations ───────────────────────────────────────────────────────────

/**
 * Return all AQI readings for a specific date.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {object[]}  - Array of AQIReading objects.
 */
function findByDate(date) {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM aqi_readings WHERE date = ? ORDER BY location_name ASC'
  );
  return stmt.all(date).map(mapRow);
}

/**
 * Return all distinct dates that have AQI readings, sorted ascending.
 *
 * @returns {string[]}
 */
function getAvailableDates() {
  const db   = getDatabase();
  const stmt = db.prepare(
    'SELECT DISTINCT date FROM aqi_readings ORDER BY date ASC'
  );
  return stmt.all().map((row) => row.date);
}

/**
 * Return the total number of AQI readings in the table.
 *
 * @returns {number}
 */
function count() {
  const db  = getDatabase();
  const row = db.prepare('SELECT COUNT(*) AS n FROM aqi_readings').get();
  return row.n;
}

// ── Write operations ──────────────────────────────────────────────────────────

/**
 * Insert a new AQI reading.
 *
 * @param {object} reading - AQIReading-shaped object.
 * @returns {object}       - The inserted reading.
 */
function insert(reading) {
  const db   = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO aqi_readings
      (id, location_name, date, timestamp, aqi, category, pollutant, source)
    VALUES
      (@id, @locationName, @date, @timestamp, @aqi, @category, @pollutant, @source)
  `);
  stmt.run(reading);
  return reading;
}

/**
 * Delete all rows from aqi_readings.
 */
function deleteAll() {
  getDatabase().prepare('DELETE FROM aqi_readings').run();
}

module.exports = {
  findByDate,
  getAvailableDates,
  count,
  insert,
  deleteAll,
};
