import type { Gender, UserProfile } from '../types'
import { PROFILE_ID } from '../types'

export function defaultGoalBodyFatPercent(gender: Gender): number {
  return gender === 'male' ? 13.5 : 24
}

export function goalBodyFatRange(gender: Gender): { min: number; max: number } {
  return gender === 'male' ? { min: 12, max: 15 } : { min: 22, max: 25 }
}

export function createDefaultProfile(partial?: Partial<UserProfile>): UserProfile {
  const gender = partial?.gender ?? 'female'
  return {
    id: PROFILE_ID,
    dob: partial?.dob ?? '',
    height: partial?.height ?? 170,
    gender,
    goalWeight: partial?.goalWeight ?? null,
    goalBodyFatPercent:
      partial?.goalBodyFatPercent ?? defaultGoalBodyFatPercent(gender),
    goalDirection: partial?.goalDirection ?? 'maintain',
    goalFatDirection: partial?.goalFatDirection ?? 'lose',
    goalMmeDirection: partial?.goalMmeDirection ?? 'gain',
  }
}

export function calculateAge(dob: string, referenceDate = new Date()): number | null {
  if (!dob) return null
  const birth = new Date(dob + 'T12:00:00')
  if (Number.isNaN(birth.getTime())) return null
  let age = referenceDate.getFullYear() - birth.getFullYear()
  const m = referenceDate.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}
