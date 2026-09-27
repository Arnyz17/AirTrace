import { useState } from 'react'
import { submitVisit } from '../api/aqiApi'

const PRESETS = [
  { name: 'University Campus', lat: 40.744, lng: -74.0247 },
  { name: 'Downtown Center', lat: 40.7127, lng: -74.0059 },
  { name: 'Central Park', lat: 40.7812, lng: -73.9665 },
  { name: 'Tech Hub Office', lat: 40.7505, lng: -73.9934 },
  { name: 'Sports Gym', lat: 40.7300, lng: -73.9900 },
]

export default function AddVisitModal({ isOpen, onClose, onVisitAdded, currentDate }) {
  if (!isOpen) return null

  const now = new Date()
  const baseDate = currentDate || now.toISOString().slice(0, 10)
  
  const defaultStart = `${baseDate}T10:00`
  const defaultEnd = `${baseDate}T12:00`

  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState(40.744)
  const [longitude, setLongitude] = useState(-74.0247)
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState('')

  const applyPreset = (preset) => {
    setLocationName(preset.name)
    setLatitude(preset.lat)
    setLongitude(preset.lng)
  }

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setGeoLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(4)))
        setLongitude(parseFloat(pos.coords.longitude.toFixed(4)))
        if (!locationName) {
          setLocationName('My Current Location')
        }
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        setError(`GPS location error: ${err.message}`)
      },
      { timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        locationName: locationName.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        startTime: startTime.length === 16 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 16 ? `${endTime}:00` : endTime,
      }

      await submitVisit(payload)
      setLoading(false)
      onVisitAdded()
      onClose()
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to add visit. Make sure backend is running.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h2 className="font-display text-lg font-bold text-slate-100">Log a Location Visit</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg text-lg transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* GPS Button & Quick Presets */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-slate-400 font-medium">Quick Location Presets:</label>
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={geoLoading}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
            >
              <span>🎯</span> {geoLoading ? 'Detecting GPS...' : 'Use My GPS Location'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition text-slate-200"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Location Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Library"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Start Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">End Time</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 rounded-xl font-medium text-slate-300 text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save & Compute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
