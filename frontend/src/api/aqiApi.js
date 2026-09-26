// --- Real API contract (AirTrace backend, confirmed from source) ---------
// GET /api/exposure/:date  ->
//   { success, data: {
//       date, exposureFormula,
//       summary: { averageAQI, highestAQI, highestAQILocation,
//                  highestExposureLocation, totalMinutesTracked,
//                  numberOfLocations, categoryBreakdown: { label: minutes },
//                  locationBreakdown, exposureRecords },
//       locations: [{ id, locationName, latitude, longitude, startTime,
//                     endTime, durationMinutes, date, aqi, aqiCategory }]
//   } }
// Errors -> { success: false, error: { code, message, status } }
// ---------------------------------------------------------------------------

import {
  mockLocations,
  mockTrend,
  mockExposureBreakdown,
  computeSummary as mockComputeSummary,
} from '../data/mockData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL // e.g. http://localhost:3001/api
const USE_MOCK = !BASE_URL

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  const json = await res.json()
  if (!res.ok || json.success === false) {
    // Surface the backend's own message (it's already human-readable).
    throw new Error(json?.error?.message || `Request failed (${res.status})`)
  }
  return json.data
}

// --- Normalizers: backend shape -> the shape our components expect --------

function normalizeLocations(rawLocations) {
  return rawLocations.map(v => ({
    id: v.id,
    name: v.locationName,
    lat: v.latitude,
    lng: v.longitude,
    aqi: v.aqi,
    timestamp: v.startTime,
  }))
}

function normalizeTrend(rawLocations) {
  // No dedicated trend endpoint; derive it from the chronological visit list
  // that /exposure/:date already returns.
  return [...rawLocations]
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .map(v => ({
      time: new Date(v.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      aqi: v.aqi,
    }))
}

function normalizeBreakdown(categoryBreakdown) {
  // { "Good": 240, "Moderate": 90, ... } (minutes) -> [{ band, hours }]
  return Object.entries(categoryBreakdown || {}).map(([band, minutes]) => ({
    band,
    hours: Math.round((minutes / 60) * 10) / 10,
  }))
}

function normalizeSummary(summary) {
  const unhealthyMinutes = Object.entries(summary.categoryBreakdown || {})
    .filter(([label]) => label !== 'Good' && label !== 'Moderate')
    .reduce((sum, [, minutes]) => sum + minutes, 0)

  return {
    avg: summary.averageAQI,
    worst: { name: summary.highestAQILocation, aqi: summary.highestAQI },
    unhealthyHours: Math.round((unhealthyMinutes / 60) * 10) / 10,
  }
}

// --- Public API used by App.jsx --------------------------------------------

/**
 * Single call that returns everything the dashboard needs for one date:
 * { locations, trend, breakdown, summary } — all already normalized.
 */
export async function fetchExposureDay(date) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400)) // visible loading state in dev
    return {
      locations: mockLocations,
      trend: mockTrend,
      breakdown: mockExposureBreakdown,
      summary: mockComputeSummary(mockLocations),
    }
  }

  const data = await getJson(`/exposure/${date}`)
  return {
    locations: normalizeLocations(data.locations),
    trend: normalizeTrend(data.locations),
    breakdown: normalizeBreakdown(data.summary.categoryBreakdown),
    summary: normalizeSummary(data.summary),
  }
}
