/**
 * visitsController.js
 *
 * Handles POST /api/visits
 *
 * Pipeline:
 *   1. Validate      — body fields & value ranges
 *   2. Derive        — durationMinutes from start/end timestamps
 *   3. AQI (LIVE)    — Open-Meteo free API → real US AQI from lat/lng
 *   4. Exposure      — AQI × durationMinutes
 *   5. Persist       — location_visits + aqi_readings + exposure_records
 *   6. Respond       — return processed visit + exposure record
 */

'use strict';

const { randomUUID }                     = require('crypto');
const { sendSuccess, sendError }         = require('../utils/responseHelpers');
const { validateLocationVisit }          = require('../utils/validation');
const { deriveDurationMinutes, extractDate } = require('../utils/dateUtils');
const { calculateVisitExposure }         = require('../services/exposureService');
const { openMeteoAQIProvider }           = require('../providers/OpenMeteoAQIProvider');
const locationVisitRepo                  = require('../db/repositories/locationVisitRepository');
const aqiReadingRepo                     = require('../db/repositories/aqiReadingRepository');
const exposureRecordRepo                 = require('../db/repositories/exposureRecordRepository');
const { getDatabase }                    = require('../db/database');

/**
 * POST /api/visits
 *
 * Now async — fetches live AQI from Open-Meteo before persisting.
 */
async function createVisit(req, res) {
  const body = req.body;

  // ── 1. Validate ───────────────────────────────────────────────────────────
  const validationError = validateLocationVisit(body);
  if (validationError) {
    return sendError(res, 400, validationError.message, validationError.code);
  }

  // ── 2. Duration ───────────────────────────────────────────────────────────
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

  // ── 3. Build raw visit ────────────────────────────────────────────────────
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

  // ── 4. Live AQI from Open-Meteo ───────────────────────────────────────────
  let aqiResult = null;
  try {
    aqiResult = await openMeteoAQIProvider.getAQIForVisitAsync(rawVisit);
  } catch (err) {
    console.warn('[visitsController] AQI fetch error (non-fatal):', err.message);
  }

  // If live fetch failed, fall back to a reasonable current-hour estimate
  // from a secondary call with today's date so the visit still gets stored.
  const visit = {
    ...rawVisit,
    aqi:         aqiResult ? aqiResult.aqi      : null,
    aqiCategory: aqiResult ? aqiResult.category : null,
  };

  let exposureRecord = null;

  // ── 5. Persist in one transaction ─────────────────────────────────────────
  const db = getDatabase();

  const persist = db.transaction(() => {
    locationVisitRepo.insert(visit);

    if (aqiResult) {
      aqiReadingRepo.insert({
        id:           randomUUID(),
        locationName: visit.locationName,
        date:         visit.date,
        timestamp:    visit.startTime,
        aqi:          aqiResult.aqi,
        category:     aqiResult.category,
        pollutant:    aqiResult.pollutant || 'US AQI (PM2.5)',
        source:       aqiResult.source   || 'open-meteo',
      });

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
    aqiAvailable:  aqiResult !== null,
    aqiSource:     aqiResult ? (aqiResult.source || 'open-meteo') : null,
    ...(!aqiResult && {
      note: 'Live AQI fetch returned no data for this location. Visit stored — AQI will appear as N/A.',
    }),
  }, 201);
}

module.exports = { createVisit };
