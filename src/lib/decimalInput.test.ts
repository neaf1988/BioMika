import { describe, expect, it } from 'vitest'
import { parseDecimalInput, sanitizeDecimalTyping } from './decimalInput'

describe('decimalInput', () => {
  it('converts comma to dot while typing', () => {
    expect(sanitizeDecimalTyping('70,5')).toBe('70.5')
  })

  it('parses comma decimals', () => {
    expect(parseDecimalInput('82,3')).toBe(82.3)
  })

  it('returns null for empty', () => {
    expect(parseDecimalInput('')).toBeNull()
  })
})
