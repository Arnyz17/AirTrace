/**
 * exposureController.js
 *
 * Handles:
 *   GET /api/exposure/today    → most recent mock-data date
 *   GET /api/exposure/history  → all available daily summaries (compact)
 *   GET /api/exposure/:date    → full exposure detail for a specific date
 *
 * IMPORTANT — Route registration order:
 *   "today" and "history" must be registered BEFORE "/:date" in the router.
 *   This is enforced in routes/exposure.js.
 */

'use strict';

const { sendSuccess, sendError }        = require('../utils/responseHelpers');
const { validateDateParam }             = require('../utils/validation');
const { getDateResult, getAllDailySummaries, getAvailableDates } = require('../services/locationService');
const { MOCK_LATEST_DATE, EXPOSURE_FORMULA_DESCRIPTION } = require('../config/constants');
const { ERROR_CODES } = require('../errors/errorCodes');

// ---------------------------------------------------------------------------
// GET /api/exposure/today
// ---------------------------------------------------------------------------

/**
 * Return the full exposure detail for the most recent available date.
 *
 * "Today" is defined by MOCK_LATEST_DATE in constants.js, NOT the computer
 * clock, to ensure deterministic demo behaviour.
 */
function getToday(req, res) {
  const result = getDateResult(MOCK_LATEST_DATE);

  if (!result) {
    return sendError(
      res, 404,
      `No data available for the most recent date (${MOCK_LATEST_DATE}). Run \`npm run seed\` to populate the database.`,
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, {
    note:            'Returns the most recent available date in the dataset, not the computer clock date.',
    date:            MOCK_LATEST_DATE,
    exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
    summary:         result.summary,
  });
}

// ---------------------------------------------------------------------------
// GET /api/exposure/history
// ---------------------------------------------------------------------------

/**
 * Return a compact summary for every available date.
 * The full exposureRecords array is omitted to keep the list response small.
 */
function getHistory(req, res) {
  const summaries = getAllDailySummaries();

  if (!summaries || summaries.length === 0) {
    return sendError(
      res, 404,
      'No historical data available. Run `npm run seed` to populate the database.',
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  const compactSummaries = summaries.map(({ exposureRecords, ...rest }) => rest);

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
 *
 * @param req.params.date - YYYY-MM-DD string.
 */
function getExposureByDate(req, res) {
  const { date } = req.params;

  const validationError = validateDateParam(date);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  const result = getDateResult(date);

  if (!result) {
    const available = getAvailableDates();
    return sendError(
      res, 404,
      `No data found for date "${date}". Available dates: ${available.join(', ')}.`,
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, {
    date,
    exposureFormula: EXPOSURE_FORMULA_DESCRIPTION,
    summary:         result.summary,
    locations:       result.visits,
  });
}

module.exports = { getToday, getHistory, getExposureByDate };
