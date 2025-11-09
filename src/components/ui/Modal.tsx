import React, { useEffect } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const maxW = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative mx-auto mt-24 ${maxW} w-[92%] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl`}>
        {(title) && (
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="text-[var(--text)] font-medium">{title}</div>
            <button onClick={onClose} className="h-10 w-10 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)]" aria-label="Fechar">✕</button>
          </div>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}