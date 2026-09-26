/**
 * exposureService.test.js
 *
 * Unit tests for the exposure calculation engine.
 *
 * Tests verify:
 *   - Normal AQI × duration calculations
 *   - Zero duration edge case
 *   - Zero AQI edge case
 *   - Large values
 *   - Invalid input rejection
 *   - calculateExposureRecords batch processing
 */

'use strict';

const {
  calculateVisitExposure,
  calculateExposureRecords,
} = require('../../src/services/exposureService');

describe('calculateVisitExposure', () => {
  test('calculates exposure correctly for normal values', () => {
    expect(calculateVisitExposure(80, 60)).toBe(4800);
    expect(calculateVisitExposure(100, 120)).toBe(12000);
    expect(calculateVisitExposure(45, 240)).toBe(10800);
    expect(calculateVisitExposure(110, 60)).toBe(6600);
  });

  test('returns 0 for zero duration', () => {
    expect(calculateVisitExposure(80, 0)).toBe(0);
  });

  test('returns 0 for zero AQI', () => {
    expect(calculateVisitExposure(0, 60)).toBe(0);
  });

  test('returns 0 for both zero', () => {
    expect(calculateVisitExposure(0, 0)).toBe(0);
  });

  test('handles large values without overflow', () => {
    // AQI 300 × 1440 min (24 hours) = 432,000
    expect(calculateVisitExposure(300, 1440)).toBe(432000);
  });

  test('throws on negative AQI', () => {
    expect(() => calculateVisitExposure(-1, 60)).toThrow();
  });

  test('throws on negative duration', () => {
    expect(() => calculateVisitExposure(80, -10)).toThrow();
  });

  test('throws on NaN AQI', () => {
    expect(() => calculateVisitExposure(NaN, 60)).toThrow();
  });

  test('throws on NaN duration', () => {
    expect(() => calculateVisitExposure(80, NaN)).toThrow();
  });

  test('throws on infinite AQI', () => {
    expect(() => calculateVisitExposure(Infinity, 60)).toThrow();
  });

  test('throws on string inputs', () => {
    expect(() => calculateVisitExposure('80', 60)).toThrow();
    expect(() => calculateVisitExposure(80, '60')).toThrow();
  });
});

describe('calculateExposureRecords', () => {
  const baseVisit = {
    id:              'v-001',
    locationName:    'Campus',
    latitude:        40.744,
    longitude:       -74.025,
    date:            '2026-09-25',
    startTime:       '2026-09-25T10:00:00',
    endTime:         '2026-09-25T13:00:00',
    durationMinutes: 180,
    aqi:             82,
    aqiCategory:     'Moderate',
  };

  test('returns an ExposureRecord for a valid visit', () => {
    const records = calculateExposureRecords([baseVisit]);
    expect(records).toHaveLength(1);
    expect(records[0].visitId).toBe('v-001');
    expect(records[0].exposure).toBe(82 * 180); // 14760
    expect(records[0].category).toBe('Moderate');
  });

  test('skips visits with null AQI', () => {
    const noAQIVisit = { ...baseVisit, aqi: null };
    const records    = calculateExposureRecords([noAQIVisit]);
    expect(records).toHaveLength(0);
  });

  test('skips visits with undefined AQI', () => {
    const { aqi, ...noAQIVisit } = baseVisit;
    const records = calculateExposureRecords([noAQIVisit]);
    expect(records).toHaveLength(0);
  });

  test('processes multiple visits correctly', () => {
    const visits = [
      { ...baseVisit, id: 'v-001', aqi: 45,  durationMinutes: 240 },
      { ...baseVisit, id: 'v-002', aqi: 110, durationMinutes: 60  },
      { ...baseVisit, id: 'v-003', aqi: 82,  durationMinutes: 300 },
    ];
    const records = calculateExposureRecords(visits);
    expect(records).toHaveLength(3);
    expect(records[0].exposure).toBe(45  * 240); // 10800
    expect(records[1].exposure).toBe(110 * 60);  // 6600
    expect(records[2].exposure).toBe(82  * 300); // 24600
  });

  test('returns empty array for empty input', () => {
    expect(calculateExposureRecords([])).toEqual([]);
  });

  test('assigns AQI category when aqiCategory is missing from visit', () => {
    const { aqiCategory, ...visitNoCategory } = baseVisit;
    const records = calculateExposureRecords([visitNoCategory]);
    expect(records[0].category).toBe('Moderate'); // derived from AQI 82
  });
});
