import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProfile, saveProfile } from '../db/database'
import { calculateAge } from '../lib/profileDefaults'
import {
  calculateGoalWeightFromLeanMass,
  leanMassKg,
} from '../lib/metrics'
import {
  createDefaultProfile,
  defaultGoalBodyFatPercent,
  goalBodyFatRange,
} from '../lib/profileDefaults'
import type { Gender, GoalDirection, UserProfile } from '../types'
import { NumberField } from '../components/NumberField'
import { SaveSuccessBanner } from '../components/SaveSuccessBanner'
import { getEntriesSortedDesc } from '../db/database'
import { useDecimalFieldTexts } from '../hooks/useDecimalFieldTexts'
import { parseDecimalInput } from '../lib/decimalInput'

export function ProfilePage() {
  const stored = useLiveQuery(() => getProfile(), [])
  const latestEntry = useLiveQuery(
    async () => (await getEntriesSortedDesc())[0],
    [],
  )
  const [profile, setProfile] = useState<UserProfile>(() => createDefaultProfile())
  const [saveSuccess, setSaveSuccess] = useState(false)
  const numText = useDecimalFieldTexts(stored?.dob ?? 'empty')
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null)

  useEffect(() => {
    if (stored) setProfile(stored)
  }, [stored])

  const age = calculateAge(profile.dob)
  const fatRange = goalBodyFatRange(profile.gender)

  function updateGender(gender: Gender) {
    setProfile((p) => ({
      ...p,
      gender,
      goalBodyFatPercent: defaultGoalBodyFatPercent(gender),
    }))
  }

  function handleSuggestGoalWeight() {
    const entry = latestEntry
    if (!entry?.weight || entry.fatMass == null || !entry.fatMassUnit) {
      setSuggestedWeight(null)
      alert(
        'Necesitas al menos una medición con peso y grasa (% o kg) para calcular el peso objetivo.',
      )
      return
    }
    const lean = leanMassKg(entry.weight, entry.fatMass, entry.fatMassUnit)
    if (lean == null || lean <= 0) {
      alert('No se pudo calcular la masa magra con los datos actuales.')
      return
    }
    const target = calculateGoalWeightFromLeanMass(
      lean,
      profile.goalBodyFatPercent,
    )
    if (!Number.isFinite(target)) {
      alert('Porcentaje de grasa objetivo no válido.')
      return
    }
    setSuggestedWeight(Math.round(target * 10) / 10)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.dob || profile.height < 50) {
      alert('Completa fecha de nacimiento y estatura válida.')
      return
    }
    if (
      profile.goalBodyFatPercent < fatRange.min ||
      profile.goalBodyFatPercent > fatRange.max
    ) {
      alert(
        `Grasa objetivo debe estar entre ${fatRange.min}% y ${fatRange.max}%.`,
      )
      return
    }
    await saveProfile(profile)
    setSaveSuccess(true)
    window.setTimeout(() => setSaveSuccess(false), 6000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-teal-900">Perfil</h2>
        <p className="text-sm text-slate-600">
          Datos base para IMC, fórmula Navy y peso objetivo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Fecha de nacimiento *</span>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={profile.dob}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
          />
          {age != null ? (
            <span className="mt-1 block text-xs text-slate-500">Edad: {age} años</span>
          ) : null}
        </label>

        <NumberField
          label="Estatura"
          unit="cm"
          required
          min={50}
          max={250}
          step={1}
          value={numText.display('height', profile.height, { hideZero: true })}
          onChange={(v) => {
            numText.setText('height', v)
            if (v === '') {
              setProfile({ ...profile, height: 0 })
              return
            }
            const n = parseDecimalInput(v)
            if (n != null) setProfile({ ...profile, height: n })
          }}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Sexo biológico *</legend>
          <div className="flex gap-4">
            {(['female', 'male'] as Gender[]).map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  checked={profile.gender === g}
                  onChange={() => updateGender(g)}
                />
                {g === 'male' ? 'Masculino' : 'Femenino'}
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-teal-100" />

        <h3 className="font-medium text-teal-900">Objetivos</h3>

        <NumberField
          label={`Grasa objetivo (${fatRange.min}–${fatRange.max} %)`}
          required
          min={fatRange.min}
          max={fatRange.max}
          value={numText.display('goalFat', profile.goalBodyFatPercent)}
          onChange={(v) => {
            numText.setText('goalFat', v)
            if (v === '') return
            const n = parseDecimalInput(v)
            if (n != null) setProfile({ ...profile, goalBodyFatPercent: n })
          }}
        />

        <NumberField
          label="Peso objetivo"
          unit="kg"
          min={30}
          max={300}
          value={numText.display('goalWeight', profile.goalWeight)}
          onChange={(v) => {
            numText.setText('goalWeight', v)
            if (v === '') {
              setProfile({ ...profile, goalWeight: null })
              return
            }
            const n = parseDecimalInput(v)
            if (n != null) setProfile({ ...profile, goalWeight: n })
          }}
        />

        <button
          type="button"
          onClick={handleSuggestGoalWeight}
          className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
        >
          Calcular peso objetivo (masa magra)
        </button>
        {suggestedWeight != null ? (
          <div className="rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-teal-100">
            <p>
              Sugerencia: <strong>{suggestedWeight} kg</strong> con{' '}
              {profile.goalBodyFatPercent}% grasa objetivo.
            </p>
            <button
              type="button"
              className="mt-2 text-teal-700 underline"
              onClick={() => {
                setProfile({ ...profile, goalWeight: suggestedWeight })
                numText.clearKey('goalWeight')
                setSuggestedWeight(null)
              }}
            >
              Aplicar al perfil
            </button>
          </div>
        ) : null}

        <SelectGoal
          label="Tendencia deseada — peso (si no hay peso meta)"
          value={profile.goalDirection}
          onChange={(goalDirection) => setProfile({ ...profile, goalDirection })}
        />
        <SelectGoal
          label="Tendencia deseada — grasa corporal"
          value={profile.goalFatDirection}
          onChange={(goalFatDirection) =>
            setProfile({ ...profile, goalFatDirection })
          }
        />
        <SelectGoal
          label="Tendencia deseada — MME"
          value={profile.goalMmeDirection}
          onChange={(goalMmeDirection) =>
            setProfile({ ...profile, goalMmeDirection })
          }
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-teal-700 py-3 font-medium text-white hover:bg-teal-800"
        >
          Guardar perfil
        </button>
        {saveSuccess ? (
          <SaveSuccessBanner title="Perfil guardado satisfactoriamente">
            Tus datos y objetivos quedaron almacenados en este dispositivo.
          </SaveSuccessBanner>
        ) : null}
      </form>
    </div>
  )
}

function SelectGoal({
  label,
  value,
  onChange,
}: {
  label: string
  value: GoalDirection
  onChange: (v: GoalDirection) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value as GoalDirection)}
      >
        <option value="lose">Reducir</option>
        <option value="maintain">Mantener</option>
        <option value="gain">Aumentar</option>
      </select>
    </label>
  )
}
