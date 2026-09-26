import { bandFor } from '../data/aqiBands'

export default function SummaryCard({ summary }) {
  if (!summary) return null
  const { avg, worst, unhealthyHours } = summary
  const band = bandFor(avg)

  return (
    <div className="bg-haze-panel border border-haze-line rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-haze-mute mb-3">Today's exposure summary</p>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-display text-5xl font-semibold" style={{ color: band.color }}>
          {avg}
        </span>
        <span className="text-haze-mute text-sm">avg AQI · {band.label}</span>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-haze-mute">Worst location</dt>
          <dd className="font-medium mt-0.5">{worst.name} ({worst.aqi})</dd>
        </div>
        <div>
          <dt className="text-haze-mute">Time in unhealthy air</dt>
          <dd className="font-medium mt-0.5">{unhealthyHours} hrs</dd>
        </div>
      </dl>
    </div>
  )
}
