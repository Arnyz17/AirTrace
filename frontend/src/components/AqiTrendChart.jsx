import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { bandFor } from '../data/aqiBands'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value
    const band = bandFor(val)
    const locName = payload[0].payload?.locationName

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-300 mb-1">{label} {locName ? `· ${locName}` : ''}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color }} />
          <span className="font-bold text-sm text-slate-100">AQI {val}</span>
          <span className="text-[11px] font-medium text-slate-400">({band.label})</span>
        </div>
      </div>
    )
  }
  return null
}

export default function AqiTrendChart({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
          Timeline AQI Exposure Trend
        </h3>
        <span className="text-[11px] text-emerald-400 font-medium">Recorded Visits</span>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1F293D" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#10B981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#aqiGradient)"
            dot={{ r: 4, fill: '#10B981', stroke: '#090D16', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#34D399', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
