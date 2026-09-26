/**
 * errorCodes.js
 *
 * Centralized registry of all error codes used by the AirTrace API.
 *
 * Having codes in one place means:
 *   - Frontend can switch on `error.code` instead of parsing message strings.
 *   - Codes are easy to search for in the codebase.
 *   - New codes are added in one place only.
 */

'use strict';

const ERROR_CODES = {
  // ── 400 Validation errors ────────────────────────────────────────────────
  MISSING_REQUIRED_FIELD:   'MISSING_REQUIRED_FIELD',
  INVALID_LOCATION_NAME:    'INVALID_LOCATION_NAME',
  INVALID_COORDINATES:      'INVALID_COORDINATES',
  INVALID_TIMESTAMP:        'INVALID_TIMESTAMP',
  TIMESTAMP_ORDER_ERROR:    'TIMESTAMP_ORDER_ERROR',
  INVALID_DURATION:         'INVALID_DURATION',
  INVALID_AQI:              'INVALID_AQI',
  INVALID_DATE_FORMAT:      'INVALID_DATE_FORMAT',
  INVALID_DATE_VALUE:       'INVALID_DATE_VALUE',
  VALIDATION_ERROR:         'VALIDATION_ERROR',

  // ── 404 Not-found errors ─────────────────────────────────────────────────
  DATE_NOT_FOUND:           'DATE_NOT_FOUND',
  RESOURCE_NOT_FOUND:       'RESOURCE_NOT_FOUND',

  // ── 500 Server errors ────────────────────────────────────────────────────
  DATABASE_ERROR:           'DATABASE_ERROR',
  INTERNAL_ERROR:           'INTERNAL_ERROR',
};

module.exports = { ERROR_CODES };
