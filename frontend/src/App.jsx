import { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import MapPanel from './components/MapPanel'
import SummaryCard from './components/SummaryCard'
import AqiTrendChart from './components/AqiTrendChart'
import ExposureBreakdownChart from './components/ExposureBreakdownChart'
import LoadingSkeleton from './components/LoadingSkeleton'
import AddVisitModal from './components/AddVisitModal'
import AnalyticsModal from './components/AnalyticsModal'
import { fetchExposureDay, fetchHistory, fetchLiveAQI } from './api/aqiApi'
import { bandFor } from './data/aqiBands'

// Today's date in local timezone as YYYY-MM-DD
function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function App() {
  const [date, setDate] = useState(todayLocal)
  const [availableDates, setAvailableDates] = useState([todayLocal()])
  const [day, setDay] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'empty' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [liveAQI, setLiveAQI] = useState(null)

  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  // Fetch available dates from backend
  useEffect(() => {
    fetchHistory().then(res => {
      const dates = res?.availableDates || []
      const today = todayLocal()
      // Always include today even if no visits yet
      const merged = Array.from(new Set([today, ...dates])).sort().reverse()
      setAvailableDates(merged)
    })
  }, [])

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setLiveAQI(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })
        setLocating(false)
        const aqiData = await fetchLiveAQI(lat, lng)
        setLiveAQI(aqiData)
      },
      (err) => {
        setLocating(false)
        alert(`Location error: ${err.message}\n\nTip: Make sure your browser has location permission enabled for localhost.`)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await fetchExposureDay(date)
      // If mock fallback was used OR no real locations, treat as empty
      if (result.isMockFallback || !result.locations || result.locations.length === 0) {
        setDay(null)
        setStatus('empty')
      } else {
        setDay(result)
        setStatus('ready')
      }
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
        isMockFallback={false}
      />

      {status === 'loading' && <LoadingSkeleton />}

      {status === 'error' && (
        <div className="glass-panel rounded-2xl p-8 border border-red-500/20 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="font-bold text-slate-100 mb-2">Backend Unreachable</h3>
          <p className="text-xs text-slate-400 mb-4">{errorMsg}</p>
          <button onClick={load} className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 transition">
            Retry
          </button>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {status === 'empty' && (
        <div className="space-y-6">
          {/* Live AQI banner (visible even with no visits) */}
          {locating && !liveAQI && (
            <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3 border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              Fetching live air quality data for your location…
            </div>
          )}
          {liveAQI && userLocation && <LiveAQIBanner liveAQI={liveAQI} userLocation={userLocation} />}

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            {/* Map still shows (user can still locate themselves) */}
            <MapPanel
              locations={[]}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              locating={locating}
            />
          </div>

          {/* Empty state CTA */}
          <div className="glass-panel rounded-2xl p-10 border border-slate-800 flex flex-col items-center justify-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
              📍
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-1">
                No visits logged for {date}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Start tracking your air quality exposure by logging a location visit.
                AQI is fetched automatically from real-time data.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setIsAddVisitOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
              >
                + Log a Visit
              </button>
              <button
                onClick={handleLocateUser}
                disabled={locating}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
              >
                🎯 {locating ? 'Locating…' : 'Check My Current AQI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard (has real data) ────────────────────────────────────────── */}
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
                Live Open-Meteo AQI · SQLite Engine
              </span>
            </div>
          )}

          {/* Live AQI banner */}
          {locating && !liveAQI && (
            <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3 border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              Fetching live air quality data for your location…
            </div>
          )}
          {liveAQI && userLocation && <LiveAQIBanner liveAQI={liveAQI} userLocation={userLocation} />}

          {/* Main 2-Column Dashboard Grid */}
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
            <MapPanel
              locations={day.locations}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              locating={locating}
            />

            <div className="space-y-6">
              <SummaryCard summary={day.summary} locations={day.locations} />
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
                      <th className="py-3 px-3">Air Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {day.locations.map((loc, idx) => {
                      const band = bandFor(loc.aqi)
                      return (
                        <tr key={loc.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-3 font-semibold text-slate-100">{loc.name}</td>
                          <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                            {typeof loc.lat === 'number' ? loc.lat.toFixed(4) : 'N/A'}, {typeof loc.lng === 'number' ? loc.lng.toFixed(4) : 'N/A'}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            {' – '}
                            {loc.endTime ? new Date(loc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-300">{loc.durationMinutes || 0} mins</td>
                          <td className="py-3.5 px-3 font-bold text-sm" style={{ color: band.color }}>
                            {loc.aqi !== null && loc.aqi !== undefined ? loc.aqi : 'N/A'}
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
        onVisitAdded={() => { load(); fetchHistory().then(res => { const dates = res?.availableDates || []; const today = todayLocal(); setAvailableDates(Array.from(new Set([today, ...dates])).sort().reverse()) }) }}
        currentDate={date}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  )
}

// ── Extracted LiveAQIBanner component ──────────────────────────────────────────
function LiveAQIBanner({ liveAQI, userLocation }) {
  const aqiVal = liveAQI.aqi
  const cat = liveAQI.category || 'Unknown'
  const color =
    aqiVal <= 50  ? '#10B981' :
    aqiVal <= 100 ? '#F59E0B' :
    aqiVal <= 150 ? '#F97316' :
    aqiVal <= 200 ? '#EF4444' : '#7C3AED'

  return (
    <div
      className="glass-panel px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 border text-xs"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
    >
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full animate-ping shrink-0" style={{ backgroundColor: color }} />
        <div>
          <span className="font-bold text-slate-100 text-sm mr-2">🛰 Live AQI at Your Location</span>
          <span className="text-[11px] text-slate-400">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {liveAQI.pm25 != null && (
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">PM2.5</div>
            <div className="font-bold text-slate-200">{liveAQI.pm25} µg/m³</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">US AQI</div>
          <div className="font-bold text-2xl leading-none" style={{ color }}>{aqiVal ?? 'N/A'}</div>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-bold border"
          style={{ backgroundColor: `${color}20`, borderColor: `${color}50`, color }}
        >
          {cat}
        </div>
        <div className="text-[10px] text-slate-500 text-right">
          <div>Source: Open-Meteo</div>
          <div>{new Date(liveAQI.fetchedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </div>
  )
}
