export default function Header({
  date,
  onDateChange,
  availableDates = ['2026-09-26', '2026-09-25', '2026-09-24'],
  onOpenAddVisit,
  onOpenAnalytics,
  isMockFallback,
}) {
  return (
    <header className="glass-panel rounded-2xl p-4 md:p-6 mb-6 shadow-2xl relative overflow-hidden border border-slate-800">
      {/* Background ambient glow effect */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xl">🍃</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AirTrace
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  v1.1
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm mt-0.5">
                Personalized Air Quality Exposure Tracker · Real-time Movement Ingestion
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Date Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isMockFallback ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-medium text-slate-300">
              {isMockFallback ? 'Mock Mode' : 'SQLite DB Live'}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 font-medium transition-all flex items-center gap-1.5 hover:shadow-lg"
          >
            <span>📖</span> API Docs
          </a>

          <button
            onClick={onOpenAnalytics}
            className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 font-medium transition-all flex items-center gap-1.5 hover:shadow-lg"
          >
            <span>📊</span> Analytics
          </button>

          <button
            onClick={onOpenAddVisit}
            className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <span>+</span> Log Visit
          </button>

          {/* Date Picker & Quick Date Buttons */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex gap-1 hidden sm:flex">
              {availableDates.slice(0, 3).map((d) => (
                <button
                  key={d}
                  onClick={() => onDateChange(d)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium ${
                    date === d
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {d.slice(5)}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
