export type TabItem = { key: string; label: string }

export default function Tabs({ items, active, onChange }: { items: TabItem[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={
            `px-3 py-1.5 rounded-full text-sm transition-colors ` +
            (active === it.key ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--bg-muted)] text-[var(--text)] hover:bg-[var(--bg-card)]')
          }
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}