// Dummy data shaped exactly like the API contract in aqiApi.js, so
// swapping mock -> real fetch later requires no component changes.
const today = new Date().toISOString().slice(0, 10)

export const mockLocations = [
  { id: 1, name: 'Home',          lat: 18.5679, lng: 73.7143, aqi: 62,  timestamp: `${today}T07:30:00` },
  { id: 2, name: 'College route', lat: 18.5793, lng: 73.7392, aqi: 118, timestamp: `${today}T08:15:00` },
  { id: 3, name: 'DYPIT Campus',  lat: 18.6120, lng: 73.7663, aqi: 145, timestamp: `${today}T09:00:00` },
  { id: 4, name: 'Canteen area',  lat: 18.6108, lng: 73.7650, aqi: 96,  timestamp: `${today}T13:00:00` },
  { id: 5, name: 'Return route',  lat: 18.5850, lng: 73.7450, aqi: 132, timestamp: `${today}T17:30:00` },
  { id: 6, name: 'Home evening',  lat: 18.5679, lng: 73.7143, aqi: 78,  timestamp: `${today}T19:45:00` },
]

export const mockTrend = [
  { time: '6 AM', aqi: 54 },
  { time: '9 AM', aqi: 118 },
  { time: '12 PM', aqi: 108 },
  { time: '3 PM', aqi: 91 },
  { time: '6 PM', aqi: 132 },
  { time: '9 PM', aqi: 76 },
]

export const mockExposureBreakdown = [
  { band: 'Good', hours: 6 },
  { band: 'Moderate', hours: 9 },
  { band: 'Unhealthy for sensitive', hours: 5.5 },
  { band: 'Unhealthy', hours: 3.5 },
]

export function computeSummary(locations) {
  const avg = Math.round(locations.reduce((s, l) => s + l.aqi, 0) / locations.length)
  const worst = locations.reduce((a, b) => (b.aqi > a.aqi ? b : a))
  const unhealthyHours = locations.filter(l => l.aqi > 100).length * 1.5 // placeholder heuristic
  return { avg, worst, unhealthyHours }
}
