/** Acepta coma o punto como separador decimal (teclados móviles en español). */
export function sanitizeDecimalTyping(raw: string): string {
  let s = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (s.startsWith('.')) s = `0${s}`
  const parts = s.split('.')
  if (parts.length > 2) {
    s = `${parts[0]}.${parts.slice(1).join('')}`
  }
  if (s === '') return ''
  if (!/^-?\d*\.?\d*$/.test(s)) {
    return s.slice(0, -1)
  }
  return s
}

export function parseDecimalInput(raw: string): number | null {
  const normalized = sanitizeDecimalTyping(raw)
  if (normalized === '' || normalized === '-' || normalized.endsWith('.')) {
    return null
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}
