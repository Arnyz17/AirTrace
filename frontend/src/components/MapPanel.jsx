import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { bandFor } from '../data/aqiBands'

// Helper component to auto-center map when locations change
function ChangeView({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function MapPanel({ locations }) {
  if (!locations || locations.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center border border-slate-800">
        <span className="text-4xl mb-3">📍</span>
        <h3 className="font-display text-lg font-semibold text-slate-200">No Location Visits Tracked</h3>
        <p className="text-slate-400 text-xs mt-1 max-w-sm">
          No location history recorded for this date. Click "+ Log Visit" to add a location and calculate exposure.
        </p>
      </div>
    )
  }

  const center = [locations[0].lat, locations[0].lng]

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 h-[460px] flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-sm font-semibold text-slate-200">
            Interactive Exposure Map ({locations.length} Locations)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">CartoDB Dark Matter</span>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {locations.map((loc, idx) => {
            const band = bandFor(loc.aqi)
            return (
              <CircleMarker
                key={loc.id || idx}
                center={[loc.lat, loc.lng]}
                radius={12}
                pathOptions={{
                  color: band.color,
                  fillColor: band.color,
                  fillOpacity: 0.8,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[170px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-2">
                      <span className="font-display font-bold text-sm text-slate-100">{loc.name}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                        style={{ backgroundColor: `${band.color}25`, color: band.color }}
                      >
                        {band.label}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">AQI Index:</span>
                        <span className="font-bold text-sm" style={{ color: band.color }}>
                          {loc.aqi !== null ? loc.aqi : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-200">{loc.durationMinutes} mins</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                        <span>Time:</span>
                        <span>
                          {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      {/* Bottom Map Legend Overlay */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 z-10">
        <span>EPA AQI Scale:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Good (0-50)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Moderate (51-100)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> USG (101-150)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Unhealthy (151+)</span>
        </div>
      </div>
    </div>
  )
}
