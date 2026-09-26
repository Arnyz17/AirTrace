/**
 * aqiController.js
 *
 * Handles:
 *   GET /api/aqi/categories  → AQI category reference table
 *   GET /api/aqi/:date       → AQI readings for a specific date
 *
 * Route registration note: "categories" must be registered BEFORE "/:date".
 */

'use strict';

const { sendSuccess, sendError }      = require('../utils/responseHelpers');
const { validateDateParam }           = require('../utils/validation');
const { getAllAQICategories }         = require('../services/aqiService');
const aqiReadingRepo                  = require('../db/repositories/aqiReadingRepository');
const { ERROR_CODES }                 = require('../errors/errorCodes');

// ---------------------------------------------------------------------------
// GET /api/aqi/categories
// ---------------------------------------------------------------------------

/**
 * Return the AQI category reference table.
 * Frontend uses the `color` field to render map legends and chart colours.
 */
function getCategories(req, res) {
  sendSuccess(res, {
    categories: getAllAQICategories(),
    note:       'Source: US EPA AQI scale (simplified for AirTrace project use).',
  });
}

// ---------------------------------------------------------------------------
// GET /api/aqi/:date
// ---------------------------------------------------------------------------

/**
 * Return the AQI readings stored for a specific date.
 */
function getAQIByDate(req, res) {
  const { date } = req.params;

  const validationError = validateDateParam(date);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  const readings = aqiReadingRepo.findByDate(date);

  if (!readings || readings.length === 0) {
    const available = aqiReadingRepo.getAvailableDates();
    return sendError(
      res, 404,
      `No AQI data found for date "${date}". Available dates: ${available.join(', ')}.`,
      ERROR_CODES.DATE_NOT_FOUND
    );
  }

  sendSuccess(res, {
    date,
    source: 'mock',
    count:  readings.length,
    readings,
  });
}

module.exports = { getCategories, getAQIByDate };
