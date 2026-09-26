/**
 * dateUtils.js
 *
 * Date and time utilities.
 *
 * All date handling is done with plain ISO-8601 strings and JavaScript's
 * built-in Date object.  No external date library is required, which keeps
 * the dependency footprint minimal.
 *
 * IMPORTANT: All mock data timestamps are stored WITHOUT a timezone suffix
 * (e.g. "2026-09-25T10:00:00") so they are interpreted as local time by the
 * JS runtime.  If your deployment requires explicit timezone handling, append
 * a timezone offset (e.g. "Z" for UTC) to the timestamp strings.
 */

'use strict';

/**
 * Parse an ISO-8601 datetime string into a JavaScript Date object.
 *
 * @param {string} isoString - e.g. "2026-09-25T10:00:00"
 * @returns {Date | null} Parsed Date, or null if the string is invalid.
 */
function parseISODate(isoString) {
  if (!isoString || typeof isoString !== 'string') return null;
  const d = new Date(isoString);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Calculate the duration in whole minutes between two ISO-8601 datetime strings.
 *
 * @param {string} startTime - ISO-8601 start datetime.
 * @param {string} endTime   - ISO-8601 end datetime.
 * @returns {number | null} Duration in minutes, or null if inputs are invalid.
 */
function deriveDurationMinutes(startTime, endTime) {
  const start = parseISODate(startTime);
  const end   = parseISODate(endTime);

  if (!start || !end) return null;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null; // end before start — invalid

  return Math.round(diffMs / 60000);
}

/**
 * Extract the YYYY-MM-DD date portion from an ISO-8601 datetime string.
 *
 * @param {string} isoString - ISO-8601 datetime string.
 * @returns {string | null} Date portion (e.g. "2026-09-25"), or null.
 */
function extractDate(isoString) {
  if (!isoString || typeof isoString !== 'string') return null;
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Return true if a string is a valid YYYY-MM-DD date.
 *
 * @param {string} dateStr - The string to test.
 * @returns {boolean}
 */
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

module.exports = {
  parseISODate,
  deriveDurationMinutes,
  extractDate,
  isValidDateString,
};
