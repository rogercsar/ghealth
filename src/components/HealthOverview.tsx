import Button from './ui/Button'
import Card from './ui/Card'
import StatGauge from './ui/StatGauge'
import type { AppMode } from '../context/ModeContext'

interface Metrics {
  steps: number
  heartRate: number | null
}

interface HealthOverviewProps {
  score: number | null
  metrics: Metrics
  mode: AppMode | null
  onStartMode: (mode: 'SONO' | 'ATLETA' | 'REPOUSO') => void
  onStopMode: () => void
}

export default function HealthOverview({
  score,
  metrics,
  mode,
  onStartMode,
  onStopMode,
}: HealthOverviewProps) {
  return (
    <Card>
      <h3 className="font-bold text-lg">Health Score</h3>
      <p className="text-sm text-slate-500 mb-4">Baseado em IMC, hábitos e glicose</p>

      <div className="text-6xl font-bold text-primary text-center my-4">{score ?? '--'}</div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${(score ?? 0)}%` }} />
      </div>

      <div className="mt-6 space-y-4">
        <StatGauge label="Passos (hoje)" value={metrics.steps} min={0} max={10000} />
        <StatGauge label="FC (bpm)" value={metrics.heartRate ?? 0} min={40} max={160} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {!mode ? (
          <>
            <Button variant="subtle" size="sm" onClick={() => onStartMode('SONO')}>Modo Sono</Button>
            <Button variant="primary" size="sm" onClick={() => onStartMode('ATLETA')}>Modo Atleta</Button>
            <Button variant="outline" size="sm" onClick={() => onStartMode('REPOUSO')}>Modo Repouso</Button>
          </>
        ) : (
          <Button variant="danger" onClick={onStopMode}>Encerrar modo</Button>
        )}
      </div>
    </Card>
  )
}
