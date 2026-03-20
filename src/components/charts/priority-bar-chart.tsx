'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

function formatLabel(value: string): string {
  return value.replace(/\b\w/g, c => c.toUpperCase())
}

interface Props {
  data: Record<string, number>
}

export default function PriorityBarChart({ data }: Props) {
  const entries = Object.entries(data).map(([name, value]) => ({
    name: formatLabel(name),
    value,
    rawName: name,
  }))

  if (entries.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={entries} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={70} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {entries.map((entry) => (
            <Cell key={entry.rawName} fill={PRIORITY_COLORS[entry.rawName] || '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
