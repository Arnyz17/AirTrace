/**
 * visitsController.js
 *
 * Handles POST /api/visits
 *
 * Accepts a new location visit, runs it through the full processing pipeline,
 * persists all outputs to the database, and returns the processed record.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PIPELINE
 *
 *   1. Parse   — validate Content-Type and JSON body
 *   2. Validate — check all required fields and value ranges
 *   3. Derive   — calculate durationMinutes from start/end if not provided
 *   4. AQI      — look up AQI from the provider abstraction
 *   5. Exposure — calculate Exposure Index = AQI × durationMinutes
 *   6. Persist  — write to location_visits, aqi_readings, exposure_records
 *   7. Respond  — return the processed visit and exposure record
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REQUEST BODY (application/json)
 * {
 *   "locationName": "Library",
 *   "latitude":     40.752,
 *   "longitude":    -73.985,
 *   "startTime":    "2026-09-26T14:00:00",
 *   "endTime":      "2026-09-26T17:00:00",
 *   "durationMinutes": 180   // optional; calculated from timestamps if omitted
 * }
 *
 * RESPONSE 201
 * {
 *   "success": true,
 *   "data": {
 *     "visit":          { ... },     // stored location visit
 *     "exposureRecord": { ... },     // calculated exposure (null if no AQI)
 *     "aqiAvailable":   true
 *   }
 * }
 */

'use strict';

const { randomUUID }              = require('crypto');
const { sendSuccess, sendError }  = require('../utils/responseHelpers');
const { validateLocationVisit }   = require('../utils/validation');
const { deriveDurationMinutes, extractDate } = require('../utils/dateUtils');
const { calculateVisitExposure }  = require('../services/exposureService');
const { mockAQIDataProvider }     = require('../providers/MockAQIDataProvider');
const locationVisitRepo           = require('../db/repositories/locationVisitRepository');
const aqiReadingRepo              = require('../db/repositories/aqiReadingRepository');
const exposureRecordRepo          = require('../db/repositories/exposureRecordRepository');
const { getDatabase }             = require('../db/database');

/**
 * POST /api/visits
 */
function createVisit(req, res) {
  const body = req.body;

  // ── 1. Validate body fields ───────────────────────────────────────────────
  const validationError = validateLocationVisit(body);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  // ── 2. Derive durationMinutes if not provided ─────────────────────────────
  let durationMinutes = body.durationMinutes;
  if (durationMinutes === undefined || durationMinutes === null) {
    durationMinutes = deriveDurationMinutes(body.startTime, body.endTime);
    if (durationMinutes === null || durationMinutes < 0) {
      return sendError(res, 400,
        'Could not derive durationMinutes from startTime and endTime.',
        'INVALID_DURATION'
      );
    }
  }

  // ── 3. Build the visit object ─────────────────────────────────────────────
  const visitId = randomUUID();
  const date    = extractDate(body.startTime);

  const rawVisit = {
    id:              visitId,
    locationName:    body.locationName.trim(),
    latitude:        body.latitude,
    longitude:       body.longitude,
    startTime:       body.startTime,
    endTime:         body.endTime,
    durationMinutes,
    date,
  };

  // ── 4. AQI lookup ─────────────────────────────────────────────────────────
  //
  // The provider abstraction is used here.  For mock data, the AQI lookup
  // succeeds only if the visit's date and locationName exist in the mock table.
  // A real provider would call an external API using coordinates.
  const aqiResult = mockAQIDataProvider.getAQIForVisit(rawVisit);

  const visit = {
    ...rawVisit,
    aqi:         aqiResult ? aqiResult.aqi      : null,
    aqiCategory: aqiResult ? aqiResult.category : null,
  };

  let exposureRecord = null;

  // ── 5. Persist everything in one transaction ──────────────────────────────
  const db = getDatabase();

  const persist = db.transaction(() => {
    locationVisitRepo.insert(visit);

    if (aqiResult) {
      // Store the AQI reading
      aqiReadingRepo.insert({
        id:           randomUUID(),
        locationName: visit.locationName,
        date:         visit.date,
        timestamp:    `${visit.date}T12:00:00`,
        aqi:          aqiResult.aqi,
        category:     aqiResult.category,
        pollutant:    'PM2.5',
        source:       'mock',
      });

      // Calculate and store exposure
      const exposure = calculateVisitExposure(aqiResult.aqi, durationMinutes);
      exposureRecord = {
        id:              randomUUID(),
        visitId:         visit.id,
        locationName:    visit.locationName,
        latitude:        visit.latitude,
        longitude:       visit.longitude,
        date:            visit.date,
        startTime:       visit.startTime,
        endTime:         visit.endTime,
        durationMinutes,
        aqi:             aqiResult.aqi,
        category:        aqiResult.category,
        exposure,
      };
      exposureRecordRepo.insert(exposureRecord);
    }
  });

  persist();

  // ── 6. Respond ────────────────────────────────────────────────────────────
  sendSuccess(res, {
    visit,
    exposureRecord,
    aqiAvailable: aqiResult !== null,
    ...(!aqiResult && {
      note: 'No AQI data found for this location/date. Visit is stored but exposure cannot be calculated.',
    }),
  }, 201);
}

module.exports = { createVisit };
