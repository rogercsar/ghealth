import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { calculateHealthScore } from '../lib/healthScore'
import AvatarDisplay, { type OrganKey } from '../components/AvatarDisplay'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Section from '../components/ui/Section'
import Tabs from '../components/ui/Tabs'
import StatGauge from '../components/ui/StatGauge'
import AlertDetailsPanel from '../components/AlertDetailsPanel'
import { useMode } from '../context/ModeContext'

type Severity = 'low' | 'medium' | 'high'

export default function Dashboard() {
  const { user } = useAuth()
  const { mode, metrics, startMode, stopMode } = useMode()
  const [score, setScore] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('heart')
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

  // Persistir seleção
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

  useEffect(() => {
    const saved = localStorage.getItem('selectedOrgan') as OrganKey | null
    if (saved) setSelectedOrgan(saved)
  }, [])

  useEffect(() => {
    if (selectedOrgan) localStorage.setItem('selectedOrgan', selectedOrgan)
  }, [selectedOrgan])

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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <Section
        title="Dashboard"
        description="Visão geral com mapa corporal, métricas e modos"
        actions={(
          <div className="flex gap-2">
            <Link to="/tracking"><Button variant="outline" size="md">Tracking diário</Button></Link>
            <Link to="/exams"><Button size="md">Adicionar exame</Button></Link>
          </div>
        )}
      >
        {/* Navegação por categorias */}
        <Tabs
          items={[
            { key: 'heart', label: 'Coração' },
            { key: 'brain', label: 'Cérebro' },
            { key: 'kidneys', label: 'Rins' },
            { key: 'eyes', label: 'Olhos' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Cards principais */}
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          <Card title="Health Score" subtitle="Baseado em IMC, hábitos e glicose">
            <div className="text-6xl font-bold text-primary">{score ?? '--'}</div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(score ?? 0)}%` }} />
            </div>
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
          </Card>

          <Card title="Mapa corporal" subtitle="Clique nos pontos ou no sumário à direita" className="md:col-span-2">
            <div className="mt-2 grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <AvatarDisplay
                  selectedOrgan={selectedOrgan}
                  onAlertClick={(k, v) => { setAlertKey(k); setAlertValue(v ?? null) }}
                  onAlertsComputed={(alerts) => {
                    const counts = mapAlertsToOrgans(alerts)
                    if (selectedOrgan && counts[selectedOrgan].count === 0) setSelectedOrgan(null)
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-[var(--text-muted)]">Sumário</div>
                {organsWithAlerts.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)]">Sem alertas no momento</div>
                ) : (
                  <ul className="space-y-2">
                    {organsWithAlerts.map((org) => (
                      <li key={org} className="flex items-center justify-between">
                        <button className={`text-left hover:underline ${selectedOrgan === org ? 'text-primary' : 'text-slate-700'}`} onClick={() => setSelectedOrgan(org)}>
                          {organLabels[org]}
                        </button>
                        <div className="flex items-center gap-2">
                          {(['high', 'medium', 'low'] as (keyof typeof availableOrgans[OrganKey])[]).map((sev) => availableOrgans[org][sev] > 0 && (
                            <span key={sev as string} title={`${availableOrgans[org][sev]} alerta(s) ${sev as string}`} className={`inline-flex items-center px-2 py-0.5 text-xs border rounded ${sev === 'high' ? 'bg-red-100 text-red-700 border-red-300' : sev === 'medium' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                              {availableOrgans[org][sev]}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {alertKey && (
              <div className="mt-4">
                <AlertDetailsPanel alertKey={alertKey} value={alertValue} onClose={() => setAlertKey(null)} />
              </div>
            )}
          </Card>
        </div>

        {/* Ações e links úteis */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: 'Atualizar Perfil', d: 'Informe altura, peso, sexo e nascimento', to: '/profile' },
            { t: 'Registrar hábitos', d: 'Passos, sono e frequência cardíaca', to: '/tracking' },
            { t: 'Meus exames', d: 'Adicione laudos e valores com unidade', to: '/exams' },
          ].map((i, idx) => (
            <Link key={idx} to={i.to}>
              <Card>
                <div className="font-medium">{i.t}</div>
                <div className="text-slate-600 text-sm">{i.d}</div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}
