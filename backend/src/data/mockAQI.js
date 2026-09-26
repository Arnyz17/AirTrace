/**
 * mockAQI.js
 *
 * Realistic sample AQI readings paired to the mock location visits.
 *
 * Each entry maps a locationName → date → aqi value.  The MockAQIDataProvider
 * uses this table to look up the AQI for a given location visit.
 *
 * AQI values are intentionally varied to:
 *   • Cover all six AQI categories (Good → Hazardous).
 *   • Provide deterministic, testable results.
 *   • Reflect realistic urban air-quality variation by location type.
 *
 * IMPORTANT: These are fictional values for demonstration purposes only.
 */

'use strict';

/**
 * Mock AQI lookup table.
 * Structure: { [date]: { [locationName]: aqiValue } }
 */
const mockAQITable = {
  '2026-09-24': {
    Home:       40,   // Good — residential, low traffic
    Train:      95,   // Moderate — enclosed transit space
    Office:     58,   // Moderate — urban commercial building
    Gym:        72,   // Moderate — indoor with some ventilation
  },
  '2026-09-25': {
    Home:       45,   // Good
    Train:      110,  // Unhealthy for Sensitive Groups — peak hour
    Campus:     82,   // Moderate — open campus with some traffic
    Restaurant: 65,   // Moderate — indoor dining
  },
  '2026-09-26': {
    Home:       50,   // Good (upper boundary)
    Campus:     70,   // Moderate
    Downtown:   125,  // Unhealthy for Sensitive Groups — high traffic area
    Park:       38,   // Good — open green space, lower pollution
  },
};

module.exports = { mockAQITable };
