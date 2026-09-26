/**
 * analyticsService.test.js
 *
 * Unit tests for src/services/analyticsService.js
 *
 * The analytics service reads from the database, so these are technically
 * integration tests at the service layer.  We use the in-memory test database
 * and seed it with known data before running assertions.
 */

'use strict';

process.env.NODE_ENV = 'test';

const { setupTestDb } = require('../helpers/dbHelper');
const { getDailyAnalytics, getOverviewAnalytics } = require('../../src/services/analyticsService');

beforeAll(() => {
  setupTestDb();
});

// ─── getDailyAnalytics ────────────────────────────────────────────────────────

describe('getDailyAnalytics', () => {
  test('returns null for a date with no data', () => {
    expect(getDailyAnalytics('2020-01-01')).toBeNull();
  });

  test('returns an object for a valid date', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result).not.toBeNull();
    expect(result.date).toBe('2026-09-25');
  });

  test('totalExposure matches sum of all visit exposures', () => {
    // 2026-09-25: 45*240 + 110*60 + 82*300 + 65*60 = 10800+6600+24600+3900 = 45900
    const result = getDailyAnalytics('2026-09-25');
    expect(result.totalExposure).toBe(45900);
  });

  test('totalMinutesTracked = 660 for 2026-09-25', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result.totalMinutesTracked).toBe(660);
  });

  test('categoryBreakdown contains minutes and percentage for each category', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result.categoryBreakdown).toBeDefined();
    for (const cat of Object.values(result.categoryBreakdown)) {
      expect(typeof cat.minutes).toBe('number');
      expect(typeof cat.percentage).toBe('number');
      expect(cat.percentage).toBeGreaterThan(0);
      expect(cat.percentage).toBeLessThanOrEqual(100);
    }
  });

  test('category percentages sum to 100 (±0.5 for rounding)', () => {
    const result = getDailyAnalytics('2026-09-25');
    const total  = Object.values(result.categoryBreakdown).reduce((acc, v) => acc + v.percentage, 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThanOrEqual(100.5);
  });

  test('locationRankings.byExposure is sorted highest-first', () => {
    const result   = getDailyAnalytics('2026-09-25');
    const exposures = result.locationRankings.byExposure.map((l) => l.totalExposure);
    for (let i = 1; i < exposures.length; i++) {
      expect(exposures[i]).toBeLessThanOrEqual(exposures[i - 1]);
    }
  });

  test('locationRankings.byExposure top entry is Campus (24600)', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result.locationRankings.byExposure[0].locationName).toBe('Campus');
    expect(result.locationRankings.byExposure[0].totalExposure).toBe(24600);
  });

  test('locationRankings.byAQI top entry is Train (maxAQI 110)', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result.locationRankings.byAQI[0].locationName).toBe('Train');
    expect(result.locationRankings.byAQI[0].maxAQI).toBe(110);
  });

  test('each ranking entry has a rank field starting at 1', () => {
    const result = getDailyAnalytics('2026-09-25');
    result.locationRankings.byExposure.forEach((loc, i) => {
      expect(loc.rank).toBe(i + 1);
    });
  });

  test('comparisonToAverage has required fields', () => {
    const result = getDailyAnalytics('2026-09-25');
    expect(result.comparisonToAverage).toBeDefined();
    expect(typeof result.comparisonToAverage.delta).toBe('number');
    expect(typeof result.comparisonToAverage.deltaPercent).toBe('number');
    expect(typeof result.comparisonToAverage.betterThanAverage).toBe('boolean');
    expect(typeof result.comparisonToAverage.allDaysAverageExposure).toBe('number');
  });
});

// ─── getOverviewAnalytics ─────────────────────────────────────────────────────

describe('getOverviewAnalytics', () => {
  test('returns data when database has records', () => {
    const result = getOverviewAnalytics();
    expect(result.totalDaysTracked).toBeGreaterThan(0);
  });

  test('totalDaysTracked = 3 (three seed dates)', () => {
    const result = getOverviewAnalytics();
    expect(result.totalDaysTracked).toBe(3);
  });

  test('availableDates has 3 entries', () => {
    const result = getOverviewAnalytics();
    expect(result.availableDates).toHaveLength(3);
    expect(result.availableDates).toContain('2026-09-25');
  });

  test('totalTrackedMinutes is positive', () => {
    const result = getOverviewAnalytics();
    expect(result.totalTrackedMinutes).toBeGreaterThan(0);
  });

  test('totalTrackedHours is totalTrackedMinutes / 60 (rounded)', () => {
    const result = getOverviewAnalytics();
    expect(result.totalTrackedHours).toBeCloseTo(result.totalTrackedMinutes / 60, 0);
  });

  test('totalExposure > 0', () => {
    const result = getOverviewAnalytics();
    expect(result.totalExposure).toBeGreaterThan(0);
  });

  test('averageDailyExposure = totalExposure / totalDaysTracked', () => {
    const result  = getOverviewAnalytics();
    const computed = Math.round(result.totalExposure / result.totalDaysTracked);
    expect(Math.abs(result.averageDailyExposure - computed)).toBeLessThanOrEqual(1);
  });

  test('bestDay has lower averageAQI than worstDay', () => {
    const result = getOverviewAnalytics();
    expect(result.bestDay.averageAQI).toBeLessThanOrEqual(result.worstDay.averageAQI);
  });

  test('mostVisitedLocation has locationName and totalMinutes', () => {
    const result = getOverviewAnalytics();
    expect(result.mostVisitedLocation.locationName).toBeDefined();
    expect(result.mostVisitedLocation.totalMinutes).toBeGreaterThan(0);
  });

  test('highestAQILocation has locationName and maxAQI', () => {
    const result = getOverviewAnalytics();
    expect(result.highestAQILocation.locationName).toBeDefined();
    expect(result.highestAQILocation.maxAQI).toBeGreaterThan(0);
  });

  test('highestAQILocation is Downtown (AQI 125)', () => {
    const result = getOverviewAnalytics();
    expect(result.highestAQILocation.locationName).toBe('Downtown');
    expect(result.highestAQILocation.maxAQI).toBe(125);
  });

  test('categoryDistribution percentages sum to ~100', () => {
    const result = getOverviewAnalytics();
    const total  = Object.values(result.categoryDistribution).reduce((acc, v) => acc + v.percentage, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThanOrEqual(101);
  });
});
