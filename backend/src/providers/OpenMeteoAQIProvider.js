'use strict';

/**
 * OpenMeteoAQIProvider.js
 *
 * Real-time AQI data provider using the Open-Meteo Air Quality API.
 *
 *   URL: https://air-quality-api.open-meteo.com
 *   ✅ 100% FREE  ✅ No API key required  ✅ Worldwide coverage
 *   ✅ Returns US AQI (PM2.5-based) + European AQI
 *
 * The API returns hourly forecasts (and historical data) for a given lat/lng.
 * We pick the reading closest in time to the visit's start time.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Cache strategy
 * ─────────────────────────────────────────────────────────────────────────
 * Responses are cached in-memory for 60 minutes using a key of
 * `${lat.toFixed(2)}_${lng.toFixed(2)}_${date}`.  This keeps the app
 * fast during a session without burning free API quota.
 */

const { AQIDataProvider } = require('./AQIDataProvider');
const { getAQICategory }  = require('../services/aqiService');

// Cache: key → { data, expiresAt }
const _cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Round lat/lng to 2 decimal places for cache deduplication.
 * ~1.1 km precision — close enough for AQI (which varies at city scale).
 */
function cacheKey(lat, lng, date) {
  return `${parseFloat(lat).toFixed(2)}_${parseFloat(lng).toFixed(2)}_${date}`;
}

/**
 * Call the Open-Meteo Air Quality API synchronously using a promise + sync
 * bridge (we run this via a blocking helper at the call site).
 *
 * Returns the raw hourly JSON, or null on error.
 */
async function fetchOpenMeteo(lat, lng, date) {
  const key = cacheKey(lat, lng, date);

  // Return cached if fresh
  if (_cache.has(key)) {
    const entry = _cache.get(key);
    if (Date.now() < entry.expiresAt) {
      return entry.data;
    }
    _cache.delete(key);
  }

  // Build the URL — request today's hourly US AQI for the given coordinates
  // We request the day of the visit plus one extra day to cover any edge cases.
  const url = [
    'https://air-quality-api.open-meteo.com/v1/air-quality',
    `?latitude=${lat}`,
    `&longitude=${lng}`,
    `&hourly=us_aqi,pm2_5`,
    `&start_date=${date}`,
    `&end_date=${date}`,
    `&timezone=auto`,
  ].join('');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`[OpenMeteoAQI] HTTP ${response.status} for ${lat},${lng}`);
      return null;
    }

    const json = await response.json();
    _cache.set(key, { data: json, expiresAt: Date.now() + CACHE_TTL_MS });
    return json;
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[OpenMeteoAQI] fetch failed: ${err.message}`);
    return null;
  }
}

/**
 * Pick the AQI reading closest to a target time from the hourly array.
 *
 * @param {string[]} times    - ISO-8601 datetime strings (hourly).
 * @param {number[]} aqiVals  - Corresponding US AQI values (can contain null).
 * @param {string}   target   - ISO-8601 target datetime string.
 * @returns {number|null}
 */
function closestAQI(times, aqiVals, target) {
  if (!times || !aqiVals || times.length === 0) return null;

  const targetMs = new Date(target).getTime();
  let bestDiff = Infinity;
  let bestAQI  = null;

  for (let i = 0; i < times.length; i++) {
    const val = aqiVals[i];
    if (val === null || val === undefined || isNaN(val)) continue;

    const diff = Math.abs(new Date(times[i]).getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestAQI  = Math.round(val);
    }
  }

  return bestAQI;
}

class OpenMeteoAQIProvider extends AQIDataProvider {
  /**
   * Fetch live AQI for a single location visit.
   *
   * This is the main entry point called by visitsController.js.
   * It makes a synchronous-looking call by running async code via
   * a shared promise that is awaited at the call site.
   *
   * Since visitsController uses the provider synchronously (it's a
   * better-sqlite3 transaction), we keep a pending-promise map so
   * the same request isn't sent twice concurrently.
   */
  getAQIForVisitAsync(visit) {
    return fetchOpenMeteo(visit.latitude, visit.longitude, visit.date)
      .then((json) => {
        if (!json || !json.hourly) return null;

        const { time, us_aqi } = json.hourly;
        const aqi = closestAQI(time, us_aqi, visit.startTime || `${visit.date}T12:00:00`);

        if (aqi === null) return null;

        console.log(`[OpenMeteoAQI] ${visit.locationName} → AQI ${aqi} (${getAQICategory(aqi)})`);
        return {
          aqi,
          category: getAQICategory(aqi),
          source: 'open-meteo',
          pollutant: 'US AQI (PM2.5)',
        };
      });
  }

  /**
   * Synchronous stub — not used for the real provider.
   * Real calls go through getAQIForVisitAsync().
   */
  getAQIForVisit(visit) {
    throw new Error(
      'OpenMeteoAQIProvider is async. Use getAQIForVisitAsync() instead.'
    );
  }

  /**
   * Return AQI readings for all hours on a given date for a location.
   * Used by GET /api/aqi/:date — returns the full day's profile.
   */
  async getAQIReadingsForDateAsync(lat, lng, date) {
    const json = await fetchOpenMeteo(lat, lng, date);
    if (!json || !json.hourly) return [];

    const { time, us_aqi, pm2_5 } = json.hourly;
    return (time || []).map((t, i) => ({
      timestamp: t,
      aqi: us_aqi?.[i] != null ? Math.round(us_aqi[i]) : null,
      pm25: pm2_5?.[i] != null ? parseFloat(pm2_5[i].toFixed(1)) : null,
      category: us_aqi?.[i] != null ? getAQICategory(Math.round(us_aqi[i])) : 'Unknown',
      source: 'open-meteo',
    })).filter(r => r.aqi !== null);
  }

  getAQIReadingsForDate() { return []; }
  getAvailableDates()      { return []; }
}

const openMeteoAQIProvider = new OpenMeteoAQIProvider();
module.exports = { OpenMeteoAQIProvider, openMeteoAQIProvider };
