type WidgetProps = {
  title: string
  value: string | number
  color?: 'primary' | 'secondary' | 'accent' | 'muted'
}

const colorMap: Record<string, string> = {
  primary: 'bg-[var(--primary)]/15 text-[var(--primary)]',
  secondary: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]',
  accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  muted: 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
}

export default function Widget({ title, value, color = 'primary' }: WidgetProps) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
      <div className="text-xs text-[var(--text-muted)]">{title}</div>
      <div className={`mt-1 inline-flex items-center gap-2 px-2 py-1 rounded-lg ${colorMap[color]}`}>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  )
}