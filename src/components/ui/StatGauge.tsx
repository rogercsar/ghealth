export default function StatGauge({ label, value, min = 0, max = 100 }: { label: string; value: number; min?: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-base text-slate-600">{label}</span>
        <span className="text-lg font-medium text-[var(--text)]">{Math.round(pct)}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-200">
        <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}