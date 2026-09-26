/**
 * seed.js
 *
 * Deterministic database seeding script.
 *
 * Populates the database with realistic fictional sample data covering
 * three calendar days and multiple locations.  The data is fixed so that:
 *   - API responses are predictable and can be verified manually.
 *   - Integration tests can assert on specific values.
 *   - Demos are consistent regardless of when the server is run.
 *
 * Usage:
 *   npm run seed
 *   node src/db/seed.js
 *
 * The seed process:
 *   1. Clears all existing rows (in dependency order).
 *   2. Inserts location visits from the mock data module.
 *   3. Looks up AQI for each visit using MockAQIDataProvider.
 *   4. Calculates exposure (AQI × durationMinutes).
 *   5. Persists visits, AQI readings, and exposure records in a transaction.
 *
 * DO NOT use real personal location data in this script.
 */

'use strict';

const { randomUUID } = require('crypto');

// Initialise DB before importing repositories (schema may not exist yet)
const { getDatabase }      = require('./database');
const locationVisitRepo    = require('./repositories/locationVisitRepository');
const aqiReadingRepo       = require('./repositories/aqiReadingRepository');
const exposureRecordRepo   = require('./repositories/exposureRecordRepository');
const { mockLocationVisits }  = require('../data/mockLocations');
const { mockAQIDataProvider } = require('../providers/MockAQIDataProvider');
const { calculateVisitExposure } = require('../services/exposureService');

/**
 * Run the full seed process inside a single database transaction.
 * Wrapping everything in a transaction makes the seed atomic — either all
 * rows are written or none are (in case of an error mid-seed).
 *
 * @returns {{ visits: number, aqiReadings: number, exposureRecords: number }}
 */
function seedDatabase() {
  const db = getDatabase();

  // All inserts happen inside one transaction for atomicity and performance.
  const runSeed = db.transaction(() => {
    // ── 1. Clear existing data (order matters due to foreign key constraints) ─
    exposureRecordRepo.deleteAll();
    aqiReadingRepo.deleteAll();
    locationVisitRepo.deleteAll();

    const aqiReadingsSeen = new Set(); // prevent duplicate aqi_readings rows
    let visitCount        = 0;
    let aqiReadingCount   = 0;
    let exposureCount     = 0;

    // ── 2. Process each mock location visit ────────────────────────────────
    for (const raw of mockLocationVisits) {
      // Look up AQI for this visit using the provider abstraction
      const aqiResult = mockAQIDataProvider.getAQIForVisit(raw);

      const visit = {
        id:              raw.id,
        locationName:    raw.locationName,
        latitude:        raw.latitude,
        longitude:       raw.longitude,
        startTime:       raw.startTime,
        endTime:         raw.endTime,
        durationMinutes: raw.durationMinutes,
        date:            raw.date,
        aqi:             aqiResult ? aqiResult.aqi      : null,
        aqiCategory:     aqiResult ? aqiResult.category : null,
      };

      // ── 3. Insert location visit ────────────────────────────────────────
      locationVisitRepo.insert(visit);
      visitCount++;

      // ── 4. Insert AQI reading (once per date+location pair) ────────────
      if (aqiResult) {
        const aqiKey = `${raw.date}::${raw.locationName}`;
        if (!aqiReadingsSeen.has(aqiKey)) {
          aqiReadingsSeen.add(aqiKey);
          aqiReadingRepo.insert({
            id:           `aqi-${raw.date}-${raw.locationName.toLowerCase().replace(/\s+/g, '-')}`,
            locationName: raw.locationName,
            date:         raw.date,
            timestamp:    `${raw.date}T12:00:00`,
            aqi:          aqiResult.aqi,
            category:     aqiResult.category,
            pollutant:    'PM2.5',
            source:       'mock',
          });
          aqiReadingCount++;
        }

        // ── 5. Calculate and persist exposure record ─────────────────────
        const exposure = calculateVisitExposure(aqiResult.aqi, raw.durationMinutes);
        exposureRecordRepo.insert({
          id:              randomUUID(),
          visitId:         raw.id,
          locationName:    raw.locationName,
          latitude:        raw.latitude,
          longitude:       raw.longitude,
          date:            raw.date,
          startTime:       raw.startTime,
          endTime:         raw.endTime,
          durationMinutes: raw.durationMinutes,
          aqi:             aqiResult.aqi,
          category:        aqiResult.category,
          exposure,
        });
        exposureCount++;
      }
    }

    return { visits: visitCount, aqiReadings: aqiReadingCount, exposureRecords: exposureCount };
  });

  return runSeed();
}

// ── Run standalone ────────────────────────────────────────────────────────────
// When executed directly via `npm run seed`, print a summary.
// When imported as a module, seedDatabase() is called programmatically.

if (require.main === module) {
  try {
    console.log('\n🌱 AirTrace — Seeding database...');
    const result = seedDatabase();
    console.log(`\n✅ Seed complete:`);
    console.log(`   • Location visits   : ${result.visits}`);
    console.log(`   • AQI readings      : ${result.aqiReadings}`);
    console.log(`   • Exposure records  : ${result.exposureRecords}`);
    console.log('\n   Run `npm start` to start the server.');
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

module.exports = { seedDatabase };
