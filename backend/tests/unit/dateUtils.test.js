/**
 * dateUtils.test.js
 *
 * Unit tests for date utility helpers.
 */

'use strict';

const {
  parseISODate,
  deriveDurationMinutes,
  extractDate,
  isValidDateString,
} = require('../../src/utils/dateUtils');

describe('parseISODate', () => {
  test('parses valid ISO datetime', () => {
    const d = parseISODate('2026-09-25T10:00:00');
    expect(d).toBeInstanceOf(Date);
    expect(isNaN(d.getTime())).toBe(false);
  });

  test('returns null for invalid string', () => {
    expect(parseISODate('not-a-date')).toBeNull();
  });

  test('returns null for null input', () => {
    expect(parseISODate(null)).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseISODate('')).toBeNull();
  });
});

describe('deriveDurationMinutes', () => {
  test('calculates 60 minutes for 1-hour range', () => {
    expect(deriveDurationMinutes('2026-09-25T10:00:00', '2026-09-25T11:00:00')).toBe(60);
  });

  test('calculates 240 minutes for 4-hour range', () => {
    expect(deriveDurationMinutes('2026-09-25T08:00:00', '2026-09-25T12:00:00')).toBe(240);
  });

  test('returns 0 for same start and end time', () => {
    expect(deriveDurationMinutes('2026-09-25T10:00:00', '2026-09-25T10:00:00')).toBe(0);
  });

  test('returns null for end before start', () => {
    expect(deriveDurationMinutes('2026-09-25T13:00:00', '2026-09-25T10:00:00')).toBeNull();
  });

  test('returns null for invalid startTime', () => {
    expect(deriveDurationMinutes('bad', '2026-09-25T11:00:00')).toBeNull();
  });

  test('returns null for invalid endTime', () => {
    expect(deriveDurationMinutes('2026-09-25T10:00:00', 'bad')).toBeNull();
  });
});

describe('extractDate', () => {
  test('extracts date from datetime string', () => {
    expect(extractDate('2026-09-25T10:00:00')).toBe('2026-09-25');
  });

  test('returns null for invalid input', () => {
    expect(extractDate('not-valid')).toBeNull();
  });

  test('returns null for null', () => {
    expect(extractDate(null)).toBeNull();
  });
});

describe('isValidDateString', () => {
  test('accepts valid date', ()       => expect(isValidDateString('2026-09-25')).toBe(true));
  test('rejects non-date string', ()  => expect(isValidDateString('hello')).toBe(false));
  test('rejects wrong format', ()     => expect(isValidDateString('25-09-2026')).toBe(false));
  test('rejects impossible month', () => expect(isValidDateString('2026-13-01')).toBe(false));
  test('rejects empty string', ()     => expect(isValidDateString('')).toBe(false));
  test('rejects null', ()             => expect(isValidDateString(null)).toBe(false));
});
