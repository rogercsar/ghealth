import React from 'react'

type CardProps = {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <div className={["p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm", className].join(' ')}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <div className="text-[var(--text)] font-medium">{title}</div>}
          {subtitle && <div className="text-[var(--text-muted)] text-sm">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  )
}