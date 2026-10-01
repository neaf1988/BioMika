/** Acepta coma o punto como separador decimal (teclados móviles en español). */
export function sanitizeDecimalTyping(raw: string): string {
  const normalized = raw
    .replace(/\u00a0/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, '.')

  let out = ''
  let hasDot = false
  for (const ch of normalized) {
    if (ch >= '0' && ch <= '9') {
      out += ch
      continue
    }
    if (ch === '-' && out.length === 0) {
      out += ch
      continue
    }
    if (ch === '.' && !hasDot) {
      out += ch
      hasDot = true
    }
  }

  if (out === '.' || out === '-.') out = out.startsWith('-') ? '-0.' : '0.'
  else if (out.startsWith('.')) out = `0${out}`
  else if (out.startsWith('-.')) out = `-0.${out.slice(2)}`

  return out
}

export function parseDecimalInput(raw: string): number | null {
  const normalized = sanitizeDecimalTyping(raw)
  if (normalized === '' || normalized === '-' || normalized.endsWith('.')) {
    return null
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function isIncompleteDecimal(raw: string): boolean {
  const normalized = sanitizeDecimalTyping(raw)
  return normalized.endsWith('.') || normalized === '-'
}
