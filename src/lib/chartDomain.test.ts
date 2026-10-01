import { describe, expect, it } from 'vitest'
import { chartYDomain } from './chartDomain'

describe('chartYDomain', () => {
  it('adds padding around min and max', () => {
    const [lo, hi] = chartYDomain([70.2, 71.1, 70.8]) as [number, number]
    expect(lo).toBeLessThan(70.2)
    expect(hi).toBeGreaterThan(71.1)
    expect(hi - lo).toBeLessThan(2)
  })

  it('expands flat series so line is visible', () => {
    const [lo, hi] = chartYDomain([80, 80, 80]) as [number, number]
    expect(lo).toBeLessThan(80)
    expect(hi).toBeGreaterThan(80)
  })
})
