/**
 * exposureService.js
 *
 * Core Exposure Index calculation engine.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPOSURE INDEX FORMULA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   exposure = AQI × durationMinutes
 *
 * This is a PROJECT-DEFINED metric.
 *
 * It is NOT:
 *   • A medically validated measure of actual inhaled pollution dose.
 *   • An official EPA or WHO exposure standard.
 *   • A substitute for professional health guidance.
 *
 * It IS:
 *   • A simple, intuitive way to compare relative pollution load between
 *     locations and time periods within the AirTrace project.
 *   • Intentionally isolated in this module so it can be replaced with a
 *     more sophisticated model later (e.g. ventilation rate, activity
 *     level, indoor/outdoor corrections).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXAMPLES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Location : Home
 *   AQI      : 45       (Good)
 *   Duration : 240 min  (4 hours)
 *   Exposure : 45 × 240 = 10 800
 *
 *   Location : Train
 *   AQI      : 110      (Unhealthy for Sensitive Groups)
 *   Duration : 60 min   (1 hour)
 *   Exposure : 110 × 60 = 6 600
 *
 *   Even though the train visit is shorter, the higher AQI produces a
 *   meaningful exposure contribution relative to its duration.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { createExposureRecord } = require('../models/ExposureRecord');
const { getAQICategory }        = require('./aqiService');

/**
 * Calculate the Exposure Index for a single location visit.
 *
 * Formula: exposure = AQI × durationMinutes
 *
 * @param {number} aqi             - Numeric AQI value (must be ≥ 0).
 * @param {number} durationMinutes - Duration in whole minutes (must be ≥ 0).
 * @returns {number} The Exposure Index for this visit.
 * @throws {Error} If either argument is not a non-negative finite number.
 */
function calculateVisitExposure(aqi, durationMinutes) {
  if (typeof aqi !== 'number' || !isFinite(aqi) || aqi < 0) {
    throw new Error(`calculateVisitExposure: invalid aqi "${aqi}" — must be a non-negative finite number.`);
  }
  if (typeof durationMinutes !== 'number' || !isFinite(durationMinutes) || durationMinutes < 0) {
    throw new Error(`calculateVisitExposure: invalid durationMinutes "${durationMinutes}" — must be a non-negative finite number.`);
  }

  // ─────────────────────────────────────────────────
  // EXPOSURE FORMULA — edit here to update the model
  // ─────────────────────────────────────────────────
  return aqi * durationMinutes;
}

/**
 * Process an array of LocationVisit objects (already annotated with AQI) into
 * an array of ExposureRecord objects.
 *
 * Visits without a valid AQI (aqi is null/undefined) are skipped — they
 * cannot contribute to the exposure calculation.
 *
 * @param {object[]} visits - Array of LocationVisit objects with .aqi populated.
 * @returns {object[]} Array of ExposureRecord objects.
 */
function calculateExposureRecords(visits) {
  const records = [];

  for (const visit of visits) {
    // Skip visits where AQI data is unavailable
    if (visit.aqi === null || visit.aqi === undefined) {
      continue;
    }

    const exposure  = calculateVisitExposure(visit.aqi, visit.durationMinutes);
    const category  = visit.aqiCategory || getAQICategory(visit.aqi);

    records.push(
      createExposureRecord({
        visitId:         visit.id,
        locationName:    visit.locationName,
        latitude:        visit.latitude,
        longitude:       visit.longitude,
        date:            visit.date,
        startTime:       visit.startTime,
        endTime:         visit.endTime,
        durationMinutes: visit.durationMinutes,
        aqi:             visit.aqi,
        category,
        exposure,
      })
    );
  }

  return records;
}

module.exports = {
  calculateVisitExposure,
  calculateExposureRecords,
};
