// Matches the category labels/thresholds used by the AirTrace backend
// (src/config/constants.js) so categoryBreakdown keys line up exactly.
export const AQI_BANDS = [
  { max: 50,  label: 'Good',                          color: '#4C9A6D' },
  { max: 100, label: 'Moderate',                       color: '#D8B84A' },
  { max: 150, label: 'Unhealthy for Sensitive Groups',  color: '#E08A3E' },
  { max: 200, label: 'Unhealthy',                      color: '#C7574F' },
  { max: 300, label: 'Very Unhealthy',                 color: '#7A3B5E' },
  { max: Infinity, label: 'Hazardous',                 color: '#4A2438' },
]

export function bandFor(aqi) {
  return AQI_BANDS.find(b => aqi <= b.max) ?? AQI_BANDS[AQI_BANDS.length - 1]
}

export function colorForLabel(label) {
  return AQI_BANDS.find(b => b.label === label)?.color ?? '#2F6F6F'
}
