/**
 * MockAQIDataProvider.js
 *
 * Concrete AQIDataProvider that returns data from in-memory mock tables.
 *
 * This provider makes the backend fully self-contained — no external API keys
 * or network calls are required.  All returned values are deterministic, which
 * makes automated testing reliable.
 *
 * To replace this with a real AQI API later, implement a new provider class
 * following the AQIDataProvider interface and update the import in
 * locationService.js.
 */

'use strict';

const { AQIDataProvider } = require('./AQIDataProvider');
const { mockAQITable }     = require('../data/mockAQI');
const { getAQICategory }   = require('../services/aqiService');
const { createAQIReading } = require('../models/AQIReading');

class MockAQIDataProvider extends AQIDataProvider {
  /**
   * Look up the AQI for a location visit using the mock table.
   *
   * Matching strategy:
   *   1. Exact match on visit.date and visit.locationName.
   *   2. Returns null if no entry exists (handled gracefully by the pipeline).
   *
   * @param {object} visit - A LocationVisit object.
   * @returns {{ aqi: number, category: string } | null}
   */
  getAQIForVisit(visit) {
    const dateTable = mockAQITable[visit.date];
    if (!dateTable) return null;

    const aqi = dateTable[visit.locationName];
    if (aqi === undefined) return null;

    return {
      aqi,
      category: getAQICategory(aqi),
    };
  }

  /**
   * Return AQIReading objects for all locations on a given date.
   *
   * @param {string} date - YYYY-MM-DD string.
   * @returns {object[]} Array of AQIReading objects, or empty array.
   */
  getAQIReadingsForDate(date) {
    const dateTable = mockAQITable[date];
    if (!dateTable) return [];

    return Object.entries(dateTable).map(([locationName, aqi], index) => {
      const category = getAQICategory(aqi);
      return createAQIReading({
        id: `aqi-${date}-${String(index + 1).padStart(2, '0')}`,
        // Coordinates are not stored per-reading in the mock table.
        // Use null to indicate they are not available from this provider.
        latitude: null,
        longitude: null,
        timestamp: `${date}T12:00:00`, // Representative midday timestamp
        aqi,
        category,
        pollutant: 'PM2.5', // Placeholder — real provider would supply this
        source: 'mock',
        // Attach the location name for API clarity
        locationName,
      });
    });
  }

  /**
   * Return all dates for which mock AQI data is available.
   *
   * @returns {string[]} Sorted array of YYYY-MM-DD strings.
   */
  getAvailableDates() {
    return Object.keys(mockAQITable).sort();
  }
}

// Export a singleton instance — the entire app shares one provider.
const mockAQIDataProvider = new MockAQIDataProvider();

module.exports = { MockAQIDataProvider, mockAQIDataProvider };
