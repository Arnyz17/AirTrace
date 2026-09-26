import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { bandFor } from '../data/aqiBands'

export default function MapPanel({ locations }) {
  if (!locations || locations.length === 0) return null
  const center = [locations[0].lat, locations[0].lng]

  return (
    <div className="bg-haze-panel border border-haze-line rounded-lg overflow-hidden h-[420px]">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(loc => {
          const band = bandFor(loc.aqi)
          return (
            <CircleMarker
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={10}
              pathOptions={{ color: band.color, fillColor: band.color, fillOpacity: 0.75, weight: 2 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{loc.name}</p>
                  <p style={{ color: band.color }}>{loc.aqi} · {band.label}</p>
                  <p className="text-haze-mute">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
