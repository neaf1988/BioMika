import type { TrendSignal } from '../types'
import { trendColorClass } from '../lib/trends'

interface MetricRowProps {
  label: string
  current: string
  previous?: string
  delta?: string | null
  zone?: string
  signal?: TrendSignal
}

export function MetricRow({
  label,
  current,
  previous,
  delta,
  zone,
  signal = 'neutral',
}: MetricRowProps) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{current}</p>
          {zone ? (
            <p className="mt-1 text-xs text-teal-800">{zone}</p>
          ) : null}
        </div>
        {delta != null ? (
          <span
            className={`rounded-md px-2 py-1 text-sm font-medium ${trendColorClass(signal)}`}
          >
            {delta}
          </span>
        ) : null}
      </div>
      {previous ? (
        <p className="mt-2 text-xs text-slate-500">Anterior: {previous}</p>
      ) : null}
    </div>
  )
}
