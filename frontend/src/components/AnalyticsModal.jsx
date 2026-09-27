import { useEffect, useState } from 'react'
import { fetchOverviewAnalytics } from '../api/aqiApi'
import { bandFor } from '../data/aqiBands'

export default function AnalyticsModal({ isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      fetchOverviewAnalytics()
        .then(res => {
          setData(res)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-haze-panel border border-haze-line rounded-xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-haze-line pb-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Exposure Analytics Engine</h2>
            <p className="text-xs text-haze-mute mt-0.5">Aggregate insights calculated across your history in SQLite</p>
          </div>
          <button onClick={onClose} className="text-haze-mute hover:text-haze-ink p-1 rounded-md text-xl">✕</button>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-haze-mute">Loading analytics...</div>
        )}

        {!loading && data && (
          <div className="space-y-5">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg text-center">
                <span className="block text-2xl font-bold font-display text-teal">{data.totalDaysTracked}</span>
                <span className="text-xs text-haze-mute">Days Tracked</span>
              </div>
              <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg text-center">
                <span className="block text-2xl font-bold font-display">{data.totalTrackedHours}h</span>
                <span className="text-xs text-haze-mute font-medium">Total Time</span>
              </div>
              <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg text-center">
                <span className="block text-2xl font-bold font-display">{Math.round(data.averageDailyExposure)}</span>
                <span className="text-xs text-haze-mute">Avg Exposure Index</span>
              </div>
              <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg text-center">
                <span className="block text-2xl font-bold font-display">{data.overallAverageAQI}</span>
                <span className="text-xs text-haze-mute">Avg AQI</span>
              </div>
            </div>

            {/* Best & Worst Days */}
            {data.bestDay && data.worstDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-lg">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">🌱 Lowest Pollution Day</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="font-medium text-sm">{data.bestDay.date}</span>
                    <span className="text-emerald-400 font-bold text-lg">AQI {data.bestDay.averageAQI}</span>
                  </div>
                  <p className="text-xs text-haze-mute mt-1">Total exposure index: {data.bestDay.totalExposure}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">⚠️ Highest Exposure Day</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="font-medium text-sm">{data.worstDay.date}</span>
                    <span className="text-amber-400 font-bold text-lg">AQI {data.worstDay.averageAQI}</span>
                  </div>
                  <p className="text-xs text-haze-mute mt-1">Total exposure index: {data.worstDay.totalExposure}</p>
                </div>
              </div>
            )}

            {/* Top Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {data.mostVisitedLocation && (
                <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg">
                  <span className="text-xs text-haze-mute block">📍 Most Visited Location</span>
                  <span className="font-medium text-base block mt-0.5">{data.mostVisitedLocation.locationName}</span>
                  <span className="text-xs text-teal">{Math.round(data.mostVisitedLocation.totalMinutes / 60 * 10) / 10} hours recorded</span>
                </div>
              )}

              {data.highestAQILocation && (
                <div className="bg-haze-bg border border-haze-line p-3.5 rounded-lg">
                  <span className="text-xs text-haze-mute block">🔥 Highest AQI Location Encountered</span>
                  <span className="font-medium text-base block mt-0.5">{data.highestAQILocation.locationName}</span>
                  <span className="text-xs" style={{ color: bandFor(data.highestAQILocation.maxAQI).color }}>
                    Max AQI {data.highestAQILocation.maxAQI} ({data.highestAQILocation.category})
                  </span>
                </div>
              )}
            </div>

            {/* Category Distribution */}
            {data.categoryDistribution && (
              <div className="bg-haze-bg border border-haze-line p-4 rounded-lg">
                <h3 className="text-xs font-medium text-haze-mute uppercase mb-3">Overall Air Quality Time Breakdown</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(data.categoryDistribution).map(([cat, info]) => {
                    const band = bandFor(info.category === 'Good' ? 25 : info.category === 'Moderate' ? 75 : 125)
                    return (
                      <div key={cat}>
                        <div className="flex justify-between mb-1">
                          <span>{cat}</span>
                          <span className="font-medium">{info.hours}h ({info.percentage}%)</span>
                        </div>
                        <div className="w-full bg-haze-line/40 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${info.percentage}%`, backgroundColor: band.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
