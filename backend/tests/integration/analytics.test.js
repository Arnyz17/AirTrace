/**
 * analytics.test.js
 *
 * Integration tests for analytics API endpoints:
 *   GET /api/analytics/overview
 *   GET /api/analytics/daily/:date
 */

'use strict';

const request          = require('supertest');
const app              = require('../../src/app');
const { setupTestDb }  = require('../helpers/dbHelper');

beforeAll(() => {
  setupTestDb();
});

describe('GET /api/analytics/overview', () => {
  test('returns 200 with complete overview payload', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDaysTracked).toBe(3);
    expect(res.body.data.totalTrackedHours).toBeGreaterThan(0);
    expect(res.body.data.averageDailyExposure).toBeGreaterThan(0);
    expect(res.body.data.mostVisitedLocation).toBeDefined();
    expect(res.body.data.highestAQILocation).toBeDefined();
    expect(Array.isArray(res.body.data.availableDates)).toBe(true);
  });
});

describe('GET /api/analytics/daily/:date', () => {
  test('returns 200 with per-day analytics for valid date', async () => {
    const res = await request(app).get('/api/analytics/daily/2026-09-25');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.date).toBe('2026-09-25');
    expect(res.body.data.totalMinutesTracked).toBe(660);
    expect(res.body.data.locationRankings).toBeDefined();
    expect(Array.isArray(res.body.data.locationRankings.byExposure)).toBe(true);
    expect(res.body.data.locationRankings.byExposure[0].locationName).toBe('Campus');
  });

  test('returns 404 for valid date format with no data', async () => {
    const res = await request(app).get('/api/analytics/daily/2020-01-01');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DATE_NOT_FOUND');
  });

  test('returns 400 for invalid date format', async () => {
    const res = await request(app).get('/api/analytics/daily/invalid-date');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_DATE_FORMAT');
  });
});
