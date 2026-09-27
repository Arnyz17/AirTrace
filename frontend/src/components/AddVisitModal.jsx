import { useState } from 'react'
import { submitVisit } from '../api/aqiApi'

const PRESETS = [
  { name: 'University Campus', lat: 40.744, lng: -74.0247 },
  { name: 'Downtown Cafe', lat: 40.750, lng: -73.991 },
  { name: 'Central Park', lat: 40.782, lng: -73.965 },
  { name: 'Financial District', lat: 40.712, lng: -74.005 },
  { name: 'Fitness Center', lat: 40.730, lng: -73.990 },
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
  const [error, setError] = useState('')

  const applyPreset = (preset) => {
    setLocationName(preset.name)
    setLatitude(preset.lat)
    setLongitude(preset.lng)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-haze-panel border border-haze-line rounded-xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-lg font-semibold">Log a Location Visit</h2>
          <button
            onClick={onClose}
            className="text-haze-mute hover:text-haze-ink p-1 rounded-md text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-md">
            {error}
          </div>
        )}

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="text-xs text-haze-mute block mb-1.5 font-medium">Quick Presets:</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs bg-haze-line/40 hover:bg-haze-line px-2.5 py-1 rounded-md transition text-haze-ink"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-haze-mute mb-1 font-medium">Location Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Building"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-haze-bg border border-haze-line rounded-md px-3 py-2 text-haze-ink focus:outline-none focus:border-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-haze-mute mb-1 font-medium">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-haze-bg border border-haze-line rounded-md px-3 py-2 text-haze-ink focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-xs text-haze-mute mb-1 font-medium">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-haze-bg border border-haze-line rounded-md px-3 py-2 text-haze-ink focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-haze-mute mb-1 font-medium">Start Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-haze-bg border border-haze-line rounded-md px-2.5 py-2 text-haze-ink text-xs focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-xs text-haze-mute mb-1 font-medium">End Time</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-haze-bg border border-haze-line rounded-md px-2.5 py-2 text-haze-ink text-xs focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-haze-line/30 hover:bg-haze-line py-2 rounded-md font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal hover:bg-teal/90 text-black py-2 rounded-md font-medium text-xs transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Visit & Calculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
