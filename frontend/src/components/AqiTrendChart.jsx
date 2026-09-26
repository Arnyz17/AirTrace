import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AqiTrendChart({ data }) {
  return (
    <div className="bg-haze-panel border border-haze-line rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-haze-mute mb-3">AQI through the day</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#D8E0D8" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#5B6B60' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5B6B60' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#D8E0D8', fontSize: 13 }} />
          <Line type="monotone" dataKey="aqi" stroke="#2F6F6F" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
