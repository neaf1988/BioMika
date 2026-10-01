import { describe, expect, it } from 'vitest'
import {
  calculateGoalWeightFromLeanMass,
  computeMetrics,
  fatMassToPercent,
  leanMassKg,
} from './metrics'
import type { Entry, UserProfile } from '../types'

const profile: UserProfile = {
  id: 'main_user',
  dob: '1990-01-01',
  height: 170,
  gender: 'female',
  goalWeight: 77,
  goalBodyFatPercent: 24,
  goalDirection: 'lose',
  goalFatDirection: 'lose',
  goalMmeDirection: 'gain',
}

describe('lean mass goal weight', () => {
  it('matches example: 90 kg, 35% fat, 24% goal → 77 kg', () => {
    const lean = leanMassKg(90, 35, 'percent')
    expect(lean).toBeCloseTo(58.5, 1)
    const goal = calculateGoalWeightFromLeanMass(58.5, 24)
    expect(goal).toBeCloseTo(77, 1)
  })

  it('derives percent from fat kg', () => {
    expect(fatMassToPercent(90, 31.5, 'kg')).toBeCloseTo(35, 1)
  })
})

describe('computeMetrics', () => {
  it('computes BMI', () => {
    const entry: Entry = { date: '2026-01-01', weight: 70 }
    const m = computeMetrics(profile, entry)
    expect(m.bmi).toBeCloseTo(70 / (1.7 * 1.7), 2)
  })

  it('computes WHtR and WHR when circumferences present', () => {
    const entry: Entry = {
      date: '2026-01-01',
      weight: 70,
      waist: 85,
      glutes: 100,
    }
    const m = computeMetrics(profile, entry)
    expect(m.whtr).toBeCloseTo(85 / 170, 3)
    expect(m.whr).toBeCloseTo(0.85, 3)
  })
})
