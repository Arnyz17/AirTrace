import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { bandFor } from '../data/aqiBands'

// Helper: auto-fit map to show all logged locations
function AutoFitBounds({ locations }) {
  const map = useMap()
  useEffect(() => {
    if (locations && locations.length > 0) {
      const valid = locations.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number' && !isNaN(l.lat) && !isNaN(l.lng))
      if (valid.length === 1) {
        map.setView([valid[0].lat, valid[0].lng], 13)
      } else if (valid.length > 1) {
        map.fitBounds(valid.map(l => [l.lat, l.lng]), { padding: [40, 40], maxZoom: 15 })
      }
    }
  }, [locations, map])
  return null
}

// Helper: fly to user location whenever it changes — MUST be inside MapContainer
function FlyToLocation({ userLocation }) {
  const map = useMap()
  useEffect(() => {
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true, duration: 1.2 })
    }
  }, [userLocation, map])
  return null
}

export default function MapPanel({ locations, userLocation, onLocateUser, locating }) {
  const validLocations = (locations || []).filter(
    l => typeof l.lat === 'number' && typeof l.lng === 'number' && !isNaN(l.lat) && !isNaN(l.lng)
  )

  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : validLocations.length > 0
    ? [validLocations[0].lat, validLocations[0].lng]
    : [40.7128, -74.006] // NYC default

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 h-[460px] flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-sm font-semibold text-slate-200">
            Exposure Map <span className="text-slate-500 font-normal">({validLocations.length} locations)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLocateUser}
            disabled={locating}
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
              locating
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 cursor-wait'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400'
            }`}
          >
            {locating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Locating…
              </>
            ) : (
              <>🎯 Locate Me</>
            )}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Esri Dark Gray Canvas — free, no API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Auto-fit to logged locations on load */}
          <AutoFitBounds locations={validLocations} />

          {/* Fly to user GPS location reactively */}
          <FlyToLocation userLocation={userLocation} />

          {/* User GPS marker */}
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
                <div style={{ padding: '4px', minWidth: '140px' }}>
                  <span style={{ fontWeight: 'bold', color: '#06B6D4', display: 'block', marginBottom: '4px' }}>
                    🎯 Your Current Location
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* Visit markers */}
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
                  <div style={{ padding: '4px', minWidth: '170px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#f1f5f9' }}>{loc.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '6px', backgroundColor: `${band.color}25`, color: band.color, textTransform: 'uppercase' }}>
                        {band.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>AQI:</span>
                        <span style={{ fontWeight: 'bold', color: band.color }}>{loc.aqi ?? 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Duration:</span>
                        <span style={{ color: '#e2e8f0' }}>{loc.durationMinutes || 0} mins</span>
                      </div>
                      {loc.timestamp && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', paddingTop: '4px' }}>
                          <span>Time:</span>
                          <span>{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

      {/* AQI Legend */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 z-10">
        <span className="font-medium text-slate-500">EPA AQI Scale:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Good (0–50)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Moderate (51–100)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> USG (101–150)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Unhealthy (151+)</span>
        </div>
      </div>
    </div>
  )
}
