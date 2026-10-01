import { describe, expect, it } from 'vitest'
import {
  classifyBmi,
  classifyBodyFatPercent,
  classifyWellbeingScale,
  classifyWhtr,
} from './gaugeZones'

describe('gaugeZones', () => {
  it('classifies BMI zones', () => {
    expect(classifyBmi(22)).toBe('ok')
    expect(classifyBmi(27)).toBe('intermedio')
    expect(classifyBmi(32)).toBe('malo')
  })

  it('classifies WHtR', () => {
    expect(classifyWhtr(0.45)).toBe('ok')
    expect(classifyWhtr(0.55)).toBe('intermedio')
    expect(classifyWhtr(0.65)).toBe('malo')
  })

  it('classifies body fat for female', () => {
    expect(classifyBodyFatPercent(24, 'female')).toBe('ok')
    expect(classifyBodyFatPercent(30, 'female')).toBe('intermedio')
  })

  it('classifies wellbeing scale', () => {
    expect(classifyWellbeingScale(5)).toBe('ok')
    expect(classifyWellbeingScale(3)).toBe('intermedio')
    expect(classifyWellbeingScale(2)).toBe('malo')
  })
})
