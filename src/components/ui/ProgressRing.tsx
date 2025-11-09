type ProgressRingProps = {
  size?: number
  stroke?: number
  value: number // 0-100
  label?: string
  sublabel?: string
}

export default function ProgressRing({ size = 160, stroke = 12, value, label, sublabel }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <div className="text-sm text-[var(--text-muted)]">{label}</div>}
        <div className="text-2xl font-semibold">{clamped}%</div>
        {sublabel && <div className="text-xs text-[var(--text-muted)] mt-1">{sublabel}</div>}
      </div>
    </div>
  )
}