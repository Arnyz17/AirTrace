/**
 * AQIDataProvider.js
 *
 * Interface contract for AQI data providers.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE
 * ─────────────────────────────────────────────────────────────────────────────
 * This file defines the expected interface that every concrete AQI provider
 * must implement.  The exposure calculation engine depends only on this
 * interface — it never imports from MockAQIDataProvider or any future real
 * provider directly.
 *
 * This design means swapping mock data for a real external AQI API requires:
 *   1. Creating a new class that implements the methods below.
 *   2. Changing the single import in the service layer.
 *   3. No changes to the exposure engine, controllers, or routes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A REAL AQI PROVIDER IN THE FUTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Create a new file, e.g. `OpenAQDataProvider.js`.
 *   2. Extend or replicate this interface.
 *   3. Implement `getAQIForVisit` and `getAQIReadingsForDate` using the
 *      real API (e.g. IQAir, OpenAQ, AirVisual).
 *   4. In `locationService.js`, swap the import to use the new provider.
 *
 * The exposure engine will continue to work without any changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

class AQIDataProvider {
  /**
   * Return the AQI for a given location visit.
   *
   * Implementations may use coordinates, location name, timestamp, or any
   * combination to look up or fetch the AQI.
   *
   * @param {object} visit - A LocationVisit object.
   * @param {string} visit.locationName  - Human-readable location name.
   * @param {number} visit.latitude      - Geographic latitude.
   * @param {number} visit.longitude     - Geographic longitude.
   * @param {string} visit.startTime     - ISO-8601 start timestamp.
   * @param {string} visit.date          - YYYY-MM-DD date string.
   *
   * @returns {{ aqi: number, category: string } | null}
   *   An object with the numeric AQI and its category label, or null if no
   *   AQI data is available for this visit.
   */
  // eslint-disable-next-line no-unused-vars
  getAQIForVisit(visit) {
    throw new Error('AQIDataProvider.getAQIForVisit() must be implemented by a concrete provider.');
  }

  /**
   * Return all AQI readings available for a given date.
   *
   * Used by the GET /api/aqi/:date endpoint.
   *
   * @param {string} date - YYYY-MM-DD string.
   * @returns {object[]} Array of AQIReading objects.
   */
  // eslint-disable-next-line no-unused-vars
  getAQIReadingsForDate(date) {
    throw new Error('AQIDataProvider.getAQIReadingsForDate() must be implemented by a concrete provider.');
  }

  /**
   * Return all dates for which AQI data is available.
   *
   * @returns {string[]} Array of YYYY-MM-DD strings, sorted ascending.
   */
  getAvailableDates() {
    throw new Error('AQIDataProvider.getAvailableDates() must be implemented by a concrete provider.');
  }
}

module.exports = { AQIDataProvider };
