import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { MetricCard } from '../components/MetricCard'
import { MetricRow } from '../components/MetricRow'
import { getEntriesSortedDesc, getProfile } from '../db/database'
import { formatDisplayDate } from '../lib/dates'
import {
  bmiGaugeConfig,
  bodyFatGaugeConfig,
  classifyBmi,
  classifyBodyFatPercent,
  classifyWhr,
  classifyWhtr,
  whrGaugeConfig,
  whtrGaugeConfig,
} from '../lib/gaugeZones'
import { computeMetrics, fatMassToPercent } from '../lib/metrics'
import {
  bmiTrendSignal,
  delta,
  goalMetricTrend,
  navyTrendSignal,
  weightTrendSignal,
  whrTrendSignal,
  whtrTrendSignal,
} from '../lib/trends'

function fmt(n: number | null, digits = 1, suffix = ''): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits)}${suffix}`
}

function fmtDelta(d: number | null, suffix = ''): string | null {
  if (d == null) return null
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(1)}${suffix}`
}

export function DashboardPage() {
  const profile = useLiveQuery(() => getProfile(), [])
  const entries = useLiveQuery(() => getEntriesSortedDesc(), []) ?? []

  if (!profile?.dob) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm">
        <p className="mb-2">Configura tu perfil para ver métricas calculadas.</p>
        <Link to="/perfil" className="font-medium text-teal-800 underline">
          Configurar perfil
        </Link>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="mb-3 text-slate-600">Aún no hay mediciones.</p>
        <Link
          to="/registro"
          className="inline-block rounded-lg bg-teal-700 px-4 py-2 text-white"
        >
          Primera medición
        </Link>
      </div>
    )
  }

  const current = entries[0]
  const previous = entries[1]
  const mCurrent = computeMetrics(profile, current)
  const mPrev = previous ? computeMetrics(profile, previous) : null

  const fatPctCurrent = mCurrent.fatPercentFromMass
  const fatPctPrev = previous
    ? fatMassToPercent(
        previous.weight,
        previous.fatMass,
        previous.fatMassUnit ?? null,
      )
    : null
  const sameFatUnit =
    !previous ||
    !current.fatMass ||
    !previous.fatMass ||
    current.fatMassUnit === previous.fatMassUnit

  const bfConfig = bodyFatGaugeConfig(profile.gender)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-teal-900">Comparativa</h2>
        <p className="text-sm text-slate-600">
          Última medición ({formatDisplayDate(current.date)})
          {previous ? ` vs ${formatDisplayDate(previous.date)}` : ' · sin anterior'}
        </p>
      </div>

      <MetricRow
        label="Peso"
        current={`${fmt(current.weight, 1)} kg`}
        previous={previous ? `${fmt(previous.weight, 1)} kg` : undefined}
        delta={fmtDelta(delta(current.weight, previous?.weight ?? null), ' kg')}
        signal={weightTrendSignal(
          current.weight,
          previous?.weight ?? null,
          profile,
        )}
        zone={
          profile.goalWeight != null
            ? `Meta: ${profile.goalWeight} kg`
            : undefined
        }
      />

      <MetricCard
        label="IMC"
        current={fmt(mCurrent.bmi, 1)}
        previous={mPrev ? fmt(mPrev.bmi, 1) : undefined}
        delta={fmtDelta(delta(mCurrent.bmi, mPrev?.bmi ?? null))}
        signal={bmiTrendSignal(mCurrent.bmi, mPrev?.bmi ?? null)}
        gaugeValue={mCurrent.bmi}
        gaugeConfig={bmiGaugeConfig()}
        level={mCurrent.bmi != null ? classifyBmi(mCurrent.bmi) : null}
      />

      <MetricCard
        label="WHtR (cintura / estatura)"
        current={fmt(mCurrent.whtr, 2)}
        previous={mPrev ? fmt(mPrev.whtr, 2) : undefined}
        delta={fmtDelta(delta(mCurrent.whtr, mPrev?.whtr ?? null))}
        signal={whtrTrendSignal(mCurrent.whtr, mPrev?.whtr ?? null)}
        gaugeValue={mCurrent.whtr}
        gaugeConfig={whtrGaugeConfig()}
        level={mCurrent.whtr != null ? classifyWhtr(mCurrent.whtr) : null}
      />

      <MetricCard
        label="WHR (cintura / cadera)"
        current={fmt(mCurrent.whr, 2)}
        previous={mPrev ? fmt(mPrev.whr, 2) : undefined}
        delta={fmtDelta(delta(mCurrent.whr, mPrev?.whr ?? null))}
        signal={whrTrendSignal(mCurrent.whr, mPrev?.whr ?? null, profile.gender)}
        gaugeValue={mCurrent.whr}
        gaugeConfig={whrGaugeConfig(profile.gender)}
        level={
          mCurrent.whr != null ? classifyWhr(mCurrent.whr, profile.gender) : null
        }
      />

      <MetricCard
        label="% Grasa (Navy)"
        current={fmt(mCurrent.navyBodyFatPercent, 1, '%')}
        previous={
          mPrev ? fmt(mPrev.navyBodyFatPercent, 1, '%') : undefined
        }
        delta={fmtDelta(
          delta(mCurrent.navyBodyFatPercent, mPrev?.navyBodyFatPercent ?? null),
          '%',
        )}
        signal={navyTrendSignal(
          mCurrent.navyBodyFatPercent,
          mPrev?.navyBodyFatPercent ?? null,
          profile.gender,
        )}
        gaugeValue={mCurrent.navyBodyFatPercent}
        gaugeConfig={bfConfig}
        level={
          mCurrent.navyBodyFatPercent != null
            ? classifyBodyFatPercent(
                mCurrent.navyBodyFatPercent,
                profile.gender,
              )
            : null
        }
      />

      {fatPctCurrent != null ? (
        <MetricCard
          label="Grasa registrada"
          current={fmt(fatPctCurrent, 1, '%')}
          previous={
            sameFatUnit && fatPctPrev != null
              ? fmt(fatPctPrev, 1, '%')
              : previous?.fatMassUnit === 'kg'
                ? `${fmt(previous.fatMass ?? null, 1)} kg`
                : undefined
          }
          delta={
            sameFatUnit
              ? fmtDelta(delta(fatPctCurrent, fatPctPrev), '%')
              : 'Unidad distinta'
          }
          signal={
            sameFatUnit
              ? goalMetricTrend(
                  fatPctCurrent,
                  fatPctPrev,
                  profile.goalFatDirection,
                )
              : 'neutral'
          }
          gaugeValue={fatPctCurrent}
          gaugeConfig={bfConfig}
          level={classifyBodyFatPercent(fatPctCurrent, profile.gender)}
        />
      ) : null}

      {current.skeletalMuscleMass != null ? (
        <MetricRow
          label="MME"
          current={`${fmt(current.skeletalMuscleMass, 1)} kg`}
          previous={
            previous?.skeletalMuscleMass != null
              ? `${fmt(previous.skeletalMuscleMass, 1)} kg`
              : undefined
          }
          delta={fmtDelta(
            delta(
              current.skeletalMuscleMass,
              previous?.skeletalMuscleMass ?? null,
            ),
            ' kg',
          )}
          signal={goalMetricTrend(
            current.skeletalMuscleMass,
            previous?.skeletalMuscleMass ?? null,
            profile.goalMmeDirection,
          )}
        />
      ) : null}

      {(current.energyLevel != null || current.sleepQuality != null) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {current.energyLevel != null ? (
            <MetricRow
              label="Energía"
              current={String(current.energyLevel)}
              previous={
                previous?.energyLevel != null
                  ? String(previous.energyLevel)
                  : undefined
              }
              delta={fmtDelta(
                delta(current.energyLevel, previous?.energyLevel ?? null),
              )}
              signal={goalMetricTrend(
                current.energyLevel,
                previous?.energyLevel ?? null,
                'gain',
              )}
            />
          ) : null}
          {current.sleepQuality != null ? (
            <MetricRow
              label="Sueño"
              current={String(current.sleepQuality)}
              previous={
                previous?.sleepQuality != null
                  ? String(previous.sleepQuality)
                  : undefined
              }
              delta={fmtDelta(
                delta(current.sleepQuality, previous?.sleepQuality ?? null),
              )}
              signal={goalMetricTrend(
                current.sleepQuality,
                previous?.sleepQuality ?? null,
                'gain',
              )}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
