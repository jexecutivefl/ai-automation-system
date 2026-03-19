export default function ConfidenceBar({ confidence }: { confidence: number | null }) {
  if (confidence === null || confidence === undefined) {
    return <span className="text-xs text-slate-400">—</span>
  }

  const pct = Math.round(confidence * 100)
  const color =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 70 ? 'bg-blue-500' :
    pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 tabular-nums">{pct}%</span>
    </div>
  )
}
