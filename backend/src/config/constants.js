/**
 * constants.js
 *
 * Centralised configuration for AirTrace.
 *
 * AQI thresholds, category labels, and any other domain-wide constants are
 * defined here exactly once.  Do NOT duplicate these values in other modules —
 * always import from this file so that a single change updates the entire app.
 */

'use strict';

// ---------------------------------------------------------------------------
// AQI Category Thresholds
// ---------------------------------------------------------------------------
//
// Each entry describes one AQI band.  The bands are listed in ascending order
// so they can be iterated to find the first matching category for a given AQI
// value.
//
// Source: US EPA AQI scale (simplified for project use).
// These values are intentionally kept in one place so updating the thresholds
// only requires editing this file.
//
// Range: [min, max] — both endpoints are INCLUSIVE.
// "max: Infinity" means there is no upper bound.

const AQI_CATEGORIES = [
  { min: 0,   max: 50,       category: 'Good',                        color: '#00e400' },
  { min: 51,  max: 100,      category: 'Moderate',                    color: '#ffff00' },
  { min: 101, max: 150,      category: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
  { min: 151, max: 200,      category: 'Unhealthy',                   color: '#ff0000' },
  { min: 201, max: 300,      category: 'Very Unhealthy',              color: '#8f3f97' },
  { min: 301, max: 9999,     category: 'Hazardous',                   color: '#7e0023' },
];

// ---------------------------------------------------------------------------
// Exposure Index
// ---------------------------------------------------------------------------
//
// AirTrace uses a project-defined Exposure Index:
//
//   exposure = AQI × durationMinutes
//
// IMPORTANT: This is NOT a medically validated measure of inhaled pollution
// exposure.  It is a simplified project-defined metric intended to help users
// compare relative exposure across locations and time periods.
//
// The formula is isolated so it can be replaced with a more sophisticated
// model in the future.

const EXPOSURE_FORMULA_DESCRIPTION =
  'Exposure Index = AQI × Duration (minutes). ' +
  'This is a project-defined metric, NOT a medical measurement.';

// ---------------------------------------------------------------------------
// Validation Bounds
// ---------------------------------------------------------------------------

const VALIDATION = {
  /** Acceptable AQI range accepted from data sources. */
  AQI_MIN: 0,
  AQI_MAX: 999,

  /** Geographic coordinate bounds. */
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,

  /** Maximum duration for a single visit (24 h expressed in minutes). */
  DURATION_MAX_MINUTES: 1440,
};

// ---------------------------------------------------------------------------
// Mock Data — Most Recent Available Date
// ---------------------------------------------------------------------------
//
// GET /api/exposure/today returns the most recent date present in the mock
// dataset.  This constant makes the behaviour deterministic regardless of the
// computer's actual clock — useful for testing and demos.

const MOCK_LATEST_DATE = '2026-09-26';

module.exports = {
  AQI_CATEGORIES,
  EXPOSURE_FORMULA_DESCRIPTION,
  VALIDATION,
  MOCK_LATEST_DATE,
};
