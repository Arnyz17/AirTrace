import { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import MapPanel from './components/MapPanel'
import SummaryCard from './components/SummaryCard'
import AqiTrendChart from './components/AqiTrendChart'
import ExposureBreakdownChart from './components/ExposureBreakdownChart'
import LoadingSkeleton from './components/LoadingSkeleton'
import ErrorState from './components/ErrorState'
import { fetchExposureDay } from './api/aqiApi'

export default function App() {
  const [date, setDate] = useState('2026-09-26') // matches backend's seeded "today"
  const [day, setDay] = useState(null) // { locations, trend, breakdown, summary }
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

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
    <div className="min-h-screen px-5 md:px-10 py-8 max-w-6xl mx-auto">
      <Header date={date} onDateChange={setDate} />

      {status === 'loading' && <LoadingSkeleton />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={load} />}

      {status === 'ready' && day && (
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-5">
          <MapPanel locations={day.locations} />
          <div className="space-y-5">
            <SummaryCard summary={day.summary} />
            <AqiTrendChart data={day.trend} />
            <ExposureBreakdownChart data={day.breakdown} />
          </div>
        </div>
      )}
    </div>
  )
}
