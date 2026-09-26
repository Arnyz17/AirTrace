/**
 * analyticsController.js
 *
 * Handles:
 *   GET /api/analytics/overview       → cross-date aggregate analytics
 *   GET /api/analytics/daily/:date    → per-day detailed analytics
 *
 * These endpoints complement the basic exposure API by providing richer
 * statistics: category time percentages, location rankings, and day comparisons.
 */

'use strict';

const { sendSuccess, sendError }                  = require('../utils/responseHelpers');
const { validateDateParam }                       = require('../utils/validation');
const { getDailyAnalytics, getOverviewAnalytics } = require('../services/analyticsService');
const { ERROR_CODES }                             = require('../errors/errorCodes');

// ---------------------------------------------------------------------------
// GET /api/analytics/overview
// ---------------------------------------------------------------------------

/**
 * Return aggregate analytics across all tracked dates.
 */
function getOverview(req, res) {
  const analytics = getOverviewAnalytics();

  if (analytics.totalDaysTracked === 0) {
    return sendError(
      res, 404,
      'No analytics data available. Run `npm run seed` to populate the database.',
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, analytics);
}

// ---------------------------------------------------------------------------
// GET /api/analytics/daily/:date
// ---------------------------------------------------------------------------

/**
 * Return detailed analytics for a specific date.
 */
function getDailyAnalyticsForDate(req, res) {
  const { date } = req.params;

  const validationError = validateDateParam(date);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  const analytics = getDailyAnalytics(date);

  if (!analytics) {
    return sendError(
      res, 404,
      `No analytics data found for date "${date}".`,
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, analytics);
}

module.exports = { getOverview, getDailyAnalyticsForDate };
