/**
 * locationController.js
 *
 * Handles GET /api/locations/:date
 */

'use strict';

const { sendSuccess, sendError }  = require('../utils/responseHelpers');
const { validateDateParam }       = require('../utils/validation');
const { getVisitsForDate, getAvailableDates } = require('../services/locationService');
const { ERROR_CODES }             = require('../errors/errorCodes');

/**
 * GET /api/locations/:date
 *
 * Return AQI-annotated location visits for a specific date.
 * Each visit includes latitude, longitude, AQI, and category — suitable for
 * rendering map markers on the frontend.
 */
function getLocationsByDate(req, res) {
  const { date } = req.params;

  const validationError = validateDateParam(date);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  const visits = getVisitsForDate(date);

  if (!visits || visits.length === 0) {
    const available = getAvailableDates();
    return sendError(
      res, 404,
      `No location data found for date "${date}". Available dates: ${available.join(', ')}.`,
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, {
    date,
    count:     visits.length,
    locations: visits,
  });
}

module.exports = { getLocationsByDate };
