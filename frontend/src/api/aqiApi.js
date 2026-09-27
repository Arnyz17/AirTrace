// --- AirTrace Backend API Contract & Integration ────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json?.error?.message || json?.message || `Request failed (${res.status})`)
  }
  return json.data
}

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json?.error?.message || json?.message || `Failed to submit (${res.status})`)
  }
  return json.data
}

// --- Normalizers: backend shape -> component expectation ────────────────────

function normalizeLocations(rawLocations = []) {
  return rawLocations.map(v => ({
    id: v.id,
    name: v.locationName,
    lat: v.latitude,
    lng: v.longitude,
    aqi: v.aqi,
    aqiCategory: v.aqiCategory,
    timestamp: v.startTime,
    endTime: v.endTime,
    durationMinutes: v.durationMinutes,
  }))
}

function normalizeTrend(rawLocations = []) {
  return [...rawLocations]
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .map(v => ({
      time: new Date(v.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      aqi: v.aqi,
      locationName: v.locationName,
    }))
}

function normalizeBreakdown(categoryBreakdown = {}) {
  return Object.entries(categoryBreakdown).map(([band, minutes]) => ({
    band,
    hours: Math.round((minutes / 60) * 10) / 10,
    minutes,
  }))
}

function normalizeSummary(summary = {}) {
  const unhealthyMinutes = Object.entries(summary.categoryBreakdown || {})
    .filter(([label]) => label !== 'Good' && label !== 'Moderate')
    .reduce((sum, [, minutes]) => sum + minutes, 0)

  return {
    avg: summary.averageAQI || 0,
    worst: {
      name: summary.highestAQILocation || 'N/A',
      aqi: summary.highestAQI || 0,
    },
    highestExposureLocation: summary.highestExposureLocation || 'N/A',
    unhealthyHours: Math.round((unhealthyMinutes / 60) * 10) / 10,
    totalExposure: summary.totalExposure || 0,
    totalMinutesTracked: summary.totalMinutesTracked || 0,
    numberOfLocations: summary.numberOfLocations || 0,
  }
}

// --- Public API ─────────────────────────────────────────────────────────────

/**
 * Single call that returns everything the dashboard needs for one date:
 * { locations, trend, breakdown, summary, date, exposureFormula }
 */
export async function fetchExposureDay(date) {
  try {
    const data = await getJson(`/exposure/${date}`)
    return {
      locations: normalizeLocations(data.locations || []),
      trend: normalizeTrend(data.locations || []),
      breakdown: normalizeBreakdown(data.summary?.categoryBreakdown || {}),
      summary: normalizeSummary(data.summary || {}),
      rawSummary: data.summary,
      date: data.date,
      exposureFormula: data.exposureFormula,
      isMockFallback: false,
    }
  } catch (err) {
    console.warn(`[AirTrace] Backend fetch for ${date} failed:`, err.message)
    // Return empty — no fake data
    return {
      locations: [],
      trend: [],
      breakdown: [],
      summary: { avg: 0, worst: { name: 'N/A', aqi: 0 }, unhealthyHours: 0, totalExposure: 0, totalMinutesTracked: 0, numberOfLocations: 0 },
      date,
      isMockFallback: true,
      fallbackError: err.message,
    }
  }
}


/**
 * Fetch available historical dates and summaries from the backend.
 */
export async function fetchHistory() {
  try {
    const data = await getJson('/exposure/history')
    return data
  } catch (err) {
    console.warn('[AirTrace] History fetch failed:', err.message)
    return { availableDates: ['2026-09-24', '2026-09-25', '2026-09-26'], summaries: [] }
  }
}

/**
 * Fetch cross-date aggregate analytics overview.
 */
export async function fetchOverviewAnalytics() {
  try {
    const data = await getJson('/analytics/overview')
    return data
  } catch (err) {
    console.warn('[AirTrace] Overview analytics fetch failed:', err.message)
    return null
  }
}

/**
 * Submit a new location visit to the backend (POST /api/visits).
 * AQI is now fetched live from Open-Meteo in the backend.
 */
export async function submitVisit(visitPayload) {
  const data = await postJson('/visits', visitPayload)
  return data
}

/**
 * Fetch real-time AQI for any lat/lng from Open-Meteo via the backend proxy.
 * Returns { aqi, pm25, category, timestamp, source } or null on failure.
 */
export async function fetchLiveAQI(lat, lng) {
  try {
    const res = await fetch(`${BASE_URL}/aqi/live?lat=${lat}&lng=${lng}`)
    const json = await res.json()
    if (json.success && json.data) return json.data
    return null
  } catch (err) {
    console.warn('[AirTrace] Live AQI fetch failed:', err.message)
    return null
  }
}

