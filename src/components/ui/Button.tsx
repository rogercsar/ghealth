import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'subtle' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', full, className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants: Record<string, string> = {
    primary: 'bg-[var(--primary)] text-[var(--primary-contrast)] hover:bg-[var(--color-primary-dark)]',
    outline: 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-muted)]',
    subtle: 'bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const width = full ? 'w-full' : ''
  return (
    <button {...props} className={[base, variants[variant], sizeMap[size], width, className].join(' ').trim()} />
  )
}