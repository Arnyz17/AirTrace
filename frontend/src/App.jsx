import { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import MapPanel from './components/MapPanel'
import SummaryCard from './components/SummaryCard'
import AqiTrendChart from './components/AqiTrendChart'
import ExposureBreakdownChart from './components/ExposureBreakdownChart'
import LoadingSkeleton from './components/LoadingSkeleton'
import ErrorState from './components/ErrorState'
import AddVisitModal from './components/AddVisitModal'
import AnalyticsModal from './components/AnalyticsModal'
import { fetchExposureDay, fetchHistory } from './api/aqiApi'
import { bandFor } from './data/aqiBands'

export default function App() {
  const [date, setDate] = useState('2026-09-26')
  const [availableDates, setAvailableDates] = useState(['2026-09-26', '2026-09-25', '2026-09-24'])
  const [day, setDay] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  // Fetch available dates from backend history
  useEffect(() => {
    fetchHistory().then(res => {
      if (res?.availableDates && res.availableDates.length > 0) {
        setAvailableDates(res.availableDates)
      }
    })
  }, [])

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await fetchExposureDay(date)
      setDay(result)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }, [date])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
      <Header
        date={date}
        onDateChange={setDate}
        availableDates={availableDates}
        onOpenAddVisit={() => setIsAddVisitOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        isMockFallback={day?.isMockFallback}
      />

      {status === 'loading' && <LoadingSkeleton />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={load} />}

      {status === 'ready' && day && (
        <div className="space-y-6">
          {/* Exposure Formula Banner */}
          {day.exposureFormula && (
            <div className="glass-panel px-4 py-3 rounded-xl flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2 border border-slate-800">
              <span className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">💡 Formula:</span>
                <span className="text-slate-200">{day.exposureFormula}</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                SQLite Pre-Computed
              </span>
            </div>
          )}

          {/* Main 2-Column Dashboard Grid */}
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
            <MapPanel locations={day.locations} />

            <div className="space-y-6">
              <SummaryCard summary={day.summary} />
              <AqiTrendChart data={day.trend} />
              <ExposureBreakdownChart data={day.breakdown} />
            </div>
          </div>

          {/* Location Exposure Log Table */}
          {day.locations && day.locations.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 md:p-6 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
                    Location Exposure Log ({day.locations.length} Visits)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological movement history for {day.date}</p>
                </div>
                <button
                  onClick={() => setIsAddVisitOpen(true)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                >
                  + Add Visit Record
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Location Name</th>
                      <th className="py-3 px-3">Coordinates</th>
                      <th className="py-3 px-3">Visit Time Window</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">AQI Score</th>
                      <th className="py-3 px-3">Air Quality Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {day.locations.map((loc, idx) => {
                      const band = bandFor(loc.aqi)
                      return (
                        <tr key={loc.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-3 font-semibold text-slate-100">{loc.name}</td>
                          <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                            {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {loc.endTime ? new Date(loc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-300">{loc.durationMinutes} mins</td>
                          <td className="py-3.5 px-3 font-bold text-sm" style={{ color: band.color }}>
                            {loc.aqi !== null ? loc.aqi : 'N/A'}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className="px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                              style={{
                                backgroundColor: `${band.color}15`,
                                borderColor: `${band.color}40`,
                                color: band.color,
                              }}
                            >
                              {band.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddVisitModal
        isOpen={isAddVisitOpen}
        onClose={() => setIsAddVisitOpen(false)}
        onVisitAdded={load}
        currentDate={date}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  )
}
