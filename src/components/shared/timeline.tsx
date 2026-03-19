interface TimelineEvent {
  id: string
  eventType: string
  message: string
  createdAt: string
  metadata?: string
}

const eventIcons: Record<string, { color: string; icon: string }> = {
  request_received: { color: 'bg-blue-500', icon: '↓' },
  classification_started: { color: 'bg-indigo-500', icon: '◎' },
  classification_completed: { color: 'bg-emerald-500', icon: '✓' },
  routing_started: { color: 'bg-violet-500', icon: '→' },
  routing_completed: { color: 'bg-emerald-500', icon: '✓' },
  workflow_created: { color: 'bg-blue-500', icon: '+' },
  workflow_updated: { color: 'bg-amber-500', icon: '↻' },
  action_triggered: { color: 'bg-indigo-500', icon: '⚡' },
  error: { color: 'bg-red-500', icon: '✕' },
  retry_requested: { color: 'bg-amber-500', icon: '↻' },
}

function formatEventType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-xs text-slate-400 py-4 text-center">No events recorded</p>
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const { color, icon } = eventIcons[event.eventType] || { color: 'bg-slate-400', icon: '•' }
          const isLast = idx === events.length - 1
          return (
            <li key={event.id}>
              <div className="relative pb-6">
                {!isLast && (
                  <span className="absolute left-3.5 top-7 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                )}
                <div className="relative flex items-start gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${color} text-white text-xs font-bold flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-700">
                        {formatEventType(event.eventType)}
                      </p>
                      <time className="text-[10px] text-slate-400 tabular-nums">
                        {formatTimestamp(event.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{event.message}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
