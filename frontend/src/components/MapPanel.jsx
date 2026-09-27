import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { bandFor } from '../data/aqiBands'

// Helper component to auto-fit map bounds so all locations are visible
function AutoFitBounds({ locations }) {
  const map = useMap()
  useEffect(() => {
    if (locations && locations.length > 0) {
      const validPoints = locations.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number' && !isNaN(l.lat) && !isNaN(l.lng))
      if (validPoints.length > 0) {
        const bounds = validPoints.map(l => [l.lat, l.lng])
        if (bounds.length === 1) {
          map.setView(bounds[0], 13)
        } else {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
        }
      }
    }
  }, [locations, map])
  return null
}

export default function MapPanel({ locations, userLocation, onLocateUser }) {
  const validLocations = (locations || []).filter(l => typeof l.lat === 'number' && typeof l.lng === 'number' && !isNaN(l.lat) && !isNaN(l.lng))
  
  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : validLocations.length > 0
    ? [validLocations[0].lat, validLocations[0].lng]
    : [20.5937, 78.9629] // India default center fallback

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 h-[460px] flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-sm font-semibold text-slate-200">
            Exposure Map ({validLocations.length} Locations)
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onLocateUser}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700 font-medium transition flex items-center gap-1"
          >
            <span>🎯</span> Locate Me
          </button>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Esri Dark Canvas (No Key Required)</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <AutoFitBounds locations={validLocations} />
          
          {/* Esri Dark Gray Canvas Tile Layer — 100% free, 0 API key required! */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          {/* User Current Location Marker if available */}
          {userLocation && (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              pathOptions={{
                color: '#06B6D4',
                fillColor: '#06B6D4',
                fillOpacity: 0.9,
                weight: 3,
              }}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-bold text-cyan-400 block mb-0.5">🎯 Your Current Location</span>
                  <span className="text-slate-300 font-mono">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* Location Visit Markers */}
          {validLocations.map((loc, idx) => {
            const band = bandFor(loc.aqi)
            return (
              <CircleMarker
                key={loc.id || idx}
                center={[loc.lat, loc.lng]}
                radius={12}
                pathOptions={{
                  color: band.color,
                  fillColor: band.color,
                  fillOpacity: 0.85,
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
                          {loc.aqi !== null && loc.aqi !== undefined ? loc.aqi : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-200">{loc.durationMinutes || 0} mins</span>
                      </div>
                      {loc.timestamp && (
                        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                          <span>Time:</span>
                          <span>
                            {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
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
