import type { GoalDirection, TrendSignal, UserProfile } from '../types'
import {
  getBmiZone,
  isNavyBodyFatHealthy,
  isWhrHealthy,
  isWhtrHealthy,
} from './metrics'

export function delta(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null
  return current - previous
}

function directionSignal(
  change: number | null,
  goal: GoalDirection,
  epsilon = 0.01,
): TrendSignal {
  if (change == null || Math.abs(change) < epsilon) return 'neutral'
  if (goal === 'maintain') {
    return Math.abs(change) < 0.3 ? 'positive' : 'negative'
  }
  if (goal === 'lose') return change < 0 ? 'positive' : 'negative'
  return change > 0 ? 'positive' : 'negative'
}

export function weightTrendSignal(
  current: number,
  previous: number | null,
  profile: UserProfile,
): TrendSignal {
  if (previous == null) return 'neutral'
  const change = current - previous
  if (profile.goalWeight != null) {
    const prevDist = Math.abs(previous - profile.goalWeight)
    const currDist = Math.abs(current - profile.goalWeight)
    if (currDist < prevDist - 0.01) return 'positive'
    if (currDist > prevDist + 0.01) return 'negative'
    return 'neutral'
  }
  return directionSignal(change, profile.goalDirection)
}

export function goalMetricTrend(
  current: number | null,
  previous: number | null,
  goal: GoalDirection,
): TrendSignal {
  return directionSignal(delta(current, previous), goal)
}

function bmiScore(bmi: number): number {
  if (bmi >= 18.5 && bmi < 25) return 0
  if (bmi < 18.5) return 18.5 - bmi
  return bmi - 24.9
}

export function bmiTrendSignal(
  current: number | null,
  previous: number | null,
): TrendSignal {
  if (current == null || previous == null) return 'neutral'
  const curr = bmiScore(current)
  const prev = bmiScore(previous)
  if (curr < prev - 0.05) return 'positive'
  if (curr > prev + 0.05) return 'negative'
  return 'neutral'
}

export function whtrTrendSignal(
  current: number | null,
  previous: number | null,
): TrendSignal {
  if (current == null || previous == null) return 'neutral'
  const change = current - previous
  if (change < -0.005) return 'positive'
  if (change > 0.005) return 'negative'
  return 'neutral'
}

export function whrTrendSignal(
  current: number | null,
  previous: number | null,
  gender: UserProfile['gender'],
): TrendSignal {
  if (current == null || previous == null) return 'neutral'
  const change = current - previous
  const limit = gender === 'male' ? 0.9 : 0.85
  const prevOk = previous < limit
  const currOk = current < limit
  if (!prevOk && currOk) return 'positive'
  if (prevOk && !currOk) return 'negative'
  if (change < -0.005) return 'positive'
  if (change > 0.005) return 'negative'
  return 'neutral'
}

export function navyTrendSignal(
  current: number | null,
  previous: number | null,
  gender: UserProfile['gender'],
): TrendSignal {
  if (current == null || previous == null) return 'neutral'
  const change = current - previous
  const healthy = isNavyBodyFatHealthy(current, gender)
  const wasHealthy = isNavyBodyFatHealthy(previous, gender)
  if (healthy === false && change < -0.2) return 'positive'
  if (wasHealthy === false && healthy === true) return 'positive'
  if (healthy === false && change > 0.2) return 'negative'
  if (wasHealthy === true && healthy === false) return 'negative'
  return 'neutral'
}

export function zoneLabelBmi(bmi: number | null): string {
  const zone = getBmiZone(bmi)
  switch (zone) {
    case 'underweight':
      return 'Bajo peso'
    case 'normal':
      return 'Normal'
    case 'overweight':
      return 'Sobrepeso'
    case 'obese':
      return 'Obesidad'
    default:
      return '—'
  }
}

export function zoneLabelWhtr(whtr: number | null): string {
  if (whtr == null) return '—'
  return isWhtrHealthy(whtr) ? 'Riesgo bajo' : 'Riesgo elevado'
}

export function zoneLabelWhr(whr: number | null, gender: UserProfile['gender']): string {
  if (whr == null) return '—'
  return isWhrHealthy(whr, gender) ? 'Riesgo bajo' : 'Riesgo elevado'
}

export function zoneLabelNavy(
  pct: number | null,
  gender: UserProfile['gender'],
): string {
  if (pct == null) return '—'
  const ok = isNavyBodyFatHealthy(pct, gender)
  if (ok == null) return '—'
  return ok ? 'Rango saludable' : 'Fuera de rango'
}

export function trendColorClass(signal: TrendSignal): string {
  switch (signal) {
    case 'positive':
      return 'text-emerald-700 bg-emerald-50'
    case 'negative':
      return 'text-rose-700 bg-rose-50'
    default:
      return 'text-slate-600 bg-slate-100'
  }
}
