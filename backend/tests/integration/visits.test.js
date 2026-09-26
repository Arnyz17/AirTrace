/**
 * visits.test.js
 *
 * Integration tests for visit submission endpoint:
 *   POST /api/visits
 */

'use strict';

const request          = require('supertest');
const app              = require('../../src/app');
const { setupTestDb }  = require('../helpers/dbHelper');

beforeEach(() => {
  setupTestDb();
});

describe('POST /api/visits', () => {
  test('creates new visit with full pipeline processing (201 Created)', async () => {
    const payload = {
      locationName: 'Central Library',
      latitude: 40.752,
      longitude: -73.985,
      startTime: '2026-09-25T14:00:00',
      endTime: '2026-09-25T16:00:00',
    };

    const res = await request(app)
      .post('/api/visits')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit).toBeDefined();
    expect(res.body.data.visit.locationName).toBe('Central Library');
    expect(res.body.data.visit.durationMinutes).toBe(120);
    expect(res.body.data.exposureRecord).toBeDefined();
  });

  test('rejects visit with missing required fields (400 Bad Request)', async () => {
    const payload = {
      locationName: 'Central Library',
      latitude: 40.752,
      longitude: -73.985,
      // missing startTime and endTime
    };

    const res = await request(app)
      .post('/api/visits')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  test('rejects visit with invalid coordinates (400 Bad Request)', async () => {
    const payload = {
      locationName: 'Test Place',
      latitude: 190.0, // invalid
      longitude: -73.985,
      startTime: '2026-09-25T14:00:00',
      endTime: '2026-09-25T16:00:00',
    };

    const res = await request(app)
      .post('/api/visits')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_COORDINATES');
  });

  test('rejects visit where endTime is before startTime (400 Bad Request)', async () => {
    const payload = {
      locationName: 'Time Travel Spot',
      latitude: 40.752,
      longitude: -73.985,
      startTime: '2026-09-25T16:00:00',
      endTime: '2026-09-25T14:00:00',
    };

    const res = await request(app)
      .post('/api/visits')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TIMESTAMP_ORDER_ERROR');
  });
});
