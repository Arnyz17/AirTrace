/**
 * aggregationService.test.js
 *
 * Unit tests for buildDailyExposureSummary.
 *
 * Tests verify:
 *   - Empty records produce zero-value summary
 *   - Single-location totals
 *   - Multi-location aggregation
 *   - Duration-weighted average AQI
 *   - Highest AQI and highest exposure location detection
 *   - Category breakdown
 *   - Location breakdown
 */

'use strict';

const { buildDailyExposureSummary } = require('../../src/services/aggregationService');

// Helper to create a minimal ExposureRecord for testing
function makeRecord(opts) {
  return {
    visitId:         opts.id || 'v-001',
    locationName:    opts.locationName || 'Test',
    latitude:        opts.latitude  || 40.7,
    longitude:       opts.longitude || -74.0,
    date:            opts.date        || '2026-09-25',
    startTime:       opts.startTime   || '2026-09-25T08:00:00',
    endTime:         opts.endTime     || '2026-09-25T12:00:00',
    durationMinutes: opts.durationMinutes,
    aqi:             opts.aqi,
    category:        opts.category,
    exposure:        opts.aqi * opts.durationMinutes,
  };
}

describe('buildDailyExposureSummary — empty records', () => {
  test('returns zero-value summary for empty array', () => {
    const summary = buildDailyExposureSummary('2026-09-25', []);
    expect(summary.totalExposure).toBe(0);
    expect(summary.averageAQI).toBe(0);
    expect(summary.highestAQI).toBe(0);
    expect(summary.totalMinutesTracked).toBe(0);
    expect(summary.numberOfLocations).toBe(0);
    expect(summary.exposureRecords).toEqual([]);
  });

  test('returns zero-value summary for null', () => {
    const summary = buildDailyExposureSummary('2026-09-25', null);
    expect(summary.totalExposure).toBe(0);
  });
});

describe('buildDailyExposureSummary — single location', () => {
  const record = makeRecord({ locationName: 'Home', aqi: 45, durationMinutes: 240, category: 'Good' });
  const summary = buildDailyExposureSummary('2026-09-25', [record]);

  test('totalExposure = AQI × duration', () => {
    expect(summary.totalExposure).toBe(45 * 240); // 10800
  });

  test('averageAQI equals the single visit AQI', () => {
    expect(summary.averageAQI).toBe(45);
  });

  test('highestAQI equals the single visit AQI', () => {
    expect(summary.highestAQI).toBe(45);
  });

  test('highestAQILocation is "Home"', () => {
    expect(summary.highestAQILocation).toBe('Home');
  });

  test('highestExposureLocation is "Home"', () => {
    expect(summary.highestExposureLocation).toBe('Home');
  });

  test('totalMinutesTracked = 240', () => {
    expect(summary.totalMinutesTracked).toBe(240);
  });

  test('numberOfLocations = 1', () => {
    expect(summary.numberOfLocations).toBe(1);
  });
});

describe('buildDailyExposureSummary — multiple locations (2026-09-25 mock data)', () => {
  const records = [
    makeRecord({ id: 'v-01', locationName: 'Home',       aqi: 45,  durationMinutes: 240, category: 'Good' }),
    makeRecord({ id: 'v-02', locationName: 'Train',      aqi: 110, durationMinutes: 60,  category: 'Unhealthy for Sensitive Groups' }),
    makeRecord({ id: 'v-03', locationName: 'Campus',     aqi: 82,  durationMinutes: 300, category: 'Moderate' }),
    makeRecord({ id: 'v-04', locationName: 'Restaurant', aqi: 65,  durationMinutes: 60,  category: 'Moderate' }),
  ];

  const summary = buildDailyExposureSummary('2026-09-25', records);

  test('totalExposure = sum of all visit exposures', () => {
    const expected = (45*240) + (110*60) + (82*300) + (65*60);
    // = 10800 + 6600 + 24600 + 3900 = 45900
    expect(summary.totalExposure).toBe(expected);
  });

  test('duration-weighted averageAQI is correct', () => {
    // Σ(AQI × dur) = 45*240 + 110*60 + 82*300 + 65*60 = 45900
    // Σ(dur)       = 240 + 60 + 300 + 60 = 660
    // avg = 45900 / 660 ≈ 69.5
    const expected = Math.round((45900 / 660) * 10) / 10;
    expect(summary.averageAQI).toBe(expected);
  });

  test('highestAQI = 110 (Train)', () => {
    expect(summary.highestAQI).toBe(110);
    expect(summary.highestAQILocation).toBe('Train');
  });

  test('highestExposureLocation = Campus (82 × 300 = 24600)', () => {
    expect(summary.highestExposureLocation).toBe('Campus');
  });

  test('totalMinutesTracked = 660', () => {
    expect(summary.totalMinutesTracked).toBe(660);
  });

  test('numberOfLocations = 4', () => {
    expect(summary.numberOfLocations).toBe(4);
  });

  test('categoryBreakdown contains Good and Moderate', () => {
    expect(summary.categoryBreakdown['Good']).toBe(240);
    expect(summary.categoryBreakdown['Moderate']).toBe(360); // 300 + 60
    expect(summary.categoryBreakdown['Unhealthy for Sensitive Groups']).toBe(60);
  });

  test('locationBreakdown has an entry for each location', () => {
    const names = summary.locationBreakdown.map((l) => l.locationName);
    expect(names).toContain('Home');
    expect(names).toContain('Train');
    expect(names).toContain('Campus');
    expect(names).toContain('Restaurant');
  });
});

describe('buildDailyExposureSummary — date field', () => {
  test('summary.date matches the input date', () => {
    const records = [makeRecord({ aqi: 50, durationMinutes: 60, category: 'Good' })];
    const summary = buildDailyExposureSummary('2026-09-24', records);
    expect(summary.date).toBe('2026-09-24');
  });
});
