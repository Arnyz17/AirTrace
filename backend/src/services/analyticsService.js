/**
 * analyticsService.js
 *
 * Higher-level analytics derived from exposure records.
 *
 * This service operates on data already persisted in the database.  It reads
 * exposure records and computes statistics that go beyond what the basic
 * exposure API returns:
 *
 *   getDailyAnalytics(date)
 *     • Category breakdown with PERCENTAGES (not just minute counts)
 *     • Location rankings by exposure (which spot contributed most?)
 *     • Location rankings by AQI (which spot was most polluted?)
 *     • Comparison against the average day (was today better or worse?)
 *
 *   getOverviewAnalytics()
 *     • Totals and averages across all tracked dates
 *     • Best and worst day
 *     • Most visited location (by time)
 *     • Highest-AQI location (by max observed AQI)
 *     • Category distribution with percentages
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CALCULATION NOTES
 *
 * All averages use the duration-weighted formula:
 *
 *   weightedAvgAQI = Σ(AQI_i × duration_i) / Σ(duration_i)
 *
 * This is the same formula used in aggregationService.js and ensures
 * consistency between the exposure API and the analytics API.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const exposureRecordRepo = require('../db/repositories/exposureRecordRepository');
const locationVisitRepo  = require('../db/repositories/locationVisitRepository');

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Sum an array of numbers. */
function sum(arr) {
  return arr.reduce((acc, v) => acc + v, 0);
}

/** Round a number to `decimals` decimal places. */
function round(value, decimals = 1) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Compute the duration-weighted average AQI for an array of exposure records.
 *
 * @param {object[]} records - Array with .aqi and .durationMinutes fields.
 * @returns {number}
 */
function weightedAvgAQI(records) {
  const totalMinutes = sum(records.map((r) => r.durationMinutes));
  if (totalMinutes === 0) return 0;
  const weightedSum = sum(records.map((r) => r.aqi * r.durationMinutes));
  return round(weightedSum / totalMinutes);
}

/**
 * Group an array of objects by the result of keyFn.
 *
 * @param {any[]}    arr
 * @param {Function} keyFn - fn(item) → string key
 * @returns {object}       - { key: [items] }
 */
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * Build a category breakdown object with both minutes and percentage.
 *
 * @param {object[]} records   - Exposure records.
 * @param {number}   totalMin  - Total minutes (for percentage calculation).
 * @returns {object}           - { [categoryLabel]: { minutes, percentage } }
 */
