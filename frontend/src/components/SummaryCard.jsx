import { bandFor } from '../data/aqiBands'

function getHealthAdvice(avgAqi) {
  if (avgAqi <= 50) {
    return {
      text: 'Air quality is satisfactory. Ideal for outdoor workouts & activities.',
      badge: '🟢 Excellent Air Day',
      glow: 'shadow-glow-emerald',
    }
  }
  if (avgAqi <= 100) {
    return {
      text: 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.',
      badge: '🟡 Moderate Exposure',
      glow: 'shadow-glow-amber',
    }
  }
  if (avgAqi <= 150) {
    return {
      text: 'Elevated pollution detected. Sensitive groups may experience health effects.',
      badge: '🟠 Sensitive Caution',
      glow: 'shadow-glow-rose',
    }
  }
  return {
    text: 'High pollution exposure recorded. Consider spending time in filtered indoor spaces.',
    badge: '🔴 Unhealthy Air Warning',
    glow: 'shadow-glow-rose',
  }
}

export default function SummaryCard({ summary }) {
  if (!summary) return null
  const { avg, worst, unhealthyHours, totalExposure, totalMinutesTracked, highestExposureLocation } = summary
  const band = bandFor(avg)
  const advice = getHealthAdvice(avg)

  const trackedHours = Math.round((totalMinutesTracked / 60) * 10) / 10

  return (
    <div className={`glass-panel rounded-2xl p-5 md:p-6 relative overflow-hidden border border-slate-800 transition-all ${advice.glow}`}>
      {/* Background ambient color tint */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: band.color }}
      />

      <div className="flex justify-between items-center mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Daily Exposure Index
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
          style={{
            backgroundColor: `${band.color}15`,
            borderColor: `${band.color}40`,
            color: band.color,
          }}
        >
          {advice.badge}
        </span>
      </div>

      {/* Main AQI Metric Display */}
      <div className="flex items-baseline gap-4 mb-3">
        <span className="font-display text-5xl md:text-6xl font-extrabold tracking-tight" style={{ color: band.color }}>
          {avg}
        </span>
        <div>
          <span className="font-display text-lg font-bold block text-slate-200">
            Weighted Avg AQI
          </span>
          <span className="text-xs font-medium" style={{ color: band.color }}>
            {band.label} Category
          </span>
        </div>
      </div>

      {/* Health Guidance Message */}
      <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4">
        {advice.text}
      </p>

      {/* Sub-Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Highest AQI Spot</span>
          <span className="font-semibold text-slate-200 truncate block">
            {worst.name} ({worst.aqi})
          </span>
        </div>

        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Highest Exposure Spot</span>
          <span className="font-semibold text-emerald-400 truncate block">
            {highestExposureLocation || worst.name}
          </span>
        </div>

        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Time Tracked</span>
          <span className="font-semibold text-slate-200 block">{trackedHours} hrs</span>
        </div>

        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Total Exposure Index</span>
          <span className="font-semibold text-cyan-400 block">
            {totalExposure ? totalExposure.toLocaleString() : Math.round(avg * (totalMinutesTracked || 0)).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
