import { useEffect, useState } from 'react'

/** Texto en pantalla mientras se escribe (p. ej. "70," → "70.") sin perder decimales a medias. */
export function useDecimalFieldTexts(resetWhen: string) {
  const [texts, setTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    setTexts({})
  }, [resetWhen])

  function display(
    key: string,
    stored: number | null | undefined,
    options?: { hideZero?: boolean },
  ): string {
    if (key in texts) return texts[key]!
    if (stored == null) return ''
    if (options?.hideZero && stored === 0) return ''
    return String(stored)
  }

  function setText(key: string, raw: string) {
    setTexts((prev) => ({ ...prev, [key]: raw }))
  }

  function clearKey(key: string) {
    setTexts((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  return { display, setText, clearKey, texts }
}
