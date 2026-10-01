import type { ComputedMetrics, Entry, Gender, UserProfile } from '../types'

const CM_TO_IN = 1 / 2.54

export function fatMassToPercent(
  weight: number,
  fatMass: number | null | undefined,
  unit: Entry['fatMassUnit'],
): number | null {
  if (fatMass == null || weight <= 0) return null
  if (unit === 'percent') return fatMass
  return (fatMass / weight) * 100
}

export function computeMetrics(profile: UserProfile, entry: Entry): ComputedMetrics {
  const heightM = profile.height / 100
  const bmi =
    heightM > 0 && entry.weight > 0 ? entry.weight / (heightM * heightM) : null

  const whtr =
    entry.waist != null && profile.height > 0
      ? entry.waist / profile.height
      : null

  const whr =
    entry.waist != null && entry.glutes != null && entry.glutes > 0
      ? entry.waist / entry.glutes
      : null

  const navyBodyFatPercent = computeNavyBodyFat(profile.gender, profile.height, entry)

  const fatPercentFromMass = fatMassToPercent(
    entry.weight,
    entry.fatMass,
    entry.fatMassUnit ?? null,
  )

  return { bmi, whtr, whr, navyBodyFatPercent, fatPercentFromMass }
}

function computeNavyBodyFat(
  gender: Gender,
  heightCm: number,
  entry: Entry,
): number | null {
  const waist = entry.waist
  const neck = entry.neck
  if (waist == null || neck == null || heightCm <= 0) return null

  const heightIn = heightCm * CM_TO_IN
  const waistIn = waist * CM_TO_IN
  const neckIn = neck * CM_TO_IN

  if (gender === 'male') {
    const abdomen = waistIn - neckIn
    if (abdomen <= 0) return null
    return (
      86.01 * Math.log10(abdomen) - 70.041 * Math.log10(heightIn) + 36.76
    )
  }

  const glutes = entry.glutes
  if (glutes == null) return null
  const hipIn = glutes * CM_TO_IN
  const sum = waistIn + hipIn - neckIn
  if (sum <= 0) return null
  return (
    163.205 * Math.log10(sum) -
    97.684 * Math.log10(heightIn) -
    78.387
  )
}

export function getBmiZone(bmi: number | null): import('../types').BmiZone | null {
  if (bmi == null) return null
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function isWhtrHealthy(whtr: number | null): boolean | null {
  if (whtr == null) return null
  return whtr < 0.5
}

export function isWhrHealthy(whr: number | null, gender: Gender): boolean | null {
  if (whr == null) return null
  return gender === 'male' ? whr < 0.9 : whr < 0.85
}

/** Simplified Navy % zones by gender (fitness-oriented). */
export function isNavyBodyFatHealthy(
  percent: number | null,
  gender: Gender,
): boolean | null {
  if (percent == null) return null
  if (gender === 'male') return percent >= 6 && percent <= 18
  return percent >= 14 && percent <= 32
}

export function leanMassKg(
  weight: number,
  fatMass: number | null | undefined,
  unit: Entry['fatMassUnit'],
): number | null {
  const pct = fatMassToPercent(weight, fatMass, unit)
  if (pct == null) return null
  return weight * (1 - pct / 100)
}

export function calculateGoalWeightFromLeanMass(
  leanMass: number,
  goalBodyFatPercent: number,
): number {
  const divisor = 1 - goalBodyFatPercent / 100
  if (divisor <= 0) return NaN
  return leanMass / divisor
}
