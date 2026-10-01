import Dexie, { type EntityTable } from 'dexie'
import type { Entry, UserProfile } from '../types'
import { PROFILE_ID } from '../types'

export class BioMikaDB extends Dexie {
  profile!: EntityTable<UserProfile, 'id'>
  entries!: EntityTable<Entry, 'id'>

  constructor() {
    super('BioMikaDB')
    this.version(1).stores({
      profile: 'id, dob, height, gender',
      entries: '++id, &date, weight, energyLevel, sleepQuality',
    })
  }
}

export const db = new BioMikaDB()

export async function getProfile(): Promise<UserProfile | undefined> {
  return db.profile.get(PROFILE_ID)
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await db.profile.put({ ...profile, id: PROFILE_ID })
}

export async function upsertEntry(entry: Entry): Promise<number> {
  const existing = await db.entries.where('date').equals(entry.date).first()
  if (existing?.id != null) {
    const { id: _omit, ...rest } = entry
    await db.entries.update(existing.id, rest)
    return existing.id
  }
  const { id: _omit, ...toAdd } = entry
  const newId = await db.entries.add(toAdd)
  return newId as number
}

export async function getEntryByDate(date: string): Promise<Entry | undefined> {
  return db.entries.where('date').equals(date).first()
}

export async function getEntriesSortedDesc(): Promise<Entry[]> {
  return db.entries.orderBy('date').reverse().toArray()
}

export async function exportDatabase(): Promise<string> {
  const profile = await getProfile()
  const entries = await db.entries.orderBy('date').toArray()
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: profile ?? null,
      entries,
    },
    null,
    2,
  )
}

export async function importDatabase(
  json: string,
  mode: 'replace' | 'merge',
): Promise<void> {
  const data = JSON.parse(json) as {
    profile?: UserProfile | null
    entries?: Entry[]
  }
  if (mode === 'replace') {
    await db.transaction('rw', db.profile, db.entries, async () => {
      await db.entries.clear()
      await db.profile.clear()
      if (data.profile) {
        await db.profile.put({ ...data.profile, id: PROFILE_ID })
      }
      if (data.entries?.length) {
        await db.entries.bulkPut(data.entries)
      }
    })
    return
  }
  await db.transaction('rw', db.profile, db.entries, async () => {
    if (data.profile) {
      await db.profile.put({ ...data.profile, id: PROFILE_ID })
    }
    if (data.entries?.length) {
      for (const entry of data.entries) {
        await upsertEntry(entry)
      }
    }
  })
}
