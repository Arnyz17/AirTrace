export default function ErrorState({ message, onRetry }) {
  return (
    <div className="border border-aqi-unhealthy/40 bg-aqi-unhealthy/5 rounded-lg p-6 text-center">
      <p className="font-medium text-aqi-unhealthy mb-1">Couldn't load today's air data</p>
      <p className="text-sm text-haze-mute mb-4">{message || 'The server didn\u2019t respond. Check your connection and try again.'}</p>
      <button
        onClick={onRetry}
        className="text-sm font-medium bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-deep transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
