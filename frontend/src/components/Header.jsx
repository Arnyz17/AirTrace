export default function Header({ date, onDateChange }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-haze-line pb-5 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Your air, not the city's average
        </h1>
        <p className="text-haze-mute text-sm mt-1 max-w-md">
          Exposure tracked from where you actually went today, not a single fixed station.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-haze-mute">Date</span>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => onDateChange(e.target.value)}
          className="bg-haze-panel border border-haze-line rounded-md px-3 py-1.5 text-haze-ink focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal"
        />
      </label>
    </header>
  )
}
