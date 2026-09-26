/**
 * validation.test.js
 *
 * Unit tests for src/utils/validation.js
 *
 * Validation functions now return { code, message } on failure (not a plain
 * string).  This test suite verifies both the code and message fields.
 */

'use strict';

process.env.NODE_ENV = 'test';

const { validateLocationVisit, validateDateParam } = require('../../src/utils/validation');
const { ERROR_CODES } = require('../../src/errors/errorCodes');

// ─── validateLocationVisit ────────────────────────────────────────────────────

describe('validateLocationVisit — valid input', () => {
  const valid = {
    locationName: 'Home',
    latitude:     40.7128,
    longitude:    -74.006,
    startTime:    '2026-09-25T08:00:00',
    endTime:      '2026-09-25T12:00:00',
    durationMinutes: 240,
  };

  test('returns null for a fully valid visit', () => {
    expect(validateLocationVisit(valid)).toBeNull();
  });

  test('accepts visit without durationMinutes (optional field)', () => {
    const { durationMinutes, ...rest } = valid;
    expect(validateLocationVisit(rest)).toBeNull();
  });

  test('accepts visit without aqi (optional field)', () => {
    expect(validateLocationVisit({ ...valid, aqi: undefined })).toBeNull();
  });
});

describe('validateLocationVisit — missing required fields', () => {
  const base = {
    locationName: 'Home',
    latitude: 40.7128, longitude: -74.006,
    startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
  };

  test('rejects null visit', () => {
    const err = validateLocationVisit(null);
    expect(err).not.toBeNull();
    expect(err.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('rejects missing locationName', () => {
    const { locationName, ...rest } = base;
    const err = validateLocationVisit(rest);
    expect(err).not.toBeNull();
    expect(err.code).toBe(ERROR_CODES.INVALID_LOCATION_NAME);
  });

  test('rejects empty locationName', () => {
    const err = validateLocationVisit({ ...base, locationName: '   ' });
    expect(err.code).toBe(ERROR_CODES.INVALID_LOCATION_NAME);
  });

  test('rejects missing startTime', () => {
    const { startTime, ...rest } = base;
    const err = validateLocationVisit(rest);
    expect(err.code).toBe(ERROR_CODES.MISSING_REQUIRED_FIELD);
  });

  test('rejects missing endTime', () => {
    const { endTime, ...rest } = base;
    const err = validateLocationVisit(rest);
    expect(err.code).toBe(ERROR_CODES.MISSING_REQUIRED_FIELD);
  });
});

describe('validateLocationVisit — invalid coordinates', () => {
  const base = {
    locationName: 'Home',
    latitude: 40.7128, longitude: -74.006,
    startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
  };

  test('rejects latitude > 90', () => {
    const err = validateLocationVisit({ ...base, latitude: 91 });
    expect(err.code).toBe(ERROR_CODES.INVALID_COORDINATES);
  });

  test('rejects latitude < -90', () => {
    const err = validateLocationVisit({ ...base, latitude: -91 });
    expect(err.code).toBe(ERROR_CODES.INVALID_COORDINATES);
  });

  test('rejects longitude > 180', () => {
    const err = validateLocationVisit({ ...base, longitude: 181 });
    expect(err.code).toBe(ERROR_CODES.INVALID_COORDINATES);
  });

  test('rejects longitude < -180', () => {
    const err = validateLocationVisit({ ...base, longitude: -181 });
    expect(err.code).toBe(ERROR_CODES.INVALID_COORDINATES);
  });

  test('rejects NaN latitude', () => {
    const err = validateLocationVisit({ ...base, latitude: NaN });
    expect(err.code).toBe(ERROR_CODES.INVALID_COORDINATES);
  });
});

describe('validateLocationVisit — invalid timestamps', () => {
  const base = {
    locationName: 'Home',
    latitude: 40.7128, longitude: -74.006,
    startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
  };

  test('rejects invalid startTime string', () => {
    const err = validateLocationVisit({ ...base, startTime: 'not-a-date' });
    expect(err.code).toBe(ERROR_CODES.INVALID_TIMESTAMP);
  });

  test('rejects invalid endTime string', () => {
    const err = validateLocationVisit({ ...base, endTime: 'not-a-date' });
    expect(err.code).toBe(ERROR_CODES.INVALID_TIMESTAMP);
  });

  test('rejects endTime before startTime', () => {
    const err = validateLocationVisit({
      ...base,
      startTime: '2026-09-25T12:00:00',
      endTime:   '2026-09-25T08:00:00',
    });
    expect(err.code).toBe(ERROR_CODES.TIMESTAMP_ORDER_ERROR);
  });
});

describe('validateLocationVisit — invalid duration', () => {
  const base = {
    locationName: 'Home',
    latitude: 40.7128, longitude: -74.006,
    startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
  };

  test('rejects negative durationMinutes', () => {
    const err = validateLocationVisit({ ...base, durationMinutes: -1 });
    expect(err.code).toBe(ERROR_CODES.INVALID_DURATION);
  });

  test('rejects durationMinutes > 1440 (24 hours)', () => {
    const err = validateLocationVisit({ ...base, durationMinutes: 1441 });
    expect(err.code).toBe(ERROR_CODES.INVALID_DURATION);
  });

  test('rejects NaN durationMinutes', () => {
    const err = validateLocationVisit({ ...base, durationMinutes: NaN });
    expect(err.code).toBe(ERROR_CODES.INVALID_DURATION);
  });
});

describe('validateLocationVisit — invalid AQI', () => {
  const base = {
    locationName: 'Home',
    latitude: 40.7128, longitude: -74.006,
    startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
  };

  test('rejects AQI > 999', () => {
    const err = validateLocationVisit({ ...base, aqi: 1000 });
    expect(err.code).toBe(ERROR_CODES.INVALID_AQI);
  });

  test('rejects negative AQI', () => {
    const err = validateLocationVisit({ ...base, aqi: -1 });
    expect(err.code).toBe(ERROR_CODES.INVALID_AQI);
  });

  test('rejects NaN AQI', () => {
    const err = validateLocationVisit({ ...base, aqi: NaN });
    expect(err.code).toBe(ERROR_CODES.INVALID_AQI);
  });
});

// ─── validateDateParam ─────────────────────────────────────────────────────────

describe('validateDateParam', () => {
  test('accepts valid date string', () => {
    expect(validateDateParam('2026-09-25')).toBeNull();
  });

  test('rejects invalid format — no dashes', () => {
    const err = validateDateParam('20260925');
    expect(err.code).toBe(ERROR_CODES.INVALID_DATE_FORMAT);
  });

  test('rejects invalid format — slashes', () => {
    const err = validateDateParam('2026/09/25');
    expect(err.code).toBe(ERROR_CODES.INVALID_DATE_FORMAT);
  });

  test('rejects impossible calendar date', () => {
    // 2026-13-99 matches the regex but fails calendar check
    const err = validateDateParam('2026-13-99');
    expect(err).not.toBeNull();
  });

  test('rejects empty string', () => {
    const err = validateDateParam('');
    expect(err).not.toBeNull();
  });

  test('rejects null', () => {
    const err = validateDateParam(null);
    expect(err).not.toBeNull();
  });

  test('rejects the literal word "today" (not a date format)', () => {
    const err = validateDateParam('today');
    expect(err.code).toBe(ERROR_CODES.INVALID_DATE_FORMAT);
  });
});
