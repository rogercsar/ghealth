import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Shell({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light'|'dark'|null
    if (saved) return saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tracking', label: 'Tracking' },
    { to: '/exams', label: 'Exames' },
    { to: '/profile', label: 'Perfil' },
  ]
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      {/* Sidebar (desktop) */}
      <aside className="hidden">
        <div className="h-16 flex items-center justify-center">
          <img src="/ghealth_logo.png" alt="GHealth" className="h-10 w-10 object-contain" />
        </div>
        <nav className="mt-2 grid gap-1 px-2">
          {nav.map((i) => {
            const active = location.pathname.startsWith(i.to)
            return (
              <Link key={i.to} to={i.to} className={`${active ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'} rounded-xl h-10 px-3 flex items-center justify-start transition-colors`}>
                <span className="text-sm font-medium">{i.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto p-3">
          <Link to="/login" className="block rounded-xl h-10 px-3 bg-[var(--bg-muted)] text-[var(--text)] text-sm font-medium text-center leading-10 hover:bg-[var(--bg-card)] border border-[var(--border)]">Sair</Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-64 h-full bg-[var(--bg-muted)] border-r border-[var(--border)] shadow-lg">
            <div className="h-16 flex items-center justify-between px-4">
              <img src="/ghealth_logo.png" alt="GHealth" className="h-10 w-10 object-contain" />
              <button onClick={() => setSidebarOpen(false)} className="h-10 w-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">✕</button>
            </div>
            <nav className="mt-2 grid gap-1 px-2">
              {nav.map((i) => {
                const active = location.pathname.startsWith(i.to)
                return (
                  <Link key={i.to} to={i.to} onClick={() => setSidebarOpen(false)} className={`${active ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'text-[var(--text)] hover:bg-[var(--bg-card)]'} rounded-xl h-10 px-3 flex items-center transition-colors`}>
                    <span className="text-sm font-medium">{i.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto p-3">
              <Link to="/login" onClick={() => setSidebarOpen(false)} className="block rounded-xl h-10 px-3 bg-[var(--bg-muted)] text-[var(--text)] text-sm font-medium text-center leading-10 hover:bg-[var(--bg-card)] border border-[var(--border)]">Sair</Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-screen">
        {/* Sidebar */}
        <aside className="z-40 md:fixed md:inset-y-0 md:left-0 md:w-[240px] w-full md:w-[240px] border-r border-[var(--border)] bg-[var(--bg)]">
          <div className="h-36 flex items-center justify-center border-b border-[var(--border)]">
            <img src="/ghealth_logo.png" alt="GHealth" className="h-[100px] w-[160px] object-contain" />
          </div>
          <nav className="p-4 space-y-1">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-[var(--bg-muted)] text-[var(--fg-primary)]" : "hover:bg-[var(--bg-muted)]"}`}>
              <span className="text-sm font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/exams" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-[var(--bg-muted)] text-[var(--fg-primary)]" : "hover:bg-[var(--bg-muted)]"}`}>
              <span className="text-sm font-medium">Exames</span>
            </NavLink>
            <NavLink to="/tracking" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-[var(--bg-muted)] text-[var(--fg-primary)]" : "hover:bg-[var(--bg-muted)]"}`}>
              <span className="text-sm font-medium">Acompanhamento</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-[var(--bg-muted)] text-[var(--fg-primary)]" : "hover:bg-[var(--bg-muted)]"}`}>
              <span className="text-sm font-medium">Perfil</span>
            </NavLink>
          </nav>
          <div className="mt-auto p-4 border-t border-[var(--border)]">
            <Link to="/login" className="block rounded-xl h-10 px-3 bg-[var(--bg-muted)] text-[var(--text)] text-sm font-medium text-center leading-10 hover:bg-[var(--bg-card)] border border-[var(--border)]">Sair</Link>
          </div>
        </aside>
    
        {/* Header full-width */}
        <header className="fixed top-0 right-0 left-0 md:left-[240px] z-50 h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg)] md:w-[calc(100%-240px)]">
          <div />
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden h-10 w-10 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] hover:bg-[var(--bg-card)]" title="Menu">☰</button>
            <span className="hidden">GHealth</span>
            <div className="hidden md:flex items-center bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg px-3 py-2 w-[320px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/></svg>
              <input className="bg-transparent text-[var(--text)] text-sm outline-none w-full ml-2" placeholder="Buscar..." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-10 px-3 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] hover:bg-[var(--bg-card)]" title="Tema">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button className="h-10 w-10 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] hover:bg-[var(--bg-card)]" title="Notificações">🔔</button>
            <button className="h-10 w-10 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] hover:bg-[var(--bg-card)]" title="Dispositivos">📱</button>
            <img src="/ghealth_logo.png" alt="avatar" className="h-9 w-9 rounded-lg border border-[var(--border)]" />
          </div>
        </header>
    
        {/* Main Content offset by sidebar */}
        <div className="min-h-screen">
          <main className="pt-16 p-6 overflow-x-hidden md:ml-[240px]">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}