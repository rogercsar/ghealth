import React from 'react'

type Item = { key: string; label: string; icon?: React.ReactNode }

type SideMenuProps = {
  items: Item[]
  onSelect: (key: string) => void
  className?: string
}

export default function SideMenu({ items, onSelect, className = '' }: SideMenuProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 p-4 rounded-2xl w-24">
        {items.map((i) => (
          <button key={i.key} title={i.label} onClick={() => onSelect(i.key)} className="h-20 w-20 grid place-items-center rounded-xl bg-[var(--bg-muted)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-card)]">
            <span aria-hidden className="text-3xl">{i.icon ?? '•'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}