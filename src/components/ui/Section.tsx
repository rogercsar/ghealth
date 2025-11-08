import React from 'react'

type SectionProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function Section({ title, description, actions, children, className = '' }: SectionProps) {
  return (
    <section className={["space-y-6", className].join(' ')}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-[var(--text-muted)] text-sm">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}