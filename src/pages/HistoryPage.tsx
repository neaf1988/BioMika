import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { getEntriesSortedDesc } from '../db/database'
import { formatDisplayDate } from '../lib/dates'
import { fatMassToPercent } from '../lib/metrics'

export function HistoryPage() {
  const entries = useLiveQuery(() => getEntriesSortedDesc(), []) ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-teal-900">Historial</h2>
        <p className="text-sm text-slate-600">
          Todas tus mediciones, de la más reciente a la más antigua.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="mb-3 text-slate-600">No hay registros todavía.</p>
          <Link
            to="/registro"
            className="inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm text-white"
          >
            Crear medición
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const fatPct = fatMassToPercent(
              entry.weight,
              entry.fatMass,
              entry.fatMassUnit ?? null,
            )
            return (
              <li key={entry.date}>
                <Link
                  to={`/registro?fecha=${entry.date}`}
                  className="block rounded-xl border border-teal-100 bg-white p-4 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-teal-900">
                        {formatDisplayDate(entry.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Peso:{' '}
                        <span className="font-semibold text-slate-900">
                          {entry.weight.toFixed(1)} kg
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-medium text-teal-700">
                      Editar →
                    </span>
                  </div>
                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {entry.waist != null ? (
                      <div>
                        <dt className="inline">Cintura: </dt>
                        <dd className="inline">{entry.waist} cm</dd>
                      </div>
                    ) : null}
                    {fatPct != null ? (
                      <div>
                        <dt className="inline">Grasa: </dt>
                        <dd className="inline">{fatPct.toFixed(1)}%</dd>
                      </div>
                    ) : null}
                    {entry.skeletalMuscleMass != null ? (
                      <div>
                        <dt className="inline">MME: </dt>
                        <dd className="inline">
                          {entry.skeletalMuscleMass.toFixed(1)} kg
                        </dd>
                      </div>
                    ) : null}
                    {entry.energyLevel != null ? (
                      <div>
                        <dt className="inline">Energía: </dt>
                        <dd className="inline">{entry.energyLevel}/5</dd>
                      </div>
                    ) : null}
                    {entry.notes ? (
                      <div className="w-full truncate italic">{entry.notes}</div>
                    ) : null}
                  </dl>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Link
        to="/registro"
        className="block text-center text-sm font-medium text-teal-800 underline"
      >
        Nueva medición
      </Link>
    </div>
  )
}
