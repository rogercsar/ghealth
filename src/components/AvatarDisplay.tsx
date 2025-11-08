import { useEffect, useState } from 'react'
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
    <image href="/silhueta_m.png" x={0} y={0} width={220} height={320} preserveAspectRatio="xMidYMid meet" />
  )
}

function FemaleSilhouette() {
  return (
    <image href="/silhueta_f.png" x={0} y={0} width={220} height={320} preserveAspectRatio="xMidYMid meet" />
  )
}

function computeExamSeverity(label: string, value: number | null, sexo: string | null): Severity | null {
  const v = value ?? 0
  const l = label.toLowerCase()
  // glicose (mg/dL)
  if (l.includes('glicose') || l.includes('glucose')) {
    if (v >= 126) return 'high'
    if (v > 100) return 'medium'
    return null
  }
  // hemoglobina glicada (%)
  if (l.includes('hemoglobina') && l.includes('glicada')) {
    if (v >= 6.5) return 'high'
    if (v >= 5.7) return 'medium'
    return null
  }
  // colesterol total (mg/dL)
  if (l.includes('colesterol')) {
    if (v > 240) return 'high'
    if (v > 200) return 'medium'
    return null
  }
  // triglicerídeos (mg/dL)
  if (l.includes('triglicer')) {
    if (v > 200) return 'high'
    if (v > 150) return 'medium'
    return null
  }
  // creatinina (mg/dL) por sexo
  if (l.includes('creatinina')) {
    const limite = (sexo ?? 'M') === 'F' ? 1.1 : 1.3
    if (v > limite + 0.2) return 'high'
    if (v > limite) return 'medium'
    return null
  }
  // ureia (mg/dL)
  if (l.includes('ureia')) {
    if (v > 70) return 'high'
    if (v > 45) return 'medium'
    return null
  }
  // pressão arterial sistólica (mmHg)
  if (l.includes('press') || l.includes('pa')) {
    if (v >= 140) return 'high'
    if (v >= 130) return 'medium'
    return null
  }
  // ECG (qualquer marcador anômalo)
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

export default function AvatarDisplay({ onAlertClick, selectedOrgan, onAlertsComputed }: { onAlertClick?: (key: string, value?: number | null) => void; selectedOrgan?: OrganKey | null; onAlertsComputed?: (alerts: { x: number; y: number; label: string; color: string; value?: number | null; organ: OrganKey; severity: Severity }[]) => void }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)

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

  // Calcular alertas adicionais baseados em tracking e perfil
  const bmiAlert = (() => {
    const h = profile?.altura_cm && profile.altura_cm > 0 ? profile.altura_cm / 100 : null
    const p = profile?.peso_kg ?? null
    if (!h || !p) return null
    const imc = p / (h * h)
    const sev: Severity | null = imc >= 30 ? 'high' : imc > 25 ? 'medium' : null
    return sev ? { x: 110, y: 160, label: 'IMC', color: severityColor(sev), value: Math.round(imc * 10) / 10, organ: 'metabolism' as OrganKey, severity: sev } : null
  })()

  const hrAlert = (() => {
    const f = tracking?.freq_cardiaca ?? null
    if (!f) return null
    const sev: Severity | null = (f < 45 || f > 120) ? 'high' : (f < 50 || f > 100) ? 'medium' : null
    return sev ? { x: 110, y: 110, label: 'FC', color: severityColor(sev), value: f, organ: 'heart' as OrganKey, severity: sev } : null
  })()

  const sleepAlert = (() => {
    const s = tracking?.horas_sono ?? null
    if (s === null || s === undefined) return null
    const sev: Severity | null = s < 5 ? 'high' : s < 6 ? 'medium' : null
    return sev ? { x: 110, y: 60, label: 'Sono', color: severityColor(sev), value: s, organ: 'brain' as OrganKey, severity: sev } : null
  })()

  const stepsAlert = (() => {
    const p = tracking?.passos ?? null
    if (p === null || p === undefined) return null
    const sev: Severity | null = p < 3000 ? 'high' : p < 5000 ? 'medium' : null
    return sev ? { x: 110, y: 260, label: 'Passos', color: severityColor(sev), value: p, organ: 'metabolism' as OrganKey, severity: sev } : null
  })()

  const examAlerts = records.map((rec) => {
    const sev = computeExamSeverity(rec.tipo_exame, rec.valor, profile?.sexo ?? null)
    const organ = organForTipo(rec.tipo_exame)
    if (!sev || !organ) return null
    const pos = regionForExam(rec.tipo_exame)
    return { ...pos, label: rec.tipo_exame, color: severityColor(sev), value: rec.valor ?? null, organ, severity: sev }
  }).filter(Boolean) as { x: number; y: number; label: string; color: string; value?: number | null; organ: OrganKey; severity: Severity }[]

  const alerts: AlertPoint[] = [
    bmiAlert as AlertPoint | null,
    hrAlert as AlertPoint | null,
    sleepAlert as AlertPoint | null,
    stepsAlert as AlertPoint | null,
    ...examAlerts,
  ].filter(Boolean) as AlertPoint[]

  // notificar pai sobre os alertas
  if (onAlertsComputed) {
    try { onAlertsComputed(alerts) } catch {}
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden">
        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-sky-200 rounded-full blur-lg" />
        <svg width="240" height="340" viewBox="0 0 220 320" className="relative drop-shadow-sm">
          {sexo === 'F' ? <FemaleSilhouette /> : <MaleSilhouette />}

          {selectedOrgan && organPositions[selectedOrgan] && (
            <g className="cursor-pointer">
              <circle cx={organPositions[selectedOrgan].x} cy={organPositions[selectedOrgan].y} r="7" style={{ fill: 'var(--primary)' }} />
              <circle cx={organPositions[selectedOrgan].x} cy={organPositions[selectedOrgan].y} r="12" style={{ fill: 'var(--primary)', opacity: 0.15 }} />
              <text x={organPositions[selectedOrgan].x + 12} y={organPositions[selectedOrgan].y - 10} fontSize="10" fill="#334155">{organPositions[selectedOrgan].label}</text>
            </g>
          )}

          {alerts.map((a: AlertPoint, idx: number) => (
            <g key={idx} onClick={() => onAlertClick?.(a.label, a.value)} className="cursor-pointer">
              <circle cx={a.x} cy={a.y} r="7" fill={a.color}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx={a.x} cy={a.y} r="12" fill={a.color} opacity="0.15">
                <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x={a.x + 12} y={a.y - 10} fontSize="10" fill="#334155">{a.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-2">Alertas baseados em IMC, hábitos e exames</div>
    </div>
  )
}