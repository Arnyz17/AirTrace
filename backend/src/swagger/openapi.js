/**
 * openapi.js
 *
 * OpenAPI 3.0 specification for the AirTrace Backend API.
 *
 * Served as interactive documentation at GET /api/docs by swagger-ui-express.
 * The frontend developer can explore all endpoints, see request/response
 * schemas, and run live requests directly from the browser.
 */

'use strict';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title:       'AirTrace Backend API',
    version:     '1.1.0',
    description: `
**AirTrace** is a Personal Air Quality Exposure Tracker.

This API computes an **Exposure Index** (AQI × durationMinutes) for each location
a person visited during their day and provides daily and historical analytics.

> ⚠️ The Exposure Index is a **project-defined metric**, NOT a medically validated
> measure of inhaled pollution.

### Data Pipeline
\`\`\`
Location Visit
      ↓ validate
      ↓ AQI lookup (MockAQIDataProvider)
      ↓ exposure = AQI × durationMinutes
      ↓ aggregate → DailyExposureSummary
      ↓ persist to SQLite
      ↓ REST API
\`\`\`
    `,
    contact: { name: 'AirTrace Team' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development server' },
  ],
  tags: [
    { name: 'Health',    description: 'Server and database status' },
    { name: 'Exposure',  description: 'Exposure Index calculations' },
    { name: 'Locations', description: 'Location visit data for map rendering' },
    { name: 'AQI',       description: 'Air Quality Index data and categories' },
    { name: 'Analytics', description: 'Higher-level analytics and statistics' },
    { name: 'Visits',    description: 'Submit new location visits' },
  ],
  paths: {

    // ── /api/health ─────────────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags:    ['Health'],
        summary: 'Server and database health check',
        responses: {
          200: {
            description: 'Server is running',
            content: { 'application/json': { example: {
              success: true,
              data: {
                status:    'ok',
                uptime:    42,
                timestamp: '2026-09-26T10:00:00.000Z',
                version:   '1.1.0',
                service:   'AirTrace Backend API',
                environment: 'development',
                database: { connected: true, path: './data/airtrace.db' },
              },
            }}},
          },
        },
      },
    },

    // ── /api/exposure/today ──────────────────────────────────────────────────
    '/api/exposure/today': {
      get: {
        tags:    ['Exposure'],
        summary: 'Full exposure detail for the most recent date (2026-09-26)',
        description: '"Today" is defined as the most recent date in the dataset, not the computer clock.',
        responses: {
          200: {
            description: 'Exposure summary for the most recent date',
            content: { 'application/json': { example: {
              success: true,
              data: {
                note: 'Returns the most recent available date in the dataset.',
                date: '2026-09-26',
                exposureFormula: 'Exposure Index = AQI × Duration (minutes).',
                summary: {
                  date: '2026-09-26', totalExposure: 63150, averageAQI: 67.7,
                  highestAQI: 125, highestAQILocation: 'Downtown',
                  highestExposureLocation: 'Campus',
                  totalMinutesTracked: 840, numberOfLocations: 4,
                },
              },
            }}},
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/exposure/history ────────────────────────────────────────────────
    '/api/exposure/history': {
      get: {
        tags:    ['Exposure'],
        summary: 'Compact daily summaries for all available dates',
        responses: {
          200: {
            description: 'List of daily exposure summaries',
            content: { 'application/json': { example: {
              success: true,
              data: {
                availableDates: ['2026-09-24', '2026-09-25', '2026-09-26'],
                count: 3,
                summaries: [
                  { date: '2026-09-24', totalExposure: 64920, averageAQI: 57.3 },
                ],
              },
            }}},
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/exposure/{date} ─────────────────────────────────────────────────
    '/api/exposure/{date}': {
      get: {
        tags:    ['Exposure'],
        summary: 'Full exposure detail for a specific date',
        parameters: [{ $ref: '#/components/parameters/dateParam' }],
        responses: {
          200: {
            description: 'Full exposure summary with per-visit records',
            content: { 'application/json': { example: {
              success: true,
              data: {
                date: '2026-09-25',
                summary: {
                  totalExposure: 45900, averageAQI: 69.5,
                  highestAQI: 110, highestAQILocation: 'Train',
                  highestExposureLocation: 'Campus',
                  totalMinutesTracked: 660, numberOfLocations: 4,
                  exposureRecords: [
                    { visitId: 'visit-2025-01', locationName: 'Home', aqi: 45, durationMinutes: 240, exposure: 10800 },
                  ],
                },
              },
            }}},
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/locations/{date} ────────────────────────────────────────────────
    '/api/locations/{date}': {
      get: {
        tags:    ['Locations'],
        summary: 'AQI-annotated location visits for a date (for map rendering)',
        parameters: [{ $ref: '#/components/parameters/dateParam' }],
        responses: {
          200: {
            description: 'List of location visits with AQI and category',
            content: { 'application/json': { example: {
              success: true,
              data: {
                date: '2026-09-26', count: 4,
                locations: [
                  {
                    id: 'visit-2026-01', locationName: 'Home',
                    latitude: 40.7128, longitude: -74.006,
                    startTime: '2026-09-26T07:00:00', endTime: '2026-09-26T12:00:00',
                    durationMinutes: 300, aqi: 50, aqiCategory: 'Good',
                  },
                ],
              },
            }}},
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/aqi/categories ──────────────────────────────────────────────────
    '/api/aqi/categories': {
      get: {
        tags:    ['AQI'],
        summary: 'AQI category reference table with colour codes',
        description: 'Use the `color` field to render map legends and chart colours.',
        responses: {
          200: {
            description: 'All 6 AQI categories',
            content: { 'application/json': { example: {
              success: true,
              data: {
                categories: [
                  { min: 0,   max: 50,   category: 'Good',     color: '#00e400' },
                  { min: 51,  max: 100,  category: 'Moderate', color: '#ffff00' },
                  { min: 101, max: 150,  category: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
                  { min: 151, max: 200,  category: 'Unhealthy', color: '#ff0000' },
                  { min: 201, max: 300,  category: 'Very Unhealthy', color: '#8f3f97' },
                  { min: 301, max: 9999, category: 'Hazardous', color: '#7e0023' },
                ],
                note: 'Source: US EPA AQI scale (simplified).',
              },
            }}},
          },
        },
      },
    },

    // ── /api/aqi/{date} ──────────────────────────────────────────────────────
    '/api/aqi/{date}': {
      get: {
        tags:    ['AQI'],
        summary: 'AQI readings for a specific date',
        parameters: [{ $ref: '#/components/parameters/dateParam' }],
        responses: {
          200: {
            description: 'AQI readings for the date',
            content: { 'application/json': { example: {
              success: true,
              data: {
                date: '2026-09-25', source: 'mock', count: 4,
                readings: [
                  { id: 'aqi-2026-09-25-home', locationName: 'Home', aqi: 45, category: 'Good', source: 'mock' },
                ],
              },
            }}},
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/analytics/overview ──────────────────────────────────────────────
    '/api/analytics/overview': {
      get: {
        tags:    ['Analytics'],
        summary: 'Aggregate analytics across all tracked dates',
        responses: {
          200: {
            description: 'Cross-date statistics',
            content: { 'application/json': { example: {
              success: true,
              data: {
                totalDaysTracked: 3,
                availableDates: ['2026-09-24', '2026-09-25', '2026-09-26'],
                totalTrackedMinutes: 2460,
                totalTrackedHours: 41,
                totalExposure: 173970,
                averageDailyExposure: 57990,
                overallAverageAQI: 64.3,
                bestDay:  { date: '2026-09-24', averageAQI: 57.3, totalExposure: 64920 },
                worstDay: { date: '2026-09-26', averageAQI: 69.5, totalExposure: 63150 },
                mostVisitedLocation:  { locationName: 'Home', totalMinutes: 1020 },
                highestAQILocation:   { locationName: 'Downtown', maxAQI: 125 },
                categoryDistribution: {
                  Good:     { minutes: 1110, percentage: 45.1 },
                  Moderate: { minutes: 1230, percentage: 50.0 },
                },
              },
            }}},
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/analytics/daily/{date} ──────────────────────────────────────────
    '/api/analytics/daily/{date}': {
      get: {
        tags:    ['Analytics'],
        summary: 'Detailed analytics for a single date',
        description: 'Includes category percentages, location rankings, and comparison to average.',
        parameters: [{ $ref: '#/components/parameters/dateParam' }],
        responses: {
          200: {
            description: 'Per-day analytics',
            content: { 'application/json': { example: {
              success: true,
              data: {
                date: '2026-09-25',
                totalExposure: 45900,
                totalMinutesTracked: 660,
                averageAQI: 69.5,
                categoryBreakdown: {
                  Good:     { minutes: 240, percentage: 36.4 },
                  Moderate: { minutes: 360, percentage: 54.5 },
                  'Unhealthy for Sensitive Groups': { minutes: 60, percentage: 9.1 },
                },
                locationRankings: {
                  byExposure: [
                    { rank: 1, locationName: 'Campus', totalExposure: 24600 },
                    { rank: 2, locationName: 'Home',   totalExposure: 10800 },
                  ],
                  byAQI: [
                    { rank: 1, locationName: 'Train', maxAQI: 110 },
                    { rank: 2, locationName: 'Campus', maxAQI: 82 },
                  ],
                },
                comparisonToAverage: {
                  allDaysAverageExposure: 57990,
                  delta: -12090,
                  deltaPercent: -20.8,
                  betterThanAverage: true,
                },
              },
            }}},
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── /api/visits ──────────────────────────────────────────────────────────
    '/api/visits': {
      post: {
        tags:    ['Visits'],
        summary: 'Submit a new location visit and run the full processing pipeline',
        description: `
Runs: **validate → AQI lookup → exposure calculation → persist to database**

The visit is stored immediately.  If AQI data is available for the location/date,
the Exposure Index is calculated and stored as well.

If no AQI data is found (the location or date is not in the mock dataset), the
visit is still stored but \`exposureRecord\` will be null.
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['locationName', 'latitude', 'longitude', 'startTime', 'endTime'],
                properties: {
                  locationName:    { type: 'string', example: 'Library' },
                  latitude:        { type: 'number', example: 40.752,  description: '-90 to 90' },
                  longitude:       { type: 'number', example: -73.985, description: '-180 to 180' },
                  startTime:       { type: 'string', example: '2026-09-25T14:00:00', description: 'ISO-8601 datetime' },
                  endTime:         { type: 'string', example: '2026-09-25T17:00:00', description: 'ISO-8601 datetime' },
                  durationMinutes: { type: 'integer', example: 180, description: 'Optional; derived from timestamps if omitted' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Visit stored and processed',
            content: { 'application/json': { example: {
              success: true,
              data: {
                visit: {
                  id: 'uuid', locationName: 'Home', latitude: 40.7128, longitude: -74.006,
                  startTime: '2026-09-25T08:00:00', endTime: '2026-09-25T12:00:00',
                  durationMinutes: 240, date: '2026-09-25', aqi: 45, aqiCategory: 'Good',
                },
                exposureRecord: {
                  id: 'uuid', visitId: 'uuid', locationName: 'Home',
                  aqi: 45, durationMinutes: 240, exposure: 10800, category: 'Good',
                },
                aqiAvailable: true,
              },
            }}},
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
  },

  components: {
    parameters: {
      dateParam: {
        name:        'date',
        in:          'path',
        required:    true,
        description: 'Date in YYYY-MM-DD format',
        schema:      { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-09-25' },
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid input',
        content: { 'application/json': { example: {
          success: false,
          error: {
            code:    'INVALID_DATE_FORMAT',
            message: 'date must be in YYYY-MM-DD format (e.g. 2026-09-25).',
            status:  400,
          },
        }}},
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { example: {
          success: false,
          error: {
            code:    'DATE_NOT_FOUND',
            message: 'No data found for date "2020-01-01". Available dates: 2026-09-24, 2026-09-25, 2026-09-26.',
            status:  404,
          },
        }}},
      },
    },
  },
};

module.exports = { openApiSpec };
