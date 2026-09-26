/**
 * LocationVisit.js
 *
 * Factory and documentation for the LocationVisit domain object.
 *
 * A LocationVisit represents a single period during which the user was at a
 * particular location.  It is the primary input to the exposure calculation
 * pipeline.
 *
 * Fields
 * ──────
 *  id              {string}  Unique identifier for this visit.
 *  locationName    {string}  Human-readable name (e.g. "Campus", "Home").
 *  latitude        {number}  Geographic latitude  (-90 … 90).
 *  longitude       {number}  Geographic longitude (-180 … 180).
 *  startTime       {string}  ISO-8601 datetime string (no timezone = local).
 *  endTime         {string}  ISO-8601 datetime string (no timezone = local).
 *  durationMinutes {number}  Length of visit in whole minutes (≥ 0).
 *  aqi             {number|null}  AQI value for this visit (populated by the
 *                               AQI association step; null if unavailable).
 *  aqiCategory     {string|null}  Descriptive AQI category (populated with aqi).
 *  date            {string}  YYYY-MM-DD date extracted from startTime.
 */

'use strict';

/**
 * Create a validated LocationVisit object.
 *
 * @param {object} fields - Raw field values.
 * @returns {object} A LocationVisit plain object.
 */
function createLocationVisit({
  id,
  locationName,
  latitude,
  longitude,
  startTime,
  endTime,
  durationMinutes,
  aqi = null,
  aqiCategory = null,
  date,
}) {
  return {
    id,
    locationName,
    latitude,
    longitude,
    startTime,
    endTime,
    durationMinutes,
    aqi,
    aqiCategory,
    // date is derived from startTime — keep it here for convenience
    date: date || startTime.slice(0, 10),
  };
}

module.exports = { createLocationVisit };
