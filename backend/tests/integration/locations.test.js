/**
 * locations.test.js
 *
 * Integration tests for:
 *   GET /api/locations/:date
 *   GET /api/aqi/:date
 *   GET /api/aqi/categories
 */

'use strict';

const request = require('supertest');
const app     = require('../../src/app');
const { setupTestDb } = require('../helpers/dbHelper');

beforeAll(() => {
  setupTestDb();
});

// ─── GET /api/locations/:date ─────────────────────────────────────────────────

describe('GET /api/locations/:date — valid date', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/locations/2026-09-26');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('data.count matches locations length', () => {
    expect(res.body.data.count).toBe(res.body.data.locations.length);
  });

  test('has 4 locations for 2026-09-26', () => {
    expect(res.body.data.locations).toHaveLength(4);
  });

  test('each location has expected fields', () => {
    for (const loc of res.body.data.locations) {
      expect(loc.id).toBeDefined();
      expect(loc.locationName).toBeDefined();
      expect(typeof loc.latitude).toBe('number');
      expect(typeof loc.longitude).toBe('number');
      expect(loc.startTime).toBeDefined();
      expect(loc.endTime).toBeDefined();
      expect(typeof loc.durationMinutes).toBe('number');
      expect(loc.aqi).not.toBeNull();
      expect(loc.aqiCategory).not.toBeNull();
    }
  });

  test('Downtown location has AQI 125 and correct category', () => {
    const downtown = res.body.data.locations.find((l) => l.locationName === 'Downtown');
    expect(downtown).toBeDefined();
    expect(downtown.aqi).toBe(125);
    expect(downtown.aqiCategory).toBe('Unhealthy for Sensitive Groups');
  });
});

describe('GET /api/locations/:date — invalid date', () => {
  test('returns 400 for bad date format', async () => {
    const res = await request(app).get('/api/locations/baddate');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/locations/:date — nonexistent date', () => {
  test('returns 404 for a valid date with no data', async () => {
    const res = await request(app).get('/api/locations/2020-01-01');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/aqi/:date ───────────────────────────────────────────────────────

describe('GET /api/aqi/:date — valid date', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/aqi/2026-09-25');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('data.readings is an array', () => {
    expect(Array.isArray(res.body.data.readings)).toBe(true);
  });

  test('has 4 AQI readings for 2026-09-25', () => {
    expect(res.body.data.readings).toHaveLength(4);
  });

  test('each reading has aqi, category, and source', () => {
    for (const r of res.body.data.readings) {
      expect(typeof r.aqi).toBe('number');
      expect(typeof r.category).toBe('string');
      expect(r.source).toBe('mock');
    }
  });
});

describe('GET /api/aqi/:date — invalid date', () => {
  test('returns 400', async () => {
    const res = await request(app).get('/api/aqi/not-valid');
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/aqi/:date — nonexistent date', () => {
  test('returns 404', async () => {
    const res = await request(app).get('/api/aqi/2020-01-01');
    expect(res.statusCode).toBe(404);
  });
});

// ─── GET /api/aqi/categories ──────────────────────────────────────────────────

describe('GET /api/aqi/categories', () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get('/api/aqi/categories');
  });

  test('returns 200', () => {
    expect(res.statusCode).toBe(200);
  });

  test('returns 6 categories', () => {
    expect(res.body.data.categories).toHaveLength(6);
  });

  test('first category is Good', () => {
    expect(res.body.data.categories[0].category).toBe('Good');
  });

  test('each category has min, max, category, color fields', () => {
    for (const c of res.body.data.categories) {
      expect(typeof c.min).toBe('number');
      expect(typeof c.max).toBe('number');
      expect(typeof c.category).toBe('string');
      expect(typeof c.color).toBe('string');
    }
  });
});
