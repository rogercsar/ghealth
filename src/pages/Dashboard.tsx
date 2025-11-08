import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { calculateHealthScore } from '../lib/healthScore'
import AvatarDisplay, { type OrganKey } from '../components/AvatarDisplay'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import AlertDetailsPanel from '../components/AlertDetailsPanel'
import { useMode } from '../context/ModeContext'
import HealthOverview from '../components/HealthOverview' // This will be created in the next step

type Severity = 'low' | 'medium' | 'high'

export default function Dashboard() {
  const { user } = useAuth()
  const { mode, metrics, startMode, stopMode } = useMode()
  const [score, setScore] = useState<number | null>(null)
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

  useEffect(() => {
    const saved = localStorage.getItem('selectedOrgan') as OrganKey | null
    if (saved) setSelectedOrgan(saved)
  }, [])

  useEffect(() => {
    if (selectedOrgan) localStorage.setItem('selectedOrgan', selectedOrgan)
  }, [selectedOrgan])

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
    return acc
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Olá, {user?.user_metadata.full_name ?? 'Usuário'}!</h1>
        <p className="text-text-muted">Bem-vindo ao seu Health Avatar. Aqui está um resumo da sua saúde.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Coluna Esquerda: Avatar e Alertas */}
        <div className="lg:col-span-3">
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Mapa Corporal</h2>
            <div className="flex items-center justify-center h-[500px]">
              <AvatarDisplay
                selectedOrgan={selectedOrgan}
                onAlertClick={(k, v) => { setAlertKey(k); setAlertValue(v ?? null) }}
                onAlertsComputed={(alerts) => {
                  const counts = mapAlertsToOrgans(alerts)
                  if (selectedOrgan && counts[selectedOrgan].count === 0) setSelectedOrgan(null)
                }}
              />
            </div>
            {alertKey && (
              <div className="mt-4">
                <AlertDetailsPanel alertKey={alertKey} value={alertValue} onClose={() => setAlertKey(null)} />
              </div>
            )}
          </Card>
        </div>

        {/* Coluna Direita: Health Score, Métricas e Ações */}
        <div className="lg:col-span-2 space-y-8">
          <HealthOverview
            score={score}
            metrics={{ ...metrics, heartRate: metrics.heartRate ?? null }}
            mode={mode}
            startMode={startMode}
            stopMode={stopMode}
          />

          <Card>
            <h3 className="font-semibold text-text-primary mb-3">Sumário de Alertas</h3>
            {organsWithAlerts.length === 0 ? (
              <p className="text-sm text-text-muted">Ótimas notícias! Sem alertas no momento.</p>
            ) : (
              <ul className="space-y-3">
                {organsWithAlerts.map((org) => (
                  <li key={org} className="flex items-center justify-between">
                    <button
                      className={`text-left font-medium hover:text-primary transition-colors ${selectedOrgan === org ? 'text-primary' : 'text-text-primary'}`}
                      onClick={() => setSelectedOrgan(org)}
                    >
                      {organLabels[org]}
                    </button>
                    <div className="flex items-center gap-2">
                      {availableOrgans[org].high > 0 && (
                        <span title={`${availableOrgans[org].high} alerta(s) de alta severidade`} className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-danger text-white">
                          {availableOrgans[org].high}
                        </span>
                      )}
                      {availableOrgans[org].medium > 0 && (
                        <span title={`${availableOrgans[org].medium} alerta(s) de média severidade`} className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-warning text-white">
                          {availableOrgans[org].medium}
                        </span>
                      )}
                      {availableOrgans[org].low > 0 && (
                         <span title={`${availableOrgans[org].low} alerta(s) de baixa severidade`} className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-success text-white">
                          {availableOrgans[org].low}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/tracking" className="block p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
              <div className="font-semibold text-primary">Tracking Diário</div>
              <p className="text-sm text-primary/80">Passos, sono e FC.</p>
            </Link>
            <Link to="/exams" className="block p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
              <div className="font-semibold text-accent">Adicionar Exame</div>
              <p className="text-sm text-accent/80">Adicione laudos e valores.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}