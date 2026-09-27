// Matches the category labels/thresholds used by the AirTrace backend
export const AQI_BANDS = [
  { max: 50,       label: 'Good',                          color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  { max: 100,      label: 'Moderate',                       color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  { max: 150,      label: 'Unhealthy for Sensitive Groups',  color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  { max: 200,      label: 'Unhealthy',                      color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { max: 300,      label: 'Very Unhealthy',                 color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  { max: Infinity, label: 'Hazardous',                      color: '#E11D48', bg: 'rgba(225, 29, 72, 0.15)' },
]

export function bandFor(aqi) {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return { label: 'Unknown', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' }
  }
  return AQI_BANDS.find(b => aqi <= b.max) ?? AQI_BANDS[AQI_BANDS.length - 1]
}

export function colorForLabel(label) {
  return AQI_BANDS.find(b => b.label === label)?.color ?? '#10B981'
}
