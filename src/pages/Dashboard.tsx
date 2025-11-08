import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { calculateHealthScore } from '../lib/healthScore'
import AvatarDisplay, { type OrganKey } from '../components/AvatarDisplay'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Section from '../components/ui/Section'
import AlertDetailsPanel from '../components/AlertDetailsPanel'
import { useMode } from '../context/ModeContext'
import HealthOverview from '../components/HealthOverview'

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

  function mapAlertsToOrgans(alerts: { organ: OrganKey; severity: 'low' | 'medium' | 'high'; label: string }[]) {
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
    if (selectedOrgan && acc[selectedOrgan].count === 0) {
      setSelectedOrgan(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Section
        title="Seu Avatar de Saúde"
        description="Uma visão interativa e em tempo real do seu bem-estar."
      >
        <div className="grid md:grid-cols-5 gap-8 mt-4">

          {/* Coluna Principal - Avatar */}
          <div className="md:col-span-3">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center p-4">
                <AvatarDisplay
                  selectedOrgan={selectedOrgan}
                  onAlertClick={(k, v) => { setAlertKey(k); setAlertValue(v ?? null) }}
                  onAlertsComputed={mapAlertsToOrgans}
                />
              </div>
              {alertKey && (
                <div className="p-4 border-t border-slate-200">
                  <AlertDetailsPanel alertKey={alertKey} value={alertValue} onClose={() => setAlertKey(null)} />
                </div>
              )}
            </Card>
          </div>

          {/* Coluna Secundária - Health Score e Ações */}
          <div className="md:col-span-2 space-y-6">
            <HealthOverview
              score={score}
              metrics={metrics}
              mode={mode}
              onStartMode={startMode}
              onStopMode={stopMode}
            />

            <Card>
              <h3 className="font-bold text-lg mb-3">Sumário de Alertas</h3>
              {organsWithAlerts.length === 0 ? (
                <p className="text-sm text-slate-500">Sem alertas no momento. Ótimo trabalho!</p>
              ) : (
                <ul className="space-y-3">
                  {organsWithAlerts.map((org) => (
                    <li key={org}>
                      <button
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedOrgan === org ? 'bg-primary-light text-primary-dark' : 'hover:bg-slate-50'}`}
                        onClick={() => setSelectedOrgan(org)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{organLabels[org]}</span>
                          <div className="flex items-center gap-2">
                            {['high', 'medium', 'low'].map((sev) => {
                              const count = availableOrgans[org][sev as 'high' | 'medium' | 'low'];
                              if (count > 0) {
                                const severityClasses = {
                                  high: 'bg-red-500',
                                  medium: 'bg-orange-400',
                                  low: 'bg-amber-400',
                                };
                                return (
                                  <span key={sev} title={`${count} alerta(s) ${sev}`} className={`h-3 w-3 rounded-full ${severityClasses[sev as 'high' | 'medium' | 'low']}`} />
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-3">
              <Link to="/exams" className="block">
                <Button className="w-full">Adicionar Exame</Button>
              </Link>
              <Link to="/tracking" className="block">
                <Button variant="outline" className="w-full">Tracking Diário</Button>
              </Link>
              <Link to="/profile" className="block">
                <Button variant="subtle" className="w-full">Atualizar Perfil</Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
