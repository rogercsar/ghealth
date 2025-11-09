import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

type RecordItem = {
  tipo_exame: string
  valor: number | null
  unidade: string | null
  data_exame: string
}

type Tracking = {
  passos?: number | null
  horas_sono?: number | null
  freq_cardiaca?: number | null
}

type Profile = {
  altura_cm?: number | null
  peso_kg?: number | null
  sexo?: string | null
}

export type OrganKey = 'heart' | 'brain' | 'kidneys' | 'eyes' | 'metabolism'
type Severity = 'low' | 'medium' | 'high'
type AlertPoint = { x: number; y: number; label: string; color: string; value?: number | null; organ: OrganKey; severity: Severity }

function severityColor(s: Severity) {
  return s === 'high' ? '#ef4444' : s === 'medium' ? '#f97316' : '#f59e0b'
}

function computeExamSeverity(label: string, value: number | null, unit: string | null, sexo: string | null): Severity | null {
  void unit
  const v = value ?? 0
  const l = label.toLowerCase()
  if (l.includes('glicose') || l.includes('glucose')) {
    if (v >= 126) return 'high'
    if (v > 100) return 'medium'
    return null
  }
  if (l.includes('hemoglobina') && l.includes('glicada')) {
    if (v >= 6.5) return 'high'
    if (v >= 5.7) return 'medium'
    return null
  }
  if (l.includes('colesterol')) {
    if (v > 240) return 'high'
    if (v > 200) return 'medium'
    return null
  }
  if (l.includes('triglicer')) {
    if (v > 200) return 'high'
    if (v > 150) return 'medium'
    return null
  }
  if (l.includes('creatinina')) {
    const limite = (sexo ?? 'M') === 'F' ? 1.1 : 1.3
    if (v > limite + 0.2) return 'high'
    if (v > limite) return 'medium'
    return null
  }
  if (l.includes('ureia')) {
    if (v > 70) return 'high'
    if (v > 45) return 'medium'
    return null
  }
  if (l.includes('press') || l.includes('pa')) {
    if (v >= 140) return 'high'
    if (v >= 130) return 'medium'
    return null
  }
  if (l.includes('ecg')) {
    if (v > 0) return 'high'
    return null
  }
  return null
}

function organForTipo(tipo: string): OrganKey | null {
  const t = tipo.toLowerCase()
  if (t.includes('glicose') || t.includes('glucose') || (t.includes('hemoglobina') && t.includes('glicada')) || t.includes('imc') || t.includes('passos')) return 'metabolism'
  if (t.includes('colesterol') || t.includes('triglicer') || t.includes('fc') || t.includes('press') || t.includes('pa') || t.includes('ecg')) return 'heart'
  if (t.includes('sono')) return 'brain'
  if (t.includes('creatinina') || t.includes('ureia')) return 'kidneys'
  if (t.includes('retina') || t.includes('fundoscopia') || t.includes('olho')) return 'eyes'
  return null
}

function regionForExam(tipo: string) {
  const t = tipo.toLowerCase()
  if (t.includes('glicose') || t.includes('glucose')) return { x: 110, y: 150 }
  if (t.includes('hemoglobina') && t.includes('glicada')) return { x: 110, y: 150 }
  if (t.includes('colesterol') || t.includes('triglicer') || t.includes('fc') || t.includes('press') || t.includes('pa') || t.includes('ecg')) return { x: 110, y: 120 }
  if (t.includes('sono')) return { x: 110, y: 60 }
  if (t.includes('creatinina') || t.includes('ureia')) return { x: 110, y: 200 }
  if (t.includes('retina') || t.includes('fundoscopia') || t.includes('olho')) return { x: 110, y: 80 }
  return { x: 110, y: 220 }
}

function MaleSilhouette() {
  return (
    <image href="/corpo.png" x={0} y={0} width={220} height={320} preserveAspectRatio="xMidYMid meet" style={{ filter: 'contrast(1.25) saturate(1.2) brightness(1.05)' }} />
  )
}

function FemaleSilhouette() {
  return (
    <image href="/corpo.png" x={0} y={0} width={220} height={320} preserveAspectRatio="xMidYMid meet" style={{ filter: 'contrast(1.25) saturate(1.2) brightness(1.05)' }} />
  )
}

function BackSilhouette() {
  return (
    <image href="/corpo_costas.png" x={0} y={0} width={220} height={320} preserveAspectRatio="xMidYMid meet" style={{ filter: 'contrast(1.25) saturate(1.2) brightness(1.05)' }} />
  )
}

