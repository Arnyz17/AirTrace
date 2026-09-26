/**
 * exposure.test.js
 *
 * Integration tests for exposure API endpoints:
 *   GET /api/exposure/today
 *   GET /api/exposure/history
 *   GET /api/exposure/:date
 */

'use strict';

const request = require('supertest');
const app     = require('../../src/app');
const { MOCK_LATEST_DATE } = require('../../src/config/constants');
const { setupTestDb }      = require('../helpers/dbHelper');

beforeAll(() => {
  setupTestDb();
});

// ─── GET /api/exposure/today ──────────────────────────────────────────────────

describe('GET /api/exposure/today', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/exposure/today');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('success is true', () => {
    expect(res.body.success).toBe(true);
  });

  test('data.date equals MOCK_LATEST_DATE', () => {
    expect(res.body.data.date).toBe(MOCK_LATEST_DATE);
  });

  test('summary is present', () => {
    expect(res.body.data.summary).toBeDefined();
  });

  test('summary.totalExposure is a positive number', () => {
    expect(res.body.data.summary.totalExposure).toBeGreaterThan(0);
  });

  test('summary.averageAQI is a number', () => {
    expect(typeof res.body.data.summary.averageAQI).toBe('number');
  });

  test('summary.highestAQI is present', () => {
    expect(res.body.data.summary.highestAQI).toBeGreaterThan(0);
  });

  test('summary.totalMinutesTracked is positive', () => {
    expect(res.body.data.summary.totalMinutesTracked).toBeGreaterThan(0);
  });

  test('exposureFormula is included in the response', () => {
    expect(typeof res.body.data.exposureFormula).toBe('string');
  });
});

// ─── GET /api/exposure/history ────────────────────────────────────────────────

describe('GET /api/exposure/history', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/exposure/history');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('data.summaries is an array', () => {
    expect(Array.isArray(res.body.data.summaries)).toBe(true);
  });

  test('data.count matches summaries length', () => {
    expect(res.body.data.count).toBe(res.body.data.summaries.length);
  });

  test('has at least 3 days of history', () => {
    expect(res.body.data.summaries.length).toBeGreaterThanOrEqual(3);
  });

  test('each summary has a date and totalExposure', () => {
    for (const s of res.body.data.summaries) {
      expect(s.date).toBeDefined();
      expect(typeof s.totalExposure).toBe('number');
    }
  });

  test('history entries do NOT include full exposureRecords array (compact)', () => {
    for (const s of res.body.data.summaries) {
      expect(s.exposureRecords).toBeUndefined();
    }
  });
});

// ─── GET /api/exposure/:date ──────────────────────────────────────────────────

describe('GET /api/exposure/:date — valid date with data', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/exposure/2026-09-25');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('data.date is "2026-09-25"', () => {
    expect(res.body.data.date).toBe('2026-09-25');
  });

  test('summary.highestAQI is 110 (Train)', () => {
    expect(res.body.data.summary.highestAQI).toBe(110);
    expect(res.body.data.summary.highestAQILocation).toBe('Train');
  });

  test('summary.highestExposureLocation is Campus', () => {
    // Campus: 82 × 300 = 24600 vs Train: 110 × 60 = 6600
    expect(res.body.data.summary.highestExposureLocation).toBe('Campus');
  });

  test('summary.totalMinutesTracked = 660', () => {
    // 240 + 60 + 300 + 60 = 660
    expect(res.body.data.summary.totalMinutesTracked).toBe(660);
  });

  test('summary.numberOfLocations = 4', () => {
    expect(res.body.data.summary.numberOfLocations).toBe(4);
  });

  test('locations array is present', () => {
    expect(Array.isArray(res.body.data.locations)).toBe(true);
  });

  test('each location has aqi, durationMinutes, and aqiCategory', () => {
    for (const loc of res.body.data.locations) {
      expect(typeof loc.aqi).toBe('number');
      expect(typeof loc.durationMinutes).toBe('number');
      expect(typeof loc.aqiCategory).toBe('string');
    }
  });

  test('categoryBreakdown is present in summary', () => {
    expect(res.body.data.summary.categoryBreakdown).toBeDefined();
  });

  test('locationBreakdown is present in summary', () => {
    expect(Array.isArray(res.body.data.summary.locationBreakdown)).toBe(true);
  });
});

describe('GET /api/exposure/:date — valid date with no data', () => {
  test('returns 404 for a valid-format date with no data', async () => {
    const res = await request(app).get('/api/exposure/2020-01-01');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBeDefined();
  });
});

describe('GET /api/exposure/:date — invalid date format', () => {
  test('returns 400 for "notadate"', async () => {
    const res = await request(app).get('/api/exposure/notadate');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for "09-25-2026" (wrong format)', async () => {
    const res = await request(app).get('/api/exposure/09-25-2026');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for "2026-13-99" (impossible date)', async () => {
    const res = await request(app).get('/api/exposure/2026-13-99');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/exposure/today — route ordering (not treated as :date)', () => {
  test('"today" is NOT routed to :date handler', async () => {
    // If routing is correct, /exposure/today returns 200 data (not 400 validation error)
    const res = await request(app).get('/api/exposure/today');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.date).toBe(MOCK_LATEST_DATE);
  });
});

describe('GET /api/exposure/2026-09-24 — third mock day', () => {
  test('returns 200 with valid summary', async () => {
    const res = await request(app).get('/api/exposure/2026-09-24');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary.totalMinutesTracked).toBe(960); // 480+60+360+60
  });
});
