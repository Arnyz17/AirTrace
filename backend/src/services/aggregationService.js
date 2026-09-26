/**
 * aggregationService.js
 *
 * Aggregates an array of ExposureRecords into a DailyExposureSummary.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CALCULATIONS PERFORMED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. TOTAL EXPOSURE
 *      Sum of (AQI × duration) for every valid visit on the day.
 *
 * 2. DURATION-WEIGHTED AVERAGE AQI
 *      Rather than a simple mean, we weight each visit's AQI by its duration.
 *      This prevents a brief, high-AQI commute from disproportionately raising
 *      the daily average.
 *
 *        weightedAvgAQI = Σ(AQI_i × duration_i) / Σ(duration_i)
 *
 *      Example:
 *        Home   AQI 45,  240 min  → contribution 10 800
 *        Train  AQI 110,  60 min  → contribution  6 600
 *        Campus AQI 82,  300 min  → contribution 24 600
 *
 *        Σ(AQI × dur) = 42 000
 *        Σ(dur)       = 600
 *        Weighted avg = 42 000 / 600 = 70.0
 *
 * 3. HIGHEST AQI — the single maximum AQI observed across all visits.
 *
 * 4. HIGHEST EXPOSURE LOCATION — the location whose individual exposure value
 *    is greatest (not necessarily the same as highest AQI, because duration
 *    matters).
 *
 * 5. TOTAL MINUTES TRACKED — simple sum of durationMinutes.
 *
 * 6. CATEGORY BREAKDOWN — maps each AQI category label to the total minutes
 *    spent in that category.
 *
 * 7. LOCATION BREAKDOWN — per-location totals: minutes, exposure, averageAQI.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { createDailyExposureSummary } = require('../models/DailyExposureSummary');

/**
 * Aggregate an array of ExposureRecords for a single day into a
 * DailyExposureSummary.
 *
 * @param {string}   date    - YYYY-MM-DD string for the day being summarised.
 * @param {object[]} records - Array of ExposureRecord objects (may be empty).
 * @returns {object} A DailyExposureSummary object.
 */
function buildDailyExposureSummary(date, records) {
  // Handle the empty-data case gracefully
  if (!records || records.length === 0) {
    return createDailyExposureSummary({
      date,
      totalExposure:           0,
      averageAQI:              0,
      highestAQI:              0,
      highestAQILocation:      null,
      highestExposureLocation: null,
      totalMinutesTracked:     0,
      numberOfLocations:       0,
      exposureRecords:         [],
      categoryBreakdown:       {},
      locationBreakdown:       [],
    });
  }

  // ─── 1. Total exposure ────────────────────────────────────────────────────
  const totalExposure = records.reduce((sum, r) => sum + r.exposure, 0);

  // ─── 2. Duration-weighted average AQI ────────────────────────────────────
  //
  //   weightedAvgAQI = Σ(AQI_i × duration_i) / Σ(duration_i)
  //
  const totalMinutesTracked  = records.reduce((sum, r) => sum + r.durationMinutes, 0);
  const weightedAQISum       = records.reduce((sum, r) => sum + r.aqi * r.durationMinutes, 0);
  const averageAQI           = totalMinutesTracked > 0
    ? Math.round((weightedAQISum / totalMinutesTracked) * 10) / 10  // 1 d.p.
    : 0;

  // ─── 3. Highest AQI ───────────────────────────────────────────────────────
  const highestRecord      = records.reduce((best, r) => r.aqi > best.aqi ? r : best, records[0]);
  const highestAQI         = highestRecord.aqi;
  const highestAQILocation = highestRecord.locationName;

  // ─── 4. Highest exposure location ────────────────────────────────────────
  const highestExposureRecord   = records.reduce(
    (best, r) => r.exposure > best.exposure ? r : best,
    records[0]
  );
  const highestExposureLocation = highestExposureRecord.locationName;

  // ─── 5. Number of distinct locations ─────────────────────────────────────
  const uniqueLocationNames = [...new Set(records.map((r) => r.locationName))];
  const numberOfLocations   = uniqueLocationNames.length;

  // ─── 6. Category breakdown ────────────────────────────────────────────────
  //   Maps category label → total minutes spent in that category.
  const categoryBreakdown = {};
  for (const record of records) {
    const cat = record.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + record.durationMinutes;
  }

  // ─── 7. Per-location breakdown ────────────────────────────────────────────
  const locationMap = {};
  for (const record of records) {
    const name = record.locationName;
    if (!locationMap[name]) {
      locationMap[name] = {
        locationName:    name,
        latitude:        record.latitude,
        longitude:       record.longitude,
        totalMinutes:    0,
        totalExposure:   0,
        weightedAQISum:  0,
      };
    }
    locationMap[name].totalMinutes  += record.durationMinutes;
    locationMap[name].totalExposure += record.exposure;
    locationMap[name].weightedAQISum += record.aqi * record.durationMinutes;
  }

  const locationBreakdown = Object.values(locationMap).map((loc) => ({
    locationName:  loc.locationName,
    latitude:      loc.latitude,
    longitude:     loc.longitude,
    totalMinutes:  loc.totalMinutes,
    totalExposure: loc.totalExposure,
    // Duration-weighted average AQI per location
    averageAQI:    loc.totalMinutes > 0
      ? Math.round((loc.weightedAQISum / loc.totalMinutes) * 10) / 10
      : 0,
  }));

  return createDailyExposureSummary({
    date,
    totalExposure,
    averageAQI,
    highestAQI,
    highestAQILocation,
    highestExposureLocation,
    totalMinutesTracked,
    numberOfLocations,
    exposureRecords:  records,
    categoryBreakdown,
    locationBreakdown,
  });
}

module.exports = { buildDailyExposureSummary };
