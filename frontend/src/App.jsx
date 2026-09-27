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
import { fetchExposureDay } from './api/aqiApi'
import { bandFor } from './data/aqiBands'

export default function App() {
  const [date, setDate] = useState('2026-09-26') // default mock date
  const [day, setDay] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

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
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <Header
        date={date}
        onDateChange={setDate}
        onOpenAddVisit={() => setIsAddVisitOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        isMockFallback={day?.isMockFallback}
      />

      {status === 'loading' && <LoadingSkeleton />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={load} />}

      {status === 'ready' && day && (
        <div className="space-y-6">
          {/* Formula Banner */}
          {day.exposureFormula && (
            <div className="text-xs bg-haze-panel/60 border border-haze-line px-4 py-2.5 rounded-lg flex justify-between items-center text-haze-mute">
              <span>💡 <strong className="text-haze-ink">Exposure Formula:</strong> {day.exposureFormula}</span>
              <span className="hidden sm:inline text-teal text-[11px] font-medium">SQLite DB Pre-computed</span>
            </div>
          )}

          {/* Main Grid: Map + Right Panel */}
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-5">
            <MapPanel locations={day.locations} />
            <div className="space-y-5">
              <SummaryCard summary={day.summary} />
              <AqiTrendChart data={day.trend} />
              <ExposureBreakdownChart data={day.breakdown} />
            </div>
          </div>

          {/* Location Visits Table */}
          {day.locations && day.locations.length > 0 && (
            <div className="bg-haze-panel border border-haze-line rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-haze-mute">
                  Tracked Location Visits ({day.locations.length})
                </h3>
                <span className="text-xs text-haze-mute">Date: {day.date}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-haze-line text-haze-mute">
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Start - End</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">AQI</th>
                      <th className="py-2 px-3">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-haze-line/40">
                    {day.locations.map((loc) => {
                      const band = bandFor(loc.aqi)
                      return (
                        <tr key={loc.id} className="hover:bg-haze-bg/40">
                          <td className="py-2.5 px-3 font-medium text-haze-ink">{loc.name}</td>
                          <td className="py-2.5 px-3 text-haze-mute">
                            {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {loc.endTime ? new Date(loc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-haze-mute">{loc.durationMinutes} mins</td>
                          <td className="py-2.5 px-3 font-semibold" style={{ color: band.color }}>
                            {loc.aqi}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{ backgroundColor: `${band.color}20`, color: band.color }}
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