export default function AvatarDisplay({ selectedOrgan, onAlertClick, onAlertsComputed }: { selectedOrgan?: OrganKey | null; onAlertClick?: (k: string, v?: number | null) => void; onAlertsComputed?: (alerts: AlertPoint[]) => void }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from('health_records')
        .select('tipo_exame, valor, unidade, data_exame')
        .eq('user_id', user.id)
        .order('data_exame', { ascending: false })
        .limit(10)
      setRecords(data ?? [])

      const { data: prof } = await supabase
        .from('profiles')
        .select('altura_cm, peso_kg, sexo')
        .eq('id', user.id)
        .maybeSingle()
      setProfile(prof ?? null)

      const { data: trk } = await supabase
        .from('daily_tracking')
        .select('passos, horas_sono, freq_cardiaca')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(1)
        .maybeSingle()
      setTracking(trk ?? null)
    }
    load()
  }, [user])

  const sexo = profile?.sexo ?? 'M'

  const organPositions: Record<OrganKey, { x: number; y: number; label: string }> = {
    heart: { x: 110, y: 120, label: 'Coração' },
    brain: { x: 110, y: 60, label: 'Cérebro' },
    kidneys: { x: 110, y: 200, label: 'Rins' },
    eyes: { x: 110, y: 80, label: 'Olhos' },
    metabolism: { x: 110, y: 150, label: 'Metabolismo' },
  }

  const alerts: AlertPoint[] = useMemo(() => {
    const sexoLocal = profile?.sexo ?? 'M'
    const bmiAlert = (() => {
      const h = profile?.altura_cm && profile.altura_cm > 0 ? profile.altura_cm / 100 : null
      const p = profile?.peso_kg ?? null
      if (!h || !p) return null
      const imc = p / (h * h)
      const sev: Severity | null = imc >= 30 ? 'high' : imc > 25 ? 'medium' : null
      return sev ? { x: 110, y: 160, label: 'IMC', color: severityColor(sev), value: Math.round(imc * 10) / 10, organ: 'metabolism', severity: sev } as AlertPoint : null
    })()
    const hrAlert = (() => {
      const f = tracking?.freq_cardiaca ?? null
      if (!f) return null
      const sev: Severity | null = (f < 45 || f > 120) ? 'high' : (f < 50 || f > 100) ? 'medium' : null
      return sev ? { x: 110, y: 110, label: 'FC', color: severityColor(sev), value: f, organ: 'heart', severity: sev } as AlertPoint : null
    })()
    const sleepAlert = (() => {
      const s = tracking?.horas_sono ?? null
      if (s === null || s === undefined) return null
      const sev: Severity | null = s < 5 ? 'high' : s < 6 ? 'medium' : null
      return sev ? { x: 110, y: 19, label: 'Sono', color: severityColor(sev), value: s, organ: 'brain', severity: sev } as AlertPoint : null
    })()
    const stepsAlert = (() => {
      const p = tracking?.passos ?? null
      if (p === null || p === undefined) return null
      const sev: Severity | null = p < 3000 ? 'high' : p < 5000 ? 'medium' : null
      if (!sev) return null
      // Place on both feet instead of between legs
      const leftFoot = { x: 100, y: 281, label: 'Passos', color: severityColor(sev), value: p, organ: 'metabolism', severity: sev } as AlertPoint
      const rightFoot = { x: 120, y: 281, label: 'Passos', color: severityColor(sev), value: p, organ: 'metabolism', severity: sev } as AlertPoint
      return [leftFoot, rightFoot]
    })()
    const examAlerts = records.map((rec) => {
      const sev = computeExamSeverity(rec.tipo_exame, rec.valor, rec.unidade, sexoLocal)
      const organ = organForTipo(rec.tipo_exame)
      if (!sev || !organ) return null
      const pos = regionForExam(rec.tipo_exame)
      return { ...pos, label: rec.tipo_exame, color: severityColor(sev), value: rec.valor ?? null, organ, severity: sev } as AlertPoint
    }).filter(Boolean) as AlertPoint[]
    const stepAlerts = Array.isArray(stepsAlert) ? stepsAlert : (stepsAlert ? [stepsAlert] : [])
    return [bmiAlert as AlertPoint | null, hrAlert as AlertPoint | null, sleepAlert as AlertPoint | null, ...stepAlerts, ...examAlerts].filter(Boolean) as AlertPoint[]
  }, [records, profile, tracking])

  useEffect(() => {
    if (!onAlertsComputed) return
    try { onAlertsComputed(alerts) } catch {}
  }, [alerts])

  const handleRotate = () => {
    // Alterna frente ↔ costas com rotação de 180°
    setShowBack((prev) => !prev)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden" style={{ perspective: '800px' }}>
        <svg
          width="340" height="480" viewBox="0 0 240 340" xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-1000 ease-out w-[min(34vw,300px)]`}
          style={{ transform: (showBack ? 'rotateY(180deg)' : 'rotateY(0deg)') as any, transformStyle: 'preserve-3d' }}
        >
          {showBack ? <BackSilhouette /> : (sexo === 'F' ? <FemaleSilhouette /> : <MaleSilhouette />)}

          {selectedOrgan && organPositions[selectedOrgan] && (
            <g className="cursor-pointer">
              <circle cx={organPositions[selectedOrgan].x} cy={organPositions[selectedOrgan].y} r="7" style={{ fill: 'var(--primary)' }} />
              <circle cx={organPositions[selectedOrgan].x} cy={organPositions[selectedOrgan].y} r="12" style={{ fill: 'var(--primary)', opacity: 0.15 }} />
              <text x={organPositions[selectedOrgan].x + 12} y={organPositions[selectedOrgan].y - 10} fontSize="10" fill="#334155">{organPositions[selectedOrgan].label}</text>
            </g>
          )}

          {/* Pontos frente (alerts dinâmicos) */}
          <g className={`transition-opacity ${showBack ? 'opacity-0' : 'opacity-100'}`}>
            {Object.entries(alerts.reduce((acc, a) => {
              const key = a.label
              ;(acc[key] ||= []).push(a)
              return acc
            }, {} as Record<string, AlertPoint[]>)).map(([label, group], gi) => {
              if (label === 'Passos' && group.length > 1) {
                const anchor = group[1] || group[0]
                const labelX = 200
                const labelY = Math.round((group[0].y + group[group.length - 1].y) / 2) - 8
                return (
                  <g key={`grp-${label}-${gi}`}>
                    {group.map((a, idx) => (
                      <g key={`pt-${label}-${idx}`} onClick={() => onAlertClick?.(a.label, a.value)} className="cursor-pointer">
                        <circle cx={a.x} cy={a.y} r="4" fill={a.color}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={a.x} cy={a.y} r="8" fill={a.color} opacity="0.12">
                          <animate attributeName="r" values="8;12;8" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    ))}
                    <line x1={anchor.x} y1={anchor.y} x2={labelX} y2={labelY} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                    <text x={labelX + 4} y={labelY} fontSize="10" fill="#334155">{label}</text>
                  </g>
                )
              }
              if (label === 'Sono' && group.length >= 1) {
                const a = group[0]
                const labelX = 30
                const labelY = a.y - 6
                return (
                  <g key={`grp-${label}-${gi}`}>
                    <g onClick={() => onAlertClick?.(a.label, a.value)} className="cursor-pointer">
                      <circle cx={a.x} cy={a.y} r="4" fill={a.color}>
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={a.x} cy={a.y} r="8" fill={a.color} opacity="0.12">
                        <animate attributeName="r" values="8;12;8" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    </g>
                    <line x1={a.x} y1={a.y} x2={labelX} y2={labelY} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                    <text x={labelX + 4} y={labelY} fontSize="10" fill="#334155">{label}</text>
                  </g>
                )
              }
              return group.map((a, idx) => (
                <g key={`single-${label}-${idx}`} onClick={() => onAlertClick?.(a.label, a.value)} className="cursor-pointer">
                  <circle cx={a.x} cy={a.y} r="4" fill={a.color}>
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={a.x} cy={a.y} r="8" fill={a.color} opacity="0.12">
                    <animate attributeName="r" values="8;12;8" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <text x={a.x + 10} y={a.y - 8} fontSize="10" fill="#334155">{a.label}</text>
                </g>
              ))
            })}
          </g>

          {/* Pontos das costas (mostrados durante rotação) */}
          {showBack && (
            <g>
              <circle cx={120} cy={110} r="6" fill="var(--accent)" />
              <circle cx={120} cy={170} r="6" fill="var(--accent)" />
              <circle cx={110} cy={210} r="6" fill="var(--accent)" />
              <circle cx={130} cy={210} r="6" fill="var(--accent)" />
            </g>
          )}
        </svg>
      </div>

      <button
        onClick={handleRotate}
        className="mt-3 h-10 px-4 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] hover:bg-[var(--bg-card)] text-sm"
      >
        {showBack ? 'Voltar à frente' : 'Girar 360º e mostrar pontos das costas'}
      </button>

      <p className="mt-2 text-xs text-[var(--text-muted)]">
        Alertas e eventos serão mostrados diretamente no corpo.
      </p>
    </div>
  )
}