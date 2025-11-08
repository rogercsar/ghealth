import Card from './ui/Card'
import StatGauge from './ui/StatGauge'
import Button from './ui/Button'

interface HealthOverviewProps {
  score: number | null
  metrics: {
    steps: number
    heartRate: number | null
  }
  mode: string | null
  startMode: (mode: 'SONO' | 'ATLETA' | 'REPOUSO') => void
  stopMode: () => void
}

export default function HealthOverview({ score, metrics, mode, startMode, stopMode }: HealthOverviewProps) {
  return (
    <Card>
      <h3 className="font-semibold text-text-primary">Health Score</h3>
      <p className="text-sm text-text-muted mb-4">Baseado em IMC, hábitos e glicose</p>

      <div className="text-6xl font-bold text-primary mb-2">{score ?? '--'}</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${score ?? 0}%` }}></div>
      </div>

      <div className="space-y-4 mb-4">
        <StatGauge label="Passos (hoje)" value={metrics.steps} min={0} max={10000} />
        <StatGauge label="Frequência Cardíaca (bpm)" value={metrics.heartRate ?? 0} min={40} max={160} />
      </div>

      <div className="flex flex-wrap gap-2">
        {!mode ? (
          <>
            <Button size="sm" variant="subtle" onClick={() => startMode('SONO')}>Modo Sono</Button>
            <Button size="sm" onClick={() => startMode('ATLETA')}>Modo Atleta</Button>
            <Button size="sm" variant="outline" onClick={() => startMode('REPOUSO')}>Modo Repouso</Button>
          </>
        ) : (
          <Button size="sm" variant="danger" onClick={stopMode}>Encerrar Modo</Button>
        )}
      </div>
    </Card>
  )
}