function buildCategoryBreakdown(records, totalMin) {
  const breakdown = {};
  for (const r of records) {
    if (!breakdown[r.category]) breakdown[r.category] = { minutes: 0, percentage: 0 };
    breakdown[r.category].minutes += r.durationMinutes;
  }
  for (const cat of Object.keys(breakdown)) {
    breakdown[cat].percentage = round((breakdown[cat].minutes / totalMin) * 100);
  }
  return breakdown;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute detailed analytics for a single date.
 *
 * Returns null if no exposure records exist for the date.
 *
 * @param {string} date - YYYY-MM-DD string.
 * @returns {object | null}
 */
function getDailyAnalytics(date) {
  const records = exposureRecordRepo.findByDate(date);
  if (records.length === 0) return null;

  const totalMinutes = sum(records.map((r) => r.durationMinutes));
  const totalExposure = sum(records.map((r) => r.exposure));

  // ── Category breakdown with percentages ─────────────────────────────────
  const categoryBreakdown = buildCategoryBreakdown(records, totalMinutes);

  // ── Location rankings ────────────────────────────────────────────────────
  const byLocation = groupBy(records, (r) => r.locationName);

  const locationStats = Object.entries(byLocation).map(([name, recs]) => {
    const locMinutes  = sum(recs.map((r) => r.durationMinutes));
    const locExposure = sum(recs.map((r) => r.exposure));
    const locMaxAQI   = Math.max(...recs.map((r) => r.aqi));
    const locAvgAQI   = weightedAvgAQI(recs);
    const firstRec    = recs[0];
    return {
      locationName:    name,
      latitude:        firstRec.latitude,
      longitude:       firstRec.longitude,
      totalMinutes:    locMinutes,
      totalExposure:   locExposure,
      averageAQI:      locAvgAQI,
      maxAQI:          locMaxAQI,
    };
  });

  const byExposure = [...locationStats]
    .sort((a, b) => b.totalExposure - a.totalExposure)
    .map((loc, i) => ({ rank: i + 1, ...loc }));

  const byAQI = [...locationStats]
    .sort((a, b) => b.maxAQI - a.maxAQI)
    .map((loc, i) => ({ rank: i + 1, ...loc }));

  // ── Comparison to average across all dates ───────────────────────────────
  const allRecords      = exposureRecordRepo.findAll();
  const allDates        = [...new Set(allRecords.map((r) => r.date))];
  const allDaysExposure = allDates.map((d) => {
    const dayRecs = allRecords.filter((r) => r.date === d);
    return sum(dayRecs.map((r) => r.exposure));
  });
  const avgDailyExposure   = allDaysExposure.length > 0
    ? round(sum(allDaysExposure) / allDaysExposure.length, 0)
    : 0;
  const exposureDelta       = totalExposure - avgDailyExposure;
  const exposureDeltaPercent = avgDailyExposure > 0
    ? round((exposureDelta / avgDailyExposure) * 100)
    : 0;

  return {
    date,
    totalExposure,
    totalMinutesTracked: totalMinutes,
    averageAQI:          weightedAvgAQI(records),
    categoryBreakdown,
    locationRankings: {
      byExposure,
      byAQI,
    },
    comparisonToAverage: {
      allDaysAverageExposure: avgDailyExposure,
      delta:                  round(exposureDelta, 0),
      deltaPercent:           exposureDeltaPercent,
      betterThanAverage:      exposureDelta < 0,
    },
  };
}

/**
 * Compute aggregate analytics across ALL tracked dates.
 *
 * @returns {object}
 */
function getOverviewAnalytics() {
  const allRecords  = exposureRecordRepo.findAll();
  const allDates    = locationVisitRepo.getAvailableDates();

  if (allRecords.length === 0 || allDates.length === 0) {
    return {
      totalDaysTracked:      0,
      availableDates:        [],
      totalTrackedMinutes:   0,
      totalTrackedHours:     0,
      totalExposure:         0,
      averageDailyExposure:  0,
      overallAverageAQI:     0,
      bestDay:               null,
      worstDay:              null,
      mostVisitedLocation:   null,
      highestAQILocation:    null,
      categoryDistribution:  {},
    };
  }

  const totalMinutes  = sum(allRecords.map((r) => r.durationMinutes));
  const totalExposure = sum(allRecords.map((r) => r.exposure));

  // ── Per-day rollup for best/worst ────────────────────────────────────────
  const byDate = groupBy(allRecords, (r) => r.date);
  const dayStats = Object.entries(byDate).map(([d, recs]) => ({
    date:          d,
    totalExposure: sum(recs.map((r) => r.exposure)),
    averageAQI:    weightedAvgAQI(recs),
    totalMinutes:  sum(recs.map((r) => r.durationMinutes)),
  }));

  const bestDay  = [...dayStats].sort((a, b) => a.averageAQI - b.averageAQI)[0];
  const worstDay = [...dayStats].sort((a, b) => b.averageAQI - a.averageAQI)[0];

  // ── Location-level rollup ─────────────────────────────────────────────────
  const byLocation = groupBy(allRecords, (r) => r.locationName);
  const locationStats = Object.entries(byLocation).map(([name, recs]) => ({
    locationName:  name,
    totalMinutes:  sum(recs.map((r) => r.durationMinutes)),
    maxAQI:        Math.max(...recs.map((r) => r.aqi)),
  }));

  const mostVisitedLocation = locationStats
    .sort((a, b) => b.totalMinutes - a.totalMinutes)[0];

  const highestAQILocation = locationStats
    .sort((a, b) => b.maxAQI - a.maxAQI)[0];

  // ── Category distribution ─────────────────────────────────────────────────
  const categoryDistribution = buildCategoryBreakdown(allRecords, totalMinutes);

  return {
    totalDaysTracked:     allDates.length,
    availableDates:       allDates,
    totalTrackedMinutes:  totalMinutes,
    totalTrackedHours:    round(totalMinutes / 60),
    totalExposure,
    averageDailyExposure: allDates.length > 0
      ? round(totalExposure / allDates.length, 0)
      : 0,
    overallAverageAQI: weightedAvgAQI(allRecords),
    bestDay:  { date: bestDay.date,  averageAQI: bestDay.averageAQI,  totalExposure: bestDay.totalExposure  },
    worstDay: { date: worstDay.date, averageAQI: worstDay.averageAQI, totalExposure: worstDay.totalExposure },
    mostVisitedLocation: {
      locationName: mostVisitedLocation.locationName,
      totalMinutes: mostVisitedLocation.totalMinutes,
    },
    highestAQILocation: {
      locationName: highestAQILocation.locationName,
      maxAQI:       highestAQILocation.maxAQI,
    },
    categoryDistribution,
  };
}

module.exports = { getDailyAnalytics, getOverviewAnalytics };
