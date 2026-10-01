/** Dominio Y ajustado a min/max de los datos (con margen) para ver variaciones pequeñas. */
export function chartYDomain(
  values: (number | null | undefined)[],
  options?: { paddingRatio?: number; minHalfSpread?: number },
): [number, number] | ['auto', 'auto'] {
  const nums = values.filter(
    (v): v is number => v != null && !Number.isNaN(v),
  )
  if (nums.length === 0) return ['auto', 'auto']

  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const paddingRatio = options?.paddingRatio ?? 0.12
  const minHalfSpread = options?.minHalfSpread

  if (min === max) {
    const half =
      minHalfSpread ??
      (Math.abs(min) >= 10 ? Math.max(0.5, min * 0.01) : 0.25)
    return [min - half, max + half]
  }

  const span = max - min
  const pad = Math.max(span * paddingRatio, minHalfSpread ?? span * 0.05)
  return [min - pad, max + pad]
}

export function formatYTick(value: number, domain: [number, number]): string {
  const span = domain[1] - domain[0]
  if (span < 2) return value.toFixed(2)
  if (span < 10) return value.toFixed(1)
  return value.toFixed(0)
}
