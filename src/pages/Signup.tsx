import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    const user = data.user
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id })
    }
    navigate('/profile')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm p-6">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 rounded-xl bg-primary mb-2" />
          <h2 className="text-2xl font-semibold">Criar sua conta</h2>
          <p className="text-slate-600 text-sm mt-1">Cadastre-se para começar a acompanhar sua saúde</p>
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
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <button type="submit" className="w-full bg-[var(--primary)] hover:bg-[var(--color-primary-dark)] text-[var(--primary-contrast)] rounded-lg p-2.5">
            Cadastrar
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Já possui conta? <Link to="/login" className="text-primary underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}