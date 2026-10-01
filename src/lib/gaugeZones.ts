import type { Gender } from '../types'

export type GaugeLevel = 'ok' | 'intermedio' | 'malo'

export const GAUGE_LEVEL_LABEL: Record<GaugeLevel, string> = {
  ok: 'Ok',
  intermedio: 'Intermedio',
  malo: 'Malo',
}

export const GAUGE_LEVEL_COLOR: Record<GaugeLevel, string> = {
  ok: '#059669',
  intermedio: '#ea580c',
  malo: '#dc2626',
}

export const GAUGE_LEVEL_TEXT_CLASS: Record<GaugeLevel, string> = {
  ok: 'text-emerald-700',
  intermedio: 'text-orange-600',
  malo: 'text-rose-700',
}

export interface GaugeSegment {
  from: number
  to: number
  level: GaugeLevel
}

export interface GaugeConfig {
  min: number
  max: number
  segments: GaugeSegment[]
  format: (v: number) => string
}

export interface ZoneRange {
  level: GaugeLevel
  from: number
  to: number
}

/** Une tramos contiguos del mismo nivel para mostrar límites por color. */
export function mergedZoneRanges(config: GaugeConfig): ZoneRange[] {
  const out: ZoneRange[] = []
  for (const seg of config.segments) {
    const last = out.at(-1)
    if (last && last.level === seg.level) {
      last.to = seg.to
    } else {
      out.push({ level: seg.level, from: seg.from, to: seg.to })
    }
  }
  return out
}

export function formatBoundary(value: number, config: GaugeConfig): string {
  const raw = config.format(value)
  return raw.replace(/%$/, '').trim()
}

export function classifyBmi(bmi: number): GaugeLevel {
  if (bmi >= 18.5 && bmi < 25) return 'ok'
  if ((bmi >= 17 && bmi < 18.5) || (bmi >= 25 && bmi < 30)) return 'intermedio'
  return 'malo'
}

export function bmiGaugeConfig(): GaugeConfig {
  return {
    min: 16,
    max: 35,
    segments: [
      { from: 16, to: 17, level: 'malo' },
      { from: 17, to: 18.5, level: 'intermedio' },
      { from: 18.5, to: 25, level: 'ok' },
      { from: 25, to: 30, level: 'intermedio' },
      { from: 30, to: 35, level: 'malo' },
    ],
    format: (v) => v.toFixed(1),
  }
}

export function classifyWhtr(v: number): GaugeLevel {
  if (v < 0.5) return 'ok'
  if (v < 0.6) return 'intermedio'
  return 'malo'
}

export function whtrGaugeConfig(): GaugeConfig {
  return {
    min: 0.35,
    max: 0.7,
    segments: [
      { from: 0.35, to: 0.5, level: 'ok' },
      { from: 0.5, to: 0.6, level: 'intermedio' },
      { from: 0.6, to: 0.7, level: 'malo' },
    ],
    format: (v) => v.toFixed(2),
  }
}

export function classifyWhr(v: number, gender: Gender): GaugeLevel {
  const okMax = gender === 'male' ? 0.9 : 0.85
  const interMax = gender === 'male' ? 1.0 : 0.95
  if (v < okMax) return 'ok'
  if (v < interMax) return 'intermedio'
  return 'malo'
}

export function whrGaugeConfig(gender: Gender): GaugeConfig {
  const okMax = gender === 'male' ? 0.9 : 0.85
  const interMax = gender === 'male' ? 1.0 : 0.95
  return {
    min: 0.65,
    max: 1.1,
    segments: [
      { from: 0.65, to: okMax, level: 'ok' },
      { from: okMax, to: interMax, level: 'intermedio' },
      { from: interMax, to: 1.1, level: 'malo' },
    ],
    format: (v) => v.toFixed(2),
  }
}

export function classifyBodyFatPercent(
  pct: number,
  gender: Gender,
): GaugeLevel {
  if (gender === 'male') {
    if (pct >= 8 && pct <= 20) return 'ok'
    if ((pct >= 6 && pct < 8) || (pct > 20 && pct <= 25)) return 'intermedio'
    return 'malo'
  }
  if (pct >= 18 && pct <= 28) return 'ok'
  if ((pct >= 14 && pct < 18) || (pct > 28 && pct <= 32)) return 'intermedio'
  return 'malo'
}

export function bodyFatGaugeConfig(gender: Gender): GaugeConfig {
  if (gender === 'male') {
    return {
      min: 4,
      max: 35,
      segments: [
        { from: 4, to: 6, level: 'malo' },
        { from: 6, to: 8, level: 'intermedio' },
        { from: 8, to: 20, level: 'ok' },
        { from: 20, to: 25, level: 'intermedio' },
        { from: 25, to: 35, level: 'malo' },
      ],
      format: (v) => `${v.toFixed(1)}%`,
    }
  }
  return {
    min: 10,
    max: 45,
    segments: [
      { from: 10, to: 14, level: 'malo' },
      { from: 14, to: 18, level: 'intermedio' },
      { from: 18, to: 28, level: 'ok' },
      { from: 28, to: 32, level: 'intermedio' },
      { from: 32, to: 45, level: 'malo' },
    ],
    format: (v) => `${v.toFixed(1)}%`,
  }
}

export function classifyWellbeingScale(score: number): GaugeLevel {
  if (score >= 4) return 'ok'
  if (score >= 3) return 'intermedio'
  return 'malo'
}

export function wellbeingGaugeConfig(): GaugeConfig {
  return {
    min: 1,
    max: 5,
    segments: [
      { from: 1, to: 3, level: 'malo' },
      { from: 3, to: 4, level: 'intermedio' },
      { from: 4, to: 5.01, level: 'ok' },
    ],
    format: (v) => String(Math.round(v)),
  }
}

export function levelForValue(
  value: number,
  config: GaugeConfig,
): GaugeLevel {
  const seg = config.segments.find((s) => value >= s.from && value < s.to)
  if (seg) return seg.level
  if (value < config.min) return config.segments[0]?.level ?? 'malo'
  return config.segments.at(-1)?.level ?? 'malo'
}
