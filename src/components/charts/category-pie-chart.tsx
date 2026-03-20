'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface Props {
  data: Record<string, number>
}

export default function CategoryPieChart({ data }: Props) {
  const entries = Object.entries(data).map(([name, value]) => ({ name: formatLabel(name), value }))

  if (entries.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={entries}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {entries.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => {
            const total = entries.reduce((s, e) => s + e.value, 0)
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return [`${value} (${pct}%)`, name]
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
