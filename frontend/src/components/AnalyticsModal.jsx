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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📊</span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-100">Exposure Analytics Engine</h2>
              <p className="text-xs text-slate-400">Aggregate insights calculated across your history in SQLite</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg text-lg transition">✕</button>
        </div>

        {loading && (
          <div className="py-12 text-center text-xs text-slate-400">
            <span className="inline-block animate-spin mr-2">⚙️</span> Computing analytical aggregates...
          </div>
        )}

        {!loading && data && (
          <div className="space-y-5">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold font-display text-emerald-400">{data.totalDaysTracked}</span>
                <span className="text-slate-400">Days Tracked</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold font-display text-cyan-400">{data.totalTrackedHours}h</span>
                <span className="text-slate-400">Total Time</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold font-display text-indigo-400">{Math.round(data.averageDailyExposure)}</span>
                <span className="text-slate-400">Avg Exposure Index</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold font-display text-amber-400">{data.overallAverageAQI}</span>
                <span className="text-slate-400">Overall Avg AQI</span>
              </div>
            </div>

            {/* Best & Worst Days */}
            {data.bestDay && data.worstDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">🌱 Lowest Pollution Day</span>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="font-semibold text-sm text-slate-200">{data.bestDay.date}</span>
                    <span className="text-emerald-400 font-bold text-base">AQI {data.bestDay.averageAQI}</span>
                  </div>
                  <p className="text-slate-400 mt-1">Total exposure index: {data.bestDay.totalExposure}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">⚠️ Highest Exposure Day</span>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="font-semibold text-sm text-slate-200">{data.worstDay.date}</span>
                    <span className="text-amber-400 font-bold text-base">AQI {data.worstDay.averageAQI}</span>
                  </div>
                  <p className="text-slate-400 mt-1">Total exposure index: {data.worstDay.totalExposure}</p>
                </div>
              </div>
            )}

            {/* Top Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {data.mostVisitedLocation && (
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <span className="text-slate-400 block mb-1">📍 Most Visited Location</span>
                  <span className="font-semibold text-sm text-slate-100 block">{data.mostVisitedLocation.locationName}</span>
                  <span className="text-emerald-400 mt-1 block">{Math.round(data.mostVisitedLocation.totalMinutes / 60 * 10) / 10} hours recorded</span>
                </div>
              )}

              {data.highestAQILocation && (
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <span className="text-slate-400 block mb-1">🔥 Highest Peak AQI Location</span>
                  <span className="font-semibold text-sm text-slate-100 block">{data.highestAQILocation.locationName}</span>
                  <span className="mt-1 block font-medium" style={{ color: bandFor(data.highestAQILocation.maxAQI).color }}>
                    Max AQI {data.highestAQILocation.maxAQI} ({data.highestAQILocation.category})
                  </span>
                </div>
              )}
            </div>

            {/* Category Distribution */}
            {data.categoryDistribution && (
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Overall Air Quality Exposure Breakdown</h3>
                <div className="space-y-2.5 text-xs">
                  {Object.entries(data.categoryDistribution).map(([cat, info]) => {
                    const band = bandFor(info.category === 'Good' ? 25 : info.category === 'Moderate' ? 75 : 125)
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-200">{cat}</span>
                          <span className="font-medium text-slate-300">{info.hours}h ({info.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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
