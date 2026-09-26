/**
 * ExposureRecord.js
 *
 * Factory and documentation for the ExposureRecord domain object.
 *
 * An ExposureRecord is produced by the exposure calculation service for a
 * single LocationVisit.  It pairs the visit's AQI and duration to yield the
 * Exposure Index for that visit.
 *
 * ─────────────────────────────────────────────────────────────
 * EXPOSURE INDEX FORMULA (project-defined — NOT a medical measure)
 *
 *   exposure = AQI × durationMinutes
 *
 * This simplified metric lets users compare the relative pollution load
 * they received at different locations and times.  A higher value means
 * they spent more time in a higher-AQI environment.
 *
 * Example: AQI 80 for 60 min → exposure = 4 800
 * Example: AQI 100 for 120 min → exposure = 12 000
 * ─────────────────────────────────────────────────────────────
 *
 * Fields
 * ──────
 *  visitId         {string}  ID of the originating LocationVisit.
 *  locationName    {string}  Human-readable location name.
 *  latitude        {number}
 *  longitude       {number}
 *  date            {string}  YYYY-MM-DD.
 *  startTime       {string}  ISO-8601 datetime.
 *  endTime         {string}  ISO-8601 datetime.
 *  durationMinutes {number}  Duration of the visit in minutes.
 *  aqi             {number}  AQI value used in the calculation.
 *  category        {string}  AQI category label.
 *  exposure        {number}  Computed Exposure Index (AQI × durationMinutes).
 */

'use strict';

/**
 * Create an ExposureRecord object.
 *
 * @param {object} fields - Raw field values.
 * @returns {object} An ExposureRecord plain object.
 */
function createExposureRecord({
  visitId,
  locationName,
  latitude,
  longitude,
  date,
  startTime,
  endTime,
  durationMinutes,
  aqi,
  category,
  exposure,
}) {
  return {
    visitId,
    locationName,
    latitude,
    longitude,
    date,
    startTime,
    endTime,
    durationMinutes,
    aqi,
    category,
    exposure,
  };
}

module.exports = { createExposureRecord };
