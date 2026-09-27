export default function Header({ date, onDateChange, onOpenAddVisit, onOpenAnalytics, isMockFallback }) {
  return (
    <header className="border-b border-haze-line pb-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
              AirTrace
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isMockFallback
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isMockFallback ? '🟡 Mock Mode' : '🟢 SQLite Backend Live'}
            </span>
          </div>
          <p className="text-haze-mute text-xs md:text-sm mt-1 max-w-md">
            Personalized air quality exposure profile tracked from your actual movement history.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-haze-panel hover:bg-haze-line border border-haze-line px-3 py-1.5 rounded-md font-medium text-haze-ink transition flex items-center gap-1.5"
          >
            <span>📖</span> API Docs
          </a>

          <button
            onClick={onOpenAnalytics}
            className="text-xs bg-haze-panel hover:bg-haze-line border border-haze-line px-3 py-1.5 rounded-md font-medium text-haze-ink transition flex items-center gap-1.5"
          >
            <span>📊</span> Analytics Engine
          </button>

          <button
            onClick={onOpenAddVisit}
            className="text-xs bg-teal hover:bg-teal/90 text-black px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5"
          >
            <span>+</span> Log Visit
          </button>

          <div className="h-6 w-px bg-haze-line mx-1 hidden sm:block" />

          <label className="flex items-center gap-2 text-xs">
            <span className="text-haze-mute font-medium">Date</span>
            <input
              type="date"
              value={date}
              onChange={e => onDateChange(e.target.value)}
              className="bg-haze-panel border border-haze-line rounded-md px-2.5 py-1.5 text-haze-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
            />
          </label>
        </div>
      </div>
    </header>
  )
}
