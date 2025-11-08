import { createContext } from 'react'

export type AppMode = 'SONO' | 'ATLETA' | 'REPOUSO' | null

export type ModeMetrics = {
  steps: number
  heartRate?: number | null
  pressureSys?: number | null
  pressureDia?: number | null
  calories?: number | null
  startedAt?: number | null
}

type ModeCtx = {
  mode: AppMode
  metrics: ModeMetrics
  startMode: (m: Exclude<AppMode, null>) => Promise<void>
  stopMode: () => Promise<void>
}

export const Ctx = createContext<ModeCtx | undefined>(undefined)
