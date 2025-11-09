import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 rounded-xl bg-primary mb-2" />
          <h2 className="text-2xl font-semibold">Bem-vindo ao GHealth</h2>
          <p className="text-slate-600 text-sm mt-1">Entre para acessar seu painel de saúde</p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
              required
            />
          </div>
          <button type="submit" className="w-full bg-[var(--primary)] hover:bg-[var(--color-primary-dark)] text-[var(--primary-contrast)] rounded-lg p-2.5">
            Entrar
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Não tem conta? <Link to="/signup" className="text-primary underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}