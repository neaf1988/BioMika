export type Gender = 'male' | 'female'
export type GoalDirection = 'lose' | 'gain' | 'maintain'
export type FatMassUnit = 'kg' | 'percent'

export const PROFILE_ID = 'main_user'

export interface UserProfile {
  id: string
  dob: string
  height: number
  gender: Gender
  goalWeight: number | null
  goalBodyFatPercent: number
  goalDirection: GoalDirection
  goalFatDirection: GoalDirection
  goalMmeDirection: Extract<GoalDirection, 'lose' | 'gain' | 'maintain'>
}

export interface Entry {
  id?: number
  date: string
  weight: number
  back?: number | null
  waist?: number | null
  glutes?: number | null
  leg?: number | null
  arm?: number | null
  neck?: number | null
  fatMass?: number | null
  fatMassUnit?: FatMassUnit | null
  skeletalMuscleMass?: number | null
  energyLevel?: number | null
  sleepQuality?: number | null
  notes?: string | null
}

export interface ComputedMetrics {
  bmi: number | null
  whtr: number | null
  whr: number | null
  navyBodyFatPercent: number | null
  fatPercentFromMass: number | null
}

export type BmiZone = 'underweight' | 'normal' | 'overweight' | 'obese'
export type TrendSignal = 'positive' | 'negative' | 'neutral'
