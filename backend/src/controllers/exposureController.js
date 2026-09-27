/**
 * exposureController.js
 *
 * Handles:
 *   GET /api/exposure/today    → most recent date in DB, or today if empty
 *   GET /api/exposure/history  → all available daily summaries (compact)
 *   GET /api/exposure/:date    → full exposure detail for a specific date
 *
 * IMPORTANT — Route registration order:
 *   "today" and "history" must be registered BEFORE "/:date" in the router.
 *   This is enforced in routes/exposure.js.
 */

'use strict';

const { sendSuccess }                    = require('../utils/responseHelpers');
const { validateDateParam }              = require('../utils/validation');
const { getDateResult, getAllDailySummaries, getAvailableDates } = require('../services/locationService');
const { EXPOSURE_FORMULA_DESCRIPTION }   = require('../config/constants');

// ---------------------------------------------------------------------------
// GET /api/exposure/today
// ---------------------------------------------------------------------------

/**
 * Return the full exposure detail for the most recent available date.
 * If the database is empty, returns today's date with an empty dataset.
 */
function getToday(req, res) {
  const available = getAvailableDates();
  const today = new Date().toISOString().slice(0, 10);
  const targetDate = available.length > 0 ? available[available.length - 1] : today;

  const result = getDateResult(targetDate);

  if (!result) {
    // Empty DB — return today with no data
    return sendSuccess(res, {
      date:            today,
      exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
      locations:       [],
      summary:         { averageAQI: null, totalExposure: 0, totalMinutesTracked: 0, numberOfLocations: 0, categoryBreakdown: {} },
    });
  }

  sendSuccess(res, {
    date:            targetDate,
    exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
    summary:         result.summary,
    locations:       result.visits,
  });
}

// ---------------------------------------------------------------------------
// GET /api/exposure/history
// ---------------------------------------------------------------------------

/**
 * Return a compact summary for every available date.
 * Returns empty array (not 404) when DB has no data.
 */
function getHistory(req, res) {
  const summaries = getAllDailySummaries();
  const compactSummaries = (summaries || []).map(({ exposureRecords, ...rest }) => rest);

  sendSuccess(res, {
    availableDates: getAvailableDates(),
    count:          compactSummaries.length,
    summaries:      compactSummaries,
  });
}

// ---------------------------------------------------------------------------
// GET /api/exposure/:date
// ---------------------------------------------------------------------------

/**
 * Return the full exposure detail for a specific date.
 * Returns empty dataset (200) — never 404 — when no visits exist for the date.
 *
 * @param req.params.date - YYYY-MM-DD string.
 */
function getExposureByDate(req, res) {
  const { date } = req.params;

  const validationError = validateDateParam(date);
  if (validationError) {
    return res.status(400).json({ success: false, error: { message: validationError.message } });
  }

  const result = getDateResult(date);

  if (!result) {
    // No visits for this date — return empty (200, not 404)
    return sendSuccess(res, {
      date,
      exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
      locations: [],
      summary: {
        averageAQI:             null,
        totalExposure:          0,
        totalMinutesTracked:    0,
        numberOfLocations:      0,
        highestAQI:             null,
        highestAQILocation:     null,
        highestExposureLocation: null,
        categoryBreakdown:      {},
      },
    });
  }

  sendSuccess(res, {
    date,
    exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
    summary:         result.summary,
    locations:       result.visits,
  });
}

module.exports = { getToday, getHistory, getExposureByDate };
