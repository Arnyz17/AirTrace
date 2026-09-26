/**
 * schema.js
 *
 * SQLite schema definition for AirTrace.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TABLES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * location_visits
 *   One row per location visit submitted to the system.
 *   AQI and category are stored here (denormalised) for convenient single-table
 *   retrieval — the map endpoint needs visits with AQI without a JOIN.
 *
 * aqi_readings
 *   One row per AQI observation for a (date, location) pair.
 *   Written during seeding and when a new visit is submitted.
 *   Used by GET /api/aqi/:date.
 *
 * exposure_records
 *   One row per visit that has a valid AQI.
 *   Pre-computed exposure = AQI × durationMinutes.
 *   Written at the same time as the location visit (pipeline output).
 *   Used by GET /api/exposure/:date and the analytics service.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DATE HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * All datetimes are stored as TEXT in ISO-8601 format WITHOUT a timezone suffix
 * (e.g. "2026-09-25T10:00:00").  The application treats all times as the user's
 * local time and does not perform timezone conversion.
 *
 * The `date` column (YYYY-MM-DD) is a derived field stored for efficient
 * date-range queries without string parsing in SQLite.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/**
 * SQL statements to create the schema.
 * Each statement is run via db.exec() which supports multi-statement strings.
 */
const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS location_visits (
  id               TEXT    PRIMARY KEY,
  location_name    TEXT    NOT NULL,
  latitude         REAL    NOT NULL,
  longitude        REAL    NOT NULL,
  start_time       TEXT    NOT NULL,
  end_time         TEXT    NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date             TEXT    NOT NULL,
  aqi              REAL,
  aqi_category     TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_location_visits_date
  ON location_visits (date);

CREATE TABLE IF NOT EXISTS aqi_readings (
  id            TEXT PRIMARY KEY,
  location_name TEXT NOT NULL,
  date          TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  aqi           REAL NOT NULL,
  category      TEXT NOT NULL,
  pollutant     TEXT,
  source        TEXT NOT NULL DEFAULT 'mock',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_aqi_readings_date
  ON aqi_readings (date);

CREATE TABLE IF NOT EXISTS exposure_records (
  id               TEXT    PRIMARY KEY,
  visit_id         TEXT    NOT NULL REFERENCES location_visits(id),
  location_name    TEXT    NOT NULL,
  latitude         REAL,
  longitude        REAL,
  date             TEXT    NOT NULL,
  start_time       TEXT    NOT NULL,
  end_time         TEXT    NOT NULL,
  duration_minutes INTEGER NOT NULL,
  aqi              REAL    NOT NULL,
  category         TEXT    NOT NULL,
  exposure         REAL    NOT NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exposure_records_date
  ON exposure_records (date);
`;

module.exports = { SCHEMA_SQL };
