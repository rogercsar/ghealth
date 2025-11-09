import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { calculateHealthScore } from '../lib/healthScore'
import AvatarDisplay, { type OrganKey } from '../components/AvatarDisplay'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import StatGauge from '../components/ui/StatGauge'
import AlertDetailsPanel from '../components/AlertDetailsPanel'
import { useMode } from '../context/ModeContext'
import Modal from '../components/ui/Modal'
import SideMenu from '../components/ui/SideMenu'

export default function Dashboard() {
  const { user } = useAuth()
  const { mode, metrics, startMode, stopMode } = useMode()
  const [score, setScore] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('heart')
  const [timeTab, setTimeTab] = useState<'dia'|'semana'|'mes'>('dia')
  const [alertsReady, setAlertsReady] = useState(false)
  const [alertKey, setAlertKey] = useState<string | null>(null)
  const [alertValue, setAlertValue] = useState<number | string | null>(null)
  const [selectedOrgan, setSelectedOrgan] = useState<OrganKey | null>(null)
  const [availableOrgans, setAvailableOrgans] = useState<Record<OrganKey, { count: number; high: number; medium: number; low: number }>>({
    heart: { count: 0, high: 0, medium: 0, low: 0 },
    brain: { count: 0, high: 0, medium: 0, low: 0 },
    kidneys: { count: 0, high: 0, medium: 0, low: 0 },
    eyes: { count: 0, high: 0, medium: 0, low: 0 },
    metabolism: { count: 0, high: 0, medium: 0, low: 0 },
  })

  // Estados de modais
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showAlertModal, setShowAlertModal] = useState(false)


  // Helpers de modal
  function modalTitle(key: string | null) {
    if (!key) return ''
    const map: Record<string, string> = {
      score: 'Health Score',
      alertas: 'Alertas',
      frequencia: 'Frequência',
      acoes: 'Ações rápidas',
      exames: 'Exames',
    }
    return map[key] ?? 'Detalhes'
  }

  function renderModalContent(key: string | null) {
    if (!key) return null
    if (key === 'score') {
      return (
        <div>
          {score == null ? (
            <div className="text-sm text-[var(--text-muted)]">Calculando seu score…</div>
          ) : (
            <>
              <div className="text-5xl font-bold text-[var(--text)]">{score}</div>
              <div className="mt-4 space-y-3">
                <StatGauge label="Passos (hoje)" value={metrics.steps} min={0} max={10000} />
                <StatGauge label="FC (bpm)" value={metrics.heartRate ?? 0} min={40} max={160} />
              </div>
              <div className="mt-4 flex gap-2">
                {!mode ? (
                  <>
                    <Button variant="subtle" onClick={() => startMode('SONO')}>Modo Sono</Button>
                    <Button variant="primary" onClick={() => startMode('ATLETA')}>Modo Atleta</Button>
                    <Button variant="outline" onClick={() => startMode('REPOUSO')}>Modo Repouso</Button>
                  </>
                ) : (
                  <Button variant="danger" onClick={stopMode}>Encerrar modo</Button>
                )}
              </div>
            </>
          )}
        </div>
      )
    }
    if (key === 'alertas') {
      const organsWithAlerts = (Object.keys(availableOrgans) as OrganKey[]).filter(k => availableOrgans[k].count > 0)
      return (
        <div>
          {organsWithAlerts.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">Sem alertas no momento</div>
          ) : (
            <ul className="space-y-2">
              {organsWithAlerts.map((org) => (
                <li key={org} className="flex items-center justify-between">
                  <div className="font-medium">{organLabels[org]}</div>
                  <div className="flex items-center gap-2">
                    {(['high','medium','low'] as const).map((sev) => availableOrgans[org][sev] > 0 && (
                      <span key={sev} className="inline-flex items-center px-2 py-0.5 text-xs border rounded">
                        {sev}: {availableOrgans[org][sev]}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    }
    if (key === 'frequencia') {
      return (
        <div>
          {metrics.heartRate != null ? (
            <StatGauge label="Frequência Cardíaca" value={metrics.heartRate} min={40} max={160} />
          ) : (
            <div className="text-sm text-[var(--text-muted)]">Sem dados de frequência no momento.</div>
          )}
        </div>
      )
    }
    if (key === 'acoes') {
      return (
        <div className="grid gap-3">
          <Link to="/tracking"><Button full variant="subtle">Registrar hábitos</Button></Link>
          <Link to="/exams"><Button full variant="outline">Adicionar exame</Button></Link>
          <Link to="/profile"><Button full>Atualizar perfil</Button></Link>
        </div>
      )
    }
    if (key === 'exames') {
      return (
        <div>
          <div className="text-sm text-[var(--text-muted)] mb-3">Gerencie seus exames e laudos.</div>
          <Link to="/exams"><Button>Ir para Exames</Button></Link>
        </div>
      )
    }
    return null
  }

  // Persistir seleção
  useEffect(() => {
    const saved = localStorage.getItem('selectedOrgan') as OrganKey | null
    if (saved) setSelectedOrgan(saved)
  }, [])
  useEffect(() => {
    if (selectedOrgan) localStorage.setItem('selectedOrgan', selectedOrgan)
  }, [selectedOrgan])


  type Severity = 'low' | 'medium' | 'high'

  const severityBadgeClasses: Record<Severity, string> = {
    low: 'bg-amber-100 text-amber-700 border-amber-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    high: 'bg-red-100 text-red-700 border-red-300',
  }

  const organLabels: Record<OrganKey, string> = {
    heart: 'Coração',
    brain: 'Cérebro',
    kidneys: 'Rins',
    eyes: 'Olhos',
    metabolism: 'Metabolismo',
  }


  useEffect(() => {
    const load = async () => {
      if (!user) return
      const s = await calculateHealthScore(user.id)
      setScore(s)
    }
    load()
  }, [user])

  // REMOVER efeitos duplicados de persistência
  // (bloco duplicado foi eliminado)

  const organsWithAlerts = useMemo(() => (
    (Object.keys(availableOrgans) as OrganKey[]).filter(k => availableOrgans[k].count > 0)
  ), [availableOrgans])

  function mapAlertsToOrgans(alerts: { organ: OrganKey; severity: Severity; label: string }[]) {
    const acc: Record<OrganKey, { count: number; high: number; medium: number; low: number }> = {
      heart: { count: 0, high: 0, medium: 0, low: 0 },
      brain: { count: 0, high: 0, medium: 0, low: 0 },
      kidneys: { count: 0, high: 0, medium: 0, low: 0 },
      eyes: { count: 0, high: 0, medium: 0, low: 0 },
      metabolism: { count: 0, high: 0, medium: 0, low: 0 },
    }
    alerts.forEach(a => {
      acc[a.organ].count += 1
      acc[a.organ][a.severity] += 1
    })
    setAvailableOrgans(acc)
    setAlertsReady(true)
    return acc
  }

  const totalAlerts = useMemo(() => (
    (Object.keys(availableOrgans) as OrganKey[]).reduce((sum, k) => sum + availableOrgans[k].count, 0)
  ), [availableOrgans])

  const dailyGoalPct = useMemo(() => {
    const goal = 10000
    const pct = Math.round(Math.max(0, Math.min(100, (metrics.steps / goal) * 100)))
    return pct
  }, [metrics.steps])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid md:grid-cols-[1fr_112px] gap-6 items-start">
          <div className="flex items-center justify-center">
            <AvatarDisplay
              selectedOrgan={selectedOrgan}
              onAlertClick={(k, v) => { setAlertKey(k); setAlertValue(v ?? null); setShowAlertModal(true) }}
              onAlertsComputed={(alerts) => {
                mapAlertsToOrgans(alerts)
              }}
            />
          </div>
          <div>
            <SideMenu
              items={[
                { key: 'score', label: 'Health Score', icon: '💯' },
                { key: 'alertas', label: 'Alertas', icon: '⚠️' },
                { key: 'frequencia', label: 'Frequência', icon: '❤️' },
                { key: 'acoes', label: 'Ações', icon: '⚙️' },
                { key: 'exames', label: 'Exames', icon: '🧪' },
              ]}
              onSelect={(k) => setActiveModal(k)}
            />
          </div>
        </div>
      </div>

      <Modal open={!!activeModal} title={modalTitle(activeModal)} onClose={() => setActiveModal(null)}>
        {renderModalContent(activeModal)}
      </Modal>

      <Modal open={showAlertModal} title="Detalhes do alerta" onClose={() => setShowAlertModal(false)}>
        {alertKey && (
          <AlertDetailsPanel alertKey={alertKey} value={alertValue} onClose={() => { setAlertKey(null); setShowAlertModal(false) }} />
        )}
      </Modal>
    </div>
  )
}