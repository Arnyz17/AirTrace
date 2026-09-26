/**
 * validation.js
 *
 * Input validation helpers for location visits and API route parameters.
 *
 * Design:
 *   - All functions return { code, message } on validation failure, or null on success.
 *   - Returning a plain object (not throwing) keeps validation separate from
 *     error-handling flow and makes unit testing straightforward.
 *   - Controllers convert validation failures into structured HTTP error responses
 *     using the `code` field from errorCodes.js.
 */

'use strict';

const { VALIDATION }      = require('../config/constants');
const { ERROR_CODES }     = require('../errors/errorCodes');
const { parseISODate }    = require('./dateUtils');

// ─── LocationVisit validation ────────────────────────────────────────────────

/**
 * Validate a LocationVisit object.
 *
 * @param {object} visit - The visit to validate.
 * @returns {{ code: string, message: string } | null}
 *   Validation error descriptor, or null if the visit is valid.
 */
function validateLocationVisit(visit) {
  if (!visit || typeof visit !== 'object') {
    return { code: ERROR_CODES.VALIDATION_ERROR, message: 'Visit must be a non-null object.' };
  }

  // Location name
  if (!visit.locationName || typeof visit.locationName !== 'string' || visit.locationName.trim() === '') {
    return {
      code:    ERROR_CODES.INVALID_LOCATION_NAME,
      message: 'locationName is required and must be a non-empty string.',
    };
  }

  // Latitude
  if (
    typeof visit.latitude !== 'number' || isNaN(visit.latitude) ||
    visit.latitude < VALIDATION.LATITUDE_MIN || visit.latitude > VALIDATION.LATITUDE_MAX
  ) {
    return {
      code:    ERROR_CODES.INVALID_COORDINATES,
      message: `latitude must be a number between ${VALIDATION.LATITUDE_MIN} and ${VALIDATION.LATITUDE_MAX}.`,
    };
  }

  // Longitude
  if (
    typeof visit.longitude !== 'number' || isNaN(visit.longitude) ||
    visit.longitude < VALIDATION.LONGITUDE_MIN || visit.longitude > VALIDATION.LONGITUDE_MAX
  ) {
    return {
      code:    ERROR_CODES.INVALID_COORDINATES,
      message: `longitude must be a number between ${VALIDATION.LONGITUDE_MIN} and ${VALIDATION.LONGITUDE_MAX}.`,
    };
  }

  // startTime
  if (!visit.startTime || typeof visit.startTime !== 'string') {
    return { code: ERROR_CODES.MISSING_REQUIRED_FIELD, message: 'startTime is required.' };
  }
  const startDate = parseISODate(visit.startTime);
  if (!startDate) {
    return {
      code:    ERROR_CODES.INVALID_TIMESTAMP,
      message: `startTime "${visit.startTime}" is not a valid ISO-8601 datetime.`,
    };
  }

  // endTime
  if (!visit.endTime || typeof visit.endTime !== 'string') {
    return { code: ERROR_CODES.MISSING_REQUIRED_FIELD, message: 'endTime is required.' };
  }
  const endDate = parseISODate(visit.endTime);
  if (!endDate) {
    return {
      code:    ERROR_CODES.INVALID_TIMESTAMP,
      message: `endTime "${visit.endTime}" is not a valid ISO-8601 datetime.`,
    };
  }

  // end must not be before start
  if (endDate.getTime() < startDate.getTime()) {
    return {
      code:    ERROR_CODES.TIMESTAMP_ORDER_ERROR,
      message: 'endTime cannot be before startTime.',
    };
  }

  // durationMinutes — validate if provided
  if (visit.durationMinutes !== undefined && visit.durationMinutes !== null) {
    if (typeof visit.durationMinutes !== 'number' || isNaN(visit.durationMinutes)) {
      return { code: ERROR_CODES.INVALID_DURATION, message: 'durationMinutes must be a number.' };
    }
    if (visit.durationMinutes < 0) {
      return {
        code:    ERROR_CODES.INVALID_DURATION,
        message: 'durationMinutes cannot be negative.',
      };
    }
    if (visit.durationMinutes > VALIDATION.DURATION_MAX_MINUTES) {
      return {
        code:    ERROR_CODES.INVALID_DURATION,
        message: `durationMinutes cannot exceed ${VALIDATION.DURATION_MAX_MINUTES} (24 hours).`,
      };
    }
  }

  // aqi — validate if provided
  if (visit.aqi !== undefined && visit.aqi !== null) {
    if (typeof visit.aqi !== 'number' || isNaN(visit.aqi)) {
      return { code: ERROR_CODES.INVALID_AQI, message: 'aqi must be a number.' };
    }
    if (visit.aqi < VALIDATION.AQI_MIN || visit.aqi > VALIDATION.AQI_MAX) {
      return {
        code:    ERROR_CODES.INVALID_AQI,
        message: `aqi must be between ${VALIDATION.AQI_MIN} and ${VALIDATION.AQI_MAX}.`,
      };
    }
  }

  return null; // Valid
}

// ─── Date parameter validation ───────────────────────────────────────────────

/**
 * Validate a YYYY-MM-DD date string from a URL route parameter.
 *
 * @param {string} dateStr - Raw value from req.params.date.
 * @returns {{ code: string, message: string } | null}
 */
function validateDateParam(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { code: ERROR_CODES.MISSING_REQUIRED_FIELD, message: 'date parameter is required.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      code:    ERROR_CODES.INVALID_DATE_FORMAT,
      message: 'date must be in YYYY-MM-DD format (e.g. 2026-09-25).',
    };
  }
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) {
    return {
      code:    ERROR_CODES.INVALID_DATE_VALUE,
      message: `"${dateStr}" is not a valid calendar date.`,
    };
  }
  return null;
}

module.exports = {
  validateLocationVisit,
  validateDateParam,
};
