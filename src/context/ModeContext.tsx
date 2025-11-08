import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Sensors } from '../lib/sensors'

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

const Ctx = createContext<ModeCtx | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [mode, setMode] = useState<AppMode>(null)
  const [metrics, setMetrics] = useState<ModeMetrics>({ steps: 0 })
  const timerRef = useRef<number | null>(null)
  const sensors = useMemo(() => new Sensors(), [])

  // coleta periódica quando em modo ativo
  useEffect(() => {
    if (!mode) return
    setMetrics((m) => ({ ...m, startedAt: Date.now() }))
    timerRef.current && window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(async () => {
      const [steps, hr, bp, calories] = await Promise.all([
        sensors.getStepDelta(),
        sensors.readHeartRate(),
        sensors.readBloodPressure(),
        sensors.estimateCalories(mode),
      ])
      setMetrics((m) => ({
        ...m,
        steps: m.steps + (steps ?? 0),
        heartRate: hr ?? m.heartRate ?? null,
        pressureSys: bp?.sys ?? m.pressureSys ?? null,
        pressureDia: bp?.dia ?? m.pressureDia ?? null,
        calories: calories ?? m.calories ?? null,
      }))
    }, 3000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [mode, sensors])

  async function persistTracking(finalize = false) {
    if (!user) return
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10)
    const horasSono = mode === 'SONO' && metrics.startedAt ? Math.max(0, (Date.now() - metrics.startedAt) / 3600000) : null

    await supabase.from('daily_tracking').upsert({
      user_id: user.id,
      data: dateStr,
      passos: metrics.steps,
      horas_sono: horasSono,
      freq_cardiaca: metrics.heartRate ?? null,
    }, { onConflict: 'user_id,data' })
  }

  async function startMode(m: Exclude<AppMode, null>) {
    setMetrics({ steps: 0, heartRate: null, pressureSys: null, pressureDia: null, calories: null, startedAt: Date.now() })
    setMode(m)
  }

  async function stopMode() {
    await persistTracking(true)
    setMode(null)
    setMetrics({ steps: 0, heartRate: null, pressureSys: null, pressureDia: null, calories: null, startedAt: null })
  }

  return (
    <Ctx.Provider value={{ mode, metrics, startMode, stopMode }}>
      {children}
    </Ctx.Provider>
  )
}

export function useMode() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useMode must be used within ModeProvider')
  return v
}