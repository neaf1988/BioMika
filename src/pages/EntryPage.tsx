import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useSearchParams } from 'react-router-dom'
import { getEntryByDate, getProfile, upsertEntry } from '../db/database'
import { NumberField } from '../components/NumberField'
import { formatDisplayDate, todayIso } from '../lib/dates'
import type { Entry, FatMassUnit } from '../types'

const emptyForm = (date: string): Entry => ({
  date,
  weight: 0,
  back: null,
  waist: null,
  glutes: null,
  leg: null,
  arm: null,
  neck: null,
  fatMass: null,
  fatMassUnit: null,
  skeletalMuscleMass: null,
  energyLevel: null,
  sleepQuality: null,
  notes: null,
})

export function EntryPage() {
  const profile = useLiveQuery(() => getProfile(), [])
  const [searchParams] = useSearchParams()
  const fechaParam = searchParams.get('fecha')
  const [date, setDate] = useState(() =>
    fechaParam && fechaParam <= todayIso() ? fechaParam : todayIso(),
  )
  const [form, setForm] = useState<Entry>(() => emptyForm(todayIso()))
  const [saveSuccess, setSaveSuccess] = useState<{
    date: string
    weight: number
  } | null>(null)

  useEffect(() => {
    if (fechaParam && fechaParam <= todayIso()) {
      setDate(fechaParam)
    }
  }, [fechaParam])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const existing = await getEntryByDate(date)
      if (cancelled) return
      if (existing) {
        setForm({ ...existing })
      } else {
        setForm(emptyForm(date))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date])

  if (!profile?.dob) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <p className="mb-2">Completa tu perfil antes de registrar mediciones.</p>
        <Link to="/perfil" className="font-medium text-teal-800 underline">
          Ir a perfil
        </Link>
      </div>
    )
  }

  const maxDate = todayIso()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (date > maxDate) {
      alert('No puedes registrar fechas futuras.')
      return
    }
    if (!form.weight || form.weight <= 0) {
      alert('El peso es obligatorio.')
      return
    }
    const payload: Entry = {
      ...form,
      date,
      weight: form.weight,
      fatMassUnit:
        form.fatMass != null && form.fatMass > 0
          ? form.fatMassUnit ?? 'percent'
          : null,
    }
    await upsertEntry(payload)
    setSaveSuccess({ date, weight: payload.weight })
    window.setTimeout(() => setSaveSuccess(null), 6000)
  }

  function setNum(field: keyof Entry, raw: string) {
    setForm((f) => ({
      ...f,
      [field]: raw === '' ? null : Number(raw),
    }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-teal-900">Registro</h2>
        <p className="text-sm text-slate-600">
          Una medición por día. Si cambias la fecha, puedes cargar o editar ese día.
        </p>
        <Link
          to="/historial"
          className="mt-2 inline-block text-sm font-medium text-teal-800 underline"
        >
          Ver historial de registros
        </Link>
      </div>

      {saveSuccess ? (
        <div
          role="alert"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm"
        >
          <p className="font-semibold">Medición guardada satisfactoriamente</p>
          <p className="mt-1 text-sm">
            {formatDisplayDate(saveSuccess.date)} · {saveSuccess.weight.toFixed(1)}{' '}
            kg
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Fecha de la medición *</span>
        <input
          type="date"
          max={maxDate}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <form onSubmit={handleSubmit} className="space-y-4">
        <NumberField
          label="Peso"
          unit="kg"
          required
          min={30}
          max={300}
          value={form.weight ? String(form.weight) : ''}
          onChange={(v) => setForm((f) => ({ ...f, weight: v === '' ? 0 : Number(v) }))}
        />

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">
            Perímetros (cm, opcional)
          </legend>
          <NumberField label="Espalda" value={str(form.back)} onChange={(v) => setNum('back', v)} />
          <NumberField label="Cintura" value={str(form.waist)} onChange={(v) => setNum('waist', v)} />
          <NumberField label="Cadera (cola)" value={str(form.glutes)} onChange={(v) => setNum('glutes', v)} />
          <NumberField label="Pierna" value={str(form.leg)} onChange={(v) => setNum('leg', v)} />
          <NumberField label="Brazo" value={str(form.arm)} onChange={(v) => setNum('arm', v)} />
          <NumberField label="Cuello" value={str(form.neck)} onChange={(v) => setNum('neck', v)} />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">
            Composición (opcional)
          </legend>
          <NumberField
            label="Masa grasa"
            value={str(form.fatMass)}
            onChange={(v) => setNum('fatMass', v)}
          />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Unidad masa grasa</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.fatMassUnit ?? 'percent'}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fatMassUnit: e.target.value as FatMassUnit,
                }))
              }
            >
              <option value="percent">Porcentaje (%)</option>
              <option value="kg">Kilogramos (kg)</option>
            </select>
          </label>
          <NumberField
            label="MME"
            unit="kg"
            value={str(form.skeletalMuscleMass)}
            onChange={(v) => setNum('skeletalMuscleMass', v)}
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">
            Bienestar (opcional)
          </legend>
          <ScaleField
            label="Energía (1–5)"
            value={form.energyLevel}
            onChange={(n) => setForm((f) => ({ ...f, energyLevel: n }))}
          />
          <ScaleField
            label="Sueño (1–5)"
            value={form.sleepQuality}
            onChange={(n) => setForm((f) => ({ ...f, sleepQuality: n }))}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Notas</span>
            <textarea
              className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.notes ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value || null }))
              }
              placeholder="Ayuno, entrenamiento, ciclo menstrual…"
            />
          </label>
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-lg bg-teal-700 py-3 font-medium text-white hover:bg-teal-800"
        >
          Guardar medición
        </button>
      </form>
    </div>
  )
}

function str(n: number | null | undefined): string {
  return n != null && n !== 0 ? String(n) : ''
}

function ScaleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null | undefined
  onChange: (n: number | null) => void
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            className={`h-10 w-10 rounded-lg border text-sm font-medium ${
              value === n
                ? 'border-teal-600 bg-teal-600 text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
