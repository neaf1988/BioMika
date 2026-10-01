import {
  formatBoundary,
  GAUGE_LEVEL_COLOR,
  GAUGE_LEVEL_LABEL,
  GAUGE_LEVEL_TEXT_CLASS,
  levelForValue,
  mergedZoneRanges,
  type GaugeConfig,
  type GaugeLevel,
} from '../lib/gaugeZones'

interface MetricSegmentBarProps {
  value: number | null
  config: GaugeConfig
  level?: GaugeLevel | null
  ariaLabel: string
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

export function MetricSegmentBar({
  value,
  config,
  level,
  ariaLabel,
}: MetricSegmentBarProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <p className="mt-2 text-center text-xs text-slate-400">
        Sin dato para la escala
      </p>
    )
  }

  const resolvedLevel = level ?? levelForValue(value, config)
  const markerPct = toPercent(value, config.min, config.max)
  const zones = mergedZoneRanges(config)
  const boundaries = [
    config.min,
    ...config.segments.map((s) => s.to),
  ].filter((v, i, arr) => i === 0 || v !== arr[i - 1])

  return (
    <div className="mt-3" role="img" aria-label={ariaLabel}>
      <div className="mb-1 flex items-baseline justify-between text-[10px] text-slate-500">
        <span>{formatBoundary(config.min, config)}</span>
        <span className="text-sm font-semibold text-slate-900">
          {config.format(value)}
        </span>
        <span>{formatBoundary(config.max, config)}</span>
      </div>

      <div className="relative pb-5">
        <div className="relative h-5 w-full">
          <div
            className="absolute inset-x-0 top-1 flex h-4 overflow-hidden rounded-full ring-1 ring-slate-200"
            aria-hidden
          >
            {config.segments.map((seg, i) => {
              const w =
                toPercent(seg.to, config.min, config.max) -
                toPercent(seg.from, config.min, config.max)
              return (
                <div
                  key={`${seg.from}-${seg.level}-${i}`}
                  style={{
                    width: `${w}%`,
                    backgroundColor: GAUGE_LEVEL_COLOR[seg.level],
                  }}
                  title={`${GAUGE_LEVEL_LABEL[seg.level]}: ${formatBoundary(seg.from, config)} – ${formatBoundary(seg.to, config)}`}
                />
              )
            })}
          </div>
          <div
            className="pointer-events-none absolute top-0 flex h-5 -translate-x-1/2 flex-col items-center"
            style={{ left: `${markerPct}%` }}
          >
            <div className="h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent border-b-slate-900" />
            <div className="w-0.5 flex-1 bg-slate-900" />
          </div>
        </div>

        <div className="relative mt-1 h-3 w-full" aria-hidden>
          {boundaries.slice(1, -1).map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 text-[9px] text-slate-400"
              style={{ left: `${toPercent(tick, config.min, config.max)}%` }}
            >
              {formatBoundary(tick, config)}
            </span>
          ))}
        </div>
      </div>

      <p
        className={`text-center text-sm font-semibold ${GAUGE_LEVEL_TEXT_CLASS[resolvedLevel]}`}
      >
        {GAUGE_LEVEL_LABEL[resolvedLevel]}
      </p>

      <ul className="mx-auto mt-2 space-y-1 text-[11px] leading-snug text-slate-600">
        {zones.map((z) => (
          <li key={`${z.level}-${z.from}`} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: GAUGE_LEVEL_COLOR[z.level] }}
            />
            <span className="font-medium text-slate-700">
              {GAUGE_LEVEL_LABEL[z.level]}:
            </span>
            <span>
              {formatBoundary(z.from, config)} – {formatBoundary(z.to, config)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
