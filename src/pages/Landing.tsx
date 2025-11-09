import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header público */}
      <header className="sticky top-0 bg-[var(--bg-card)]/80 backdrop-blur z-10 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/ghealth_logo.png" alt="GHealth" className="h-8 w-8 object-contain rounded" />
            <span className="text-lg font-semibold">GHealth</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#porque" className="hover:text-primary">Por que usar</a>
            <a href="#funcionalidades" className="hover:text-primary">Funcionalidades</a>
            <a href="#testemunhos" className="hover:text-primary">Depoimentos</a>
            <a href="#faq" className="hover:text-primary">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 rounded border hover:bg-slate-100">Entrar</Link>
            <Link to="/signup" className="px-3 py-2 rounded bg-[var(--primary)] text-[var(--primary-contrast)] hover:bg-[var(--color-primary-dark)]">Cadastrar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Acompanhe sua saúde com clareza e simplicidade
          </h1>
          <p className="mt-4 text-slate-600">
            Centralize exames, monitore hábitos diários e visualize alertas em tempo real. Um painel claro para decisões melhores.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/signup" className="px-5 py-3 rounded bg-[var(--primary)] text-[var(--primary-contrast)] hover:bg-[var(--color-primary-dark)]">Começar agora</Link>
            <Link to="/login" className="px-5 py-3 rounded border hover:bg-[var(--bg-muted)]">Já tenho conta</Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 to-sky-200 rounded-3xl blur-xl" />
          <div className="relative overflow-hidden bg-[var(--bg-card)] border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-sm text-slate-600">Exemplo de painel</div>
            <div className="mt-3 grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-card)] shadow-sm">
                <div className="text-slate-500 text-xs">Health Score</div>
                <div className="text-3xl font-bold text-primary">82</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-card)] shadow-sm">
                <div className="text-slate-500 text-xs">Passos hoje</div>
                <div className="text-3xl font-bold text-primary">8.511</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por que usar */}
      <section id="porque" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Por que usar o GHealth?</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[
            { t: 'Centralização de dados', d: 'Todos os exames e hábitos em um só lugar.' },
            { t: 'Alertas inteligentes', d: 'Sinais visuais quando valores fogem do ideal.' },
            { t: 'Acompanhamento diário', d: 'Passos, sono e frequência, com evolução ao longo do tempo.' },
          ].map((i, idx) => (
            <div key={idx} className="p-6 rounded-xl border bg-white">
              <div className="h-10 w-10 rounded-lg bg-primary/20 mb-3" />
              <div className="font-medium">{i.t}</div>
              <div className="text-slate-600 text-sm mt-1">{i.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Funcionalidades</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[
            'Dashboard com Health Score',
            'Registro diário de passos, sono e batimentos',
            'Upload de laudos e visualização pública',
            'Avatar com alertas por exames',
            'Políticas de segurança (RLS) por usuário',
            'Compatível com Web e Android (Capacitor)'
          ].map((t, i) => (
            <div key={i} className="p-6 rounded-xl border bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-shadow">
              <div className="font-medium">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section id="testemunhos" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Depoimentos</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[
            { n: 'Ana', d: 'Finalmente entendo meus exames. Simples e direto.' },
            { n: 'Carlos', d: 'O alerta me ajudou a procurar o médico cedo.' },
            { n: 'Marina', d: 'Acompanhar passos e sono me motivou bastante.' },
          ].map((i, idx) => (
            <div key={idx} className="p-6 rounded-xl border bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-shadow">
              <div className="font-medium">{i.n}</div>
              <div className="text-slate-600 text-sm mt-1">{i.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-4">
          {[
            { q: 'Preciso pagar?', a: 'Esta é uma versão MVP gratuita.' },
            { q: 'Meus dados são seguros?', a: 'Sim, usamos políticas RLS do Supabase para garantir acesso apenas do usuário.' },
            { q: 'Funciona no Android?', a: 'Sim, via Capacitor você pode gerar APK.' },
          ].map((f, i) => (
            <details key={i} className="border rounded-lg bg-[var(--bg-card)] shadow-sm">
              <summary className="px-4 py-3 cursor-pointer font-medium">{f.q}</summary>
              <div className="px-4 py-3 text-slate-600 text-sm">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Rodapé landing */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-slate-600 flex items-center justify-between">
          <div>© {new Date().getFullYear()} GHealth. Todos os direitos reservados.</div>
          <div className="flex gap-4">
            <a href="#faq" className="hover:text-primary">Ajuda</a>
            <Link to="/login" className="hover:text-primary">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}