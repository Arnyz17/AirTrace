import { colorForLabel } from '../data/aqiBands'

export default function ExposureBreakdownChart({ data }) {
  if (!data || data.length === 0) return null

  const totalHours = data.reduce((sum, item) => sum + (item.hours || 0), 0)

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
          Air Quality Category Time Breakdown
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">{Math.round(totalHours * 10) / 10} Total Hours</span>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const color = colorForLabel(item.band)
          const pct = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0

          return (
            <div key={item.band || idx} className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium text-slate-200">{item.band}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{item.hours}h</span>
                  <span className="text-slate-400 text-[11px]">({pct}%)</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-900/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
