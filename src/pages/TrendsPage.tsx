import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useRef } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { exportDatabase, importDatabase } from '../db/database'
import { db } from '../db/database'
import { chartYDomain, formatYTick } from '../lib/chartDomain'
import { fatMassToPercent } from '../lib/metrics'

export function TrendsPage() {
  const entries = useLiveQuery(() => db.entries.orderBy('date').toArray(), []) ?? []
  const fileRef = useRef<HTMLInputElement>(null)

  const chartData = useMemo(
    () =>
      entries.map((e) => ({
        date: e.date,
        peso: e.weight,
        mme: e.skeletalMuscleMass ?? null,
        grasaPct:
          fatMassToPercent(e.weight, e.fatMass, e.fatMassUnit ?? null) ?? null,
        energia: e.energyLevel ?? null,
      })),
    [entries],
  )

  async function handleExport() {
    const json = await exportDatabase()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biomika-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File, mode: 'replace' | 'merge') {
    const text = await file.text()
    await importDatabase(text, mode)
  }

  if (entries.length < 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-teal-900">Tendencias</h2>
        <p className="text-sm text-slate-600">
          Registra al menos dos días para ver gráficas.
        </p>
        <ExportImportSection
          fileRef={fileRef}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-teal-900">Tendencias</h2>
        <p className="text-sm text-slate-600">Evolución en el tiempo</p>
      </div>

      <ChartBlock
        title="Peso (kg)"
        dataKey="peso"
        data={chartData}
        color="#0f766e"
        minHalfSpread={0.3}
      />
      <ChartBlock
        title="MME (kg)"
        dataKey="mme"
        data={chartData}
        color="#0369a1"
        minHalfSpread={0.3}
      />
      <ChartBlock
        title="Grasa registrada (%)"
        dataKey="grasaPct"
        data={chartData}
        color="#b45309"
        minHalfSpread={0.5}
      />
      <ChartBlock
        title="Energía (1–5)"
        dataKey="energia"
        data={chartData}
        color="#7c3aed"
        minHalfSpread={0.5}
      />

      <ExportImportSection
        fileRef={fileRef}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  )
}

function ChartBlock({
  title,
  dataKey,
  data,
  color,
  minHalfSpread,
}: {
  title: string
  dataKey: string
  data: Record<string, string | number | null>[]
  color: string
  minHalfSpread?: number
}) {
  const hasValues = data.some((d) => d[dataKey] != null)
  if (!hasValues) return null

  const seriesValues = data.map((d) => d[dataKey] as number | null)
  const domain = chartYDomain(seriesValues, { minHalfSpread })
  const yDomain =
    domain[0] === 'auto'
      ? undefined
      : (domain as [number, number])

  return (
    <section className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-medium text-slate-700">{title}</h3>
      {yDomain ? (
        <p className="mb-2 text-[10px] text-slate-500">
          Escala: {formatYTick(yDomain[0], yDomain)} –{' '}
          {formatYTick(yDomain[1], yDomain)}
        </p>
      ) : null}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              width={44}
              domain={yDomain ?? ['auto', 'auto']}
              tickFormatter={(v) =>
                yDomain ? formatYTick(Number(v), yDomain) : String(v)
              }
            />
            <Tooltip
              formatter={(value) => {
                const n = typeof value === 'number' ? value : Number(value)
                if (Number.isNaN(n)) return value
                return yDomain ? formatYTick(n, yDomain) : n
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function ExportImportSection({
  fileRef,
  onExport,
  onImport,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>
  onExport: () => void
  onImport: (file: File, mode: 'replace' | 'merge') => Promise<void>
}) {
  return (
    <section className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-4">
      <h3 className="mb-2 text-sm font-medium text-teal-900">Copia de seguridad</h3>
      <p className="mb-3 text-xs text-slate-600">
        Exporta o importa JSON local. No se envía nada a internet.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg bg-teal-700 py-2 text-sm font-medium text-white"
        >
          Exportar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const merge = window.confirm(
              '¿Fusionar por fecha?\n\nAceptar = fusionar\nCancelar = reemplazar todo',
            )
            await onImport(file, merge ? 'merge' : 'replace')
            e.target.value = ''
            alert('Importación completada')
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-teal-600 py-2 text-sm font-medium text-teal-800"
        >
          Importar JSON
        </button>
      </div>
    </section>
  )
}
