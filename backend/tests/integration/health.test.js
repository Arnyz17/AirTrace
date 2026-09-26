/**
 * health.test.js
 *
 * Integration tests for GET /api/health
 */

'use strict';

const request = require('supertest');
const app     = require('../../src/app');

describe('GET /api/health', () => {
  test('returns 200 with success: true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('response has status "ok"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.data.status).toBe('ok');
  });

  test('response has uptime as a number', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.data.uptime).toBe('number');
  });

  test('response has a timestamp string', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.data.timestamp).toBe('string');
    // Verify it is a parseable ISO date
    expect(isNaN(new Date(res.body.data.timestamp).getTime())).toBe(false);
  });

  test('response Content-Type is application/json', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('GET / (root)', () => {
  test('returns 200 with endpoint list', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.endpoints)).toBe(true);
  });
});

describe('Unknown route', () => {
  test('returns 404 JSON for unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
