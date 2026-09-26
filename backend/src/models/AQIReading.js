/**
 * AQIReading.js
 *
 * Factory and documentation for the AQIReading domain object.
 *
 * An AQIReading represents an air-quality measurement associated with a
 * geographic location and a point in time.  It is produced by an
 * AQIDataProvider and consumed by the exposure calculation pipeline.
 *
 * Fields
 * ──────
 *  id          {string}  Unique identifier for this reading.
 *  latitude    {number}  Geographic latitude of the measurement.
 *  longitude   {number}  Geographic longitude of the measurement.
 *  timestamp   {string}  ISO-8601 datetime string of the measurement.
 *  aqi         {number}  Air Quality Index value (0–999).
 *  category    {string}  Human-readable AQI category (from AQI_CATEGORIES).
 *  pollutant   {string|null}  Primary pollutant contributing to the AQI,
 *                             e.g. "PM2.5".  May be null if not available.
 *  source      {string}  Origin of the data (e.g. "mock", "openaq").
 */

'use strict';

/**
 * Create an AQIReading object.
 *
 * @param {object} fields - Raw field values.
 * @returns {object} An AQIReading plain object.
 */
function createAQIReading({
  id,
  latitude,
  longitude,
  timestamp,
  aqi,
  category,
  pollutant = null,
  source = 'mock',
}) {
  return { id, latitude, longitude, timestamp, aqi, category, pollutant, source };
}

module.exports = { createAQIReading };
