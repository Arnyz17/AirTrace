import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { colorForLabel } from '../data/aqiBands'

export default function ExposureBreakdownChart({ data }) {
  return (
    <div className="bg-haze-panel border border-haze-line rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-haze-mute mb-3">Hours spent per air quality band</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#D8E0D8" vertical={false} />
          <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#5B6B60' }} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 12, fill: '#5B6B60' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#D8E0D8', fontSize: 13 }} />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={colorForLabel(entry.band)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
