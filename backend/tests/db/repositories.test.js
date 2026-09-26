/**
 * repositories.test.js
 *
 * Unit / repository level integration tests for SQLite repositories:
 *   - locationVisitRepository
 *   - aqiReadingRepository
 *   - exposureRecordRepository
 */

'use strict';

const { setupTestDb }       = require('../helpers/dbHelper');
const locationVisitRepo  = require('../../src/db/repositories/locationVisitRepository');
const aqiReadingRepo     = require('../../src/db/repositories/aqiReadingRepository');
const exposureRecordRepo = require('../../src/db/repositories/exposureRecordRepository');

beforeEach(() => {
  setupTestDb();
});

describe('locationVisitRepository', () => {
  test('findByDate returns array of visits for existing date', () => {
    const visits = locationVisitRepo.findByDate('2026-09-25');
    expect(Array.isArray(visits)).toBe(true);
    expect(visits.length).toBe(4);
    expect(visits[0].locationName).toBeDefined();
  });

  test('findByDate returns empty array for non-existent date', () => {
    const visits = locationVisitRepo.findByDate('2099-01-01');
    expect(visits).toEqual([]);
  });

  test('insert adds a new location visit', () => {
    const newVisit = {
      id: 'test-visit-1',
      locationName: 'Test Park',
      latitude: 40.7,
      longitude: -74.0,
      startTime: '2026-09-25T10:00:00',
      endTime: '2026-09-25T11:00:00',
      durationMinutes: 60,
      date: '2026-09-25',
      aqi: 45,
      aqiCategory: 'Good',
    };
    locationVisitRepo.insert(newVisit);

    const visits = locationVisitRepo.findByDate('2026-09-25');
    expect(visits.length).toBe(5);
    const inserted = visits.find((v) => v.id === 'test-visit-1');
    expect(inserted).toBeDefined();
    expect(inserted.locationName).toBe('Test Park');
  });

  test('getAvailableDates returns sorted distinct dates', () => {
    const dates = locationVisitRepo.getAvailableDates();
    expect(Array.isArray(dates)).toBe(true);
    expect(dates).toContain('2026-09-25');
    expect(dates).toContain('2026-09-26');
  });
});

describe('aqiReadingRepository', () => {
  test('findByDate returns readings for date', () => {
    const readings = aqiReadingRepo.findByDate('2026-09-25');
    expect(Array.isArray(readings)).toBe(true);
    expect(readings.length).toBe(4);
  });

  test('insert adds reading and handles duplicates gracefully', () => {
    const reading = {
      id: 'test-aqi-1',
      locationName: 'Test Spot',
      date: '2026-09-25',
      timestamp: '2026-09-25T12:00:00',
      aqi: 55,
      category: 'Moderate',
      pollutant: 'PM2.5',
      source: 'mock',
    };
    aqiReadingRepo.insert(reading);
    const readings = aqiReadingRepo.findByDate('2026-09-25');
    expect(readings.length).toBe(5);
  });
});

describe('exposureRecordRepository', () => {
  test('findByDate returns records for date', () => {
    const records = exposureRecordRepo.findByDate('2026-09-25');
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(4);
  });

  test('insert adds record and calculate returns correctly', () => {
    const visitId = 'visit-123';
    locationVisitRepo.insert({
      id: visitId,
      locationName: 'Library',
      latitude: 40.71,
      longitude: -74.01,
      startTime: '2026-09-25T15:00:00',
      endTime: '2026-09-25T16:00:00',
      durationMinutes: 60,
      date: '2026-09-25',
      aqi: 40,
      aqiCategory: 'Good',
    });

    const record = {
      id: 'test-exp-1',
      visitId,
      locationName: 'Library',
      latitude: 40.71,
      longitude: -74.01,
      date: '2026-09-25',
      startTime: '2026-09-25T15:00:00',
      endTime: '2026-09-25T16:00:00',
      durationMinutes: 60,
      aqi: 40,
      category: 'Good',
      exposure: 2400,
    };
    exposureRecordRepo.insert(record);
    const records = exposureRecordRepo.findByDate('2026-09-25');
    expect(records.length).toBe(5);
  });
});
