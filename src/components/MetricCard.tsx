import type { ReactNode } from 'react'
import type { TrendSignal } from '../types'
import { trendColorClass } from '../lib/trends'
import { GAUGE_LEVEL_LABEL, type GaugeConfig, type GaugeLevel } from '../lib/gaugeZones'
import { MetricSegmentBar } from './MetricSegmentBar'

interface MetricCardProps {
  label: string
  current: string
  previous?: string
  delta?: string | null
  signal?: TrendSignal
  /** Etiqueta de zona (Ok / Intermedio / Malo) cuando hay velocímetro */
  level?: GaugeLevel | null
  gaugeValue?: number | null
  gaugeConfig?: GaugeConfig
  children?: ReactNode
}

export function MetricCard({
  label,
  current,
  previous,
  delta,
  signal = 'neutral',
  level,
  gaugeValue,
  gaugeConfig,
}: MetricCardProps) {
  const showGauge = gaugeConfig != null

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{current}</p>
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
      {showGauge ? (
        <MetricSegmentBar
          value={gaugeValue ?? null}
          config={gaugeConfig}
          level={level}
          ariaLabel={`${label}: ${level ? GAUGE_LEVEL_LABEL[level] : 'sin clasificación'}`}
        />
      ) : null}
    </div>
  )
}
