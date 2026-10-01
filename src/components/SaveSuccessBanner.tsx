import type { ReactNode } from 'react'

export function SaveSuccessBanner({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm"
    >
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-1 text-sm">{children}</div> : null}
    </div>
  )
}
