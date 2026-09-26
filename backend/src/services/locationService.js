/**
 * locationService.js
 *
 * Orchestrates the data processing pipeline for AirTrace.
 *
 * Pipeline stages (also described in the seed script):
 *
 *   1. FETCH     — retrieve location visits from the database
 *   2. AQI       — already stored with visit; skip re-lookup for GET endpoints
 *   3. EXPOSURE  — read pre-computed exposure records from database
 *   4. AGGREGATE — build DailyExposureSummary from exposure records
 *
 * POST /api/visits uses a separate pipeline in visitsController.js that runs
 * the full validate → AQI lookup → calculate → persist sequence for new data.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AQI PROVIDER NOTE
 *
 * The provider abstraction is still present in the codebase (providers/).
 * For GET endpoints, the AQI has already been associated and stored in the DB
 * during seeding or visit submission, so the provider is not called here.
 *
 * When POST /api/visits is called, the provider IS called (in visitsController)
 * to look up AQI for the new visit.  Swapping providers only requires changing
 * the import in visitsController.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const locationVisitRepo    = require('../db/repositories/locationVisitRepository');
const exposureRecordRepo   = require('../db/repositories/exposureRecordRepository');
const { buildDailyExposureSummary } = require('./aggregationService');

/**
 * Return the raw (AQI-annotated) location visits for a specific date.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {object[]}  - Array of LocationVisit objects (with aqi/aqiCategory).
 */
function getVisitsForDate(date) {
  return locationVisitRepo.findByDate(date);
}

/**
 * Return all dates that have at least one location visit in the database.
 *
 * @returns {string[]} - Sorted YYYY-MM-DD strings.
 */
function getAvailableDates() {
  return locationVisitRepo.getAvailableDates();
}

/**
 * Build the full exposure summary for a single date by reading pre-computed
 * exposure records from the database and aggregating them.
 *
 * Returns null if no data exists for the date.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {{ visits, exposureRecords, summary } | null}
 */
function getDateResult(date) {
  const visits  = locationVisitRepo.findByDate(date);
  if (visits.length === 0) return null;

  const records = exposureRecordRepo.findByDate(date);
  const summary = buildDailyExposureSummary(date, records);

  return { visits, exposureRecords: records, summary };
}

/**
 * Return a compact DailyExposureSummary for every available date.
 * Used by GET /api/exposure/history.
 *
 * @returns {object[]} - Array of DailyExposureSummary objects, sorted by date.
 */
function getAllDailySummaries() {
  return getAvailableDates()
    .map((date) => {
      const records = exposureRecordRepo.findByDate(date);
      return buildDailyExposureSummary(date, records);
    });
}

module.exports = {
  getVisitsForDate,
  getAvailableDates,
  getDateResult,
  getAllDailySummaries,
};
