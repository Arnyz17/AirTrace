/**
 * mockLocations.js
 *
 * Realistic sample LocationVisit records used for development and testing.
 *
 * These records are FICTIONAL — they do not represent real people or real
 * personal location history.  They are designed to:
 *   • Cover three calendar days (2026-09-24 … 2026-09-26).
 *   • Include a variety of AQI values across the full category spectrum.
 *   • Include both short visits (≥ 30 min) and long visits (≥ 300 min).
 *   • Include multiple visits per day.
 *   • Include repeated locations (e.g. "Home" appears on every day).
 *
 * Duration is pre-computed from startTime/endTime for convenience.
 * The processing pipeline also validates and can re-derive duration from
 * the timestamps if needed.
 *
 * Coordinates are in the New Jersey / New York area (fictional exact spots).
 */

'use strict';

const mockLocationVisits = [
  // =========================================================================
  // 2026-09-24
  // =========================================================================
  {
    id: 'visit-2024-01',
    locationName: 'Home',
    latitude: 40.7128,
    longitude: -74.0060,
    startTime: '2026-09-24T06:00:00',
    endTime: '2026-09-24T14:00:00',
    durationMinutes: 480,
    date: '2026-09-24',
  },
  {
    id: 'visit-2024-02',
    locationName: 'Train',
    latitude: 40.7484,
    longitude: -73.9967,
    startTime: '2026-09-24T14:00:00',
    endTime: '2026-09-24T15:00:00',
    durationMinutes: 60,
    date: '2026-09-24',
  },
  {
    id: 'visit-2024-03',
    locationName: 'Office',
    latitude: 40.7549,
    longitude: -73.9840,
    startTime: '2026-09-24T15:00:00',
    endTime: '2026-09-24T21:00:00',
    durationMinutes: 360,
    date: '2026-09-24',
  },
  {
    id: 'visit-2024-04',
    locationName: 'Gym',
    latitude: 40.7580,
    longitude: -73.9855,
    startTime: '2026-09-24T21:00:00',
    endTime: '2026-09-24T22:00:00',
    durationMinutes: 60,
    date: '2026-09-24',
  },

  // =========================================================================
  // 2026-09-25
  // =========================================================================
  {
    id: 'visit-2025-01',
    locationName: 'Home',
    latitude: 40.7128,
    longitude: -74.0060,
    startTime: '2026-09-25T08:00:00',
    endTime: '2026-09-25T12:00:00',
    durationMinutes: 240,
    date: '2026-09-25',
  },
  {
    id: 'visit-2025-02',
    locationName: 'Train',
    latitude: 40.7484,
    longitude: -73.9967,
    startTime: '2026-09-25T12:00:00',
    endTime: '2026-09-25T13:00:00',
    durationMinutes: 60,
    date: '2026-09-25',
  },
  {
    id: 'visit-2025-03',
    locationName: 'Campus',
    latitude: 40.7440,
    longitude: -74.0247,
    startTime: '2026-09-25T13:00:00',
    endTime: '2026-09-25T18:00:00',
    durationMinutes: 300,
    date: '2026-09-25',
  },
  {
    id: 'visit-2025-04',
    locationName: 'Restaurant',
    latitude: 40.7505,
    longitude: -73.9934,
    startTime: '2026-09-25T18:00:00',
    endTime: '2026-09-25T19:00:00',
    durationMinutes: 60,
    date: '2026-09-25',
  },

  // =========================================================================
  // 2026-09-26
  // =========================================================================
  {
    id: 'visit-2026-01',
    locationName: 'Home',
    latitude: 40.7128,
    longitude: -74.0060,
    startTime: '2026-09-26T07:00:00',
    endTime: '2026-09-26T12:00:00',
    durationMinutes: 300,
    date: '2026-09-26',
  },
  {
    id: 'visit-2026-02',
    locationName: 'Campus',
    latitude: 40.7440,
    longitude: -74.0247,
    startTime: '2026-09-26T12:00:00',
    endTime: '2026-09-26T18:00:00',
    durationMinutes: 360,
    date: '2026-09-26',
  },
  {
    id: 'visit-2026-03',
    locationName: 'Downtown',
    latitude: 40.7127,
    longitude: -74.0059,
    startTime: '2026-09-26T18:00:00',
    endTime: '2026-09-26T19:30:00',
    durationMinutes: 90,
    date: '2026-09-26',
  },
  {
    id: 'visit-2026-04',
    locationName: 'Park',
    latitude: 40.7812,
    longitude: -73.9665,
    startTime: '2026-09-26T19:30:00',
    endTime: '2026-09-26T21:00:00',
    durationMinutes: 90,
    date: '2026-09-26',
  },
];

module.exports = { mockLocationVisits };
