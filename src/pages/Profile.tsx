import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [altura, setAltura] = useState<number | ''>('')
  const [peso, setPeso] = useState<number | ''>('')
  const [nascimento, setNascimento] = useState<string>('')
  const [sexo, setSexo] = useState<string>('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (data) {
        setAltura(data.altura_cm ?? '')
        setPeso(data.peso_kg ?? '')
        setNascimento(data.data_nascimento ?? '')
        setSexo(data.sexo ?? '')
      }
    }
    load()
  }, [user])

  const imc = useMemo(() => {
    if (!altura || !peso) return null
    const h = Number(altura) / 100
    const p = Number(peso)
    return (p / (h * h)).toFixed(1)
  }, [altura, peso])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      altura_cm: altura || null,
      peso_kg: peso || null,
      data_nascimento: nascimento || null,
      sexo: sexo || null,
    })
    if (error) {
      setStatus(error.message)
      return
    }
    setStatus('Dados salvos!')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Meu Perfil</h2>
        <p className="text-slate-600 text-sm">Preencha seus dados básicos</p>
      </div>
      <form onSubmit={handleSave} className="space-y-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        <div>
          <label className="block text-sm mb-1">Sexo</label>
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value)}
            className="w-full border rounded-lg p-2.5"
          >
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Altura (cm)</label>
          <input
            type="number"
            min={0}
            value={altura}
            onChange={(e) => setAltura(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded-lg p-2.5"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Peso (kg)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={peso}
            onChange={(e) => setPeso(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded-lg p-2.5"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={nascimento}
            onChange={(e) => setNascimento(e.target.value)}
            className="w-full border rounded-lg p-2.5"
          />
        </div>
        {status && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{status}</div>}
        <button className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] rounded-lg p-2.5 hover:bg-[var(--color-primary-dark)]">Salvar</button>
      </form>

      <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <h3 className="text-lg font-semibold mb-1">IMC</h3>
        <div className="text-2xl">{imc ?? '--'}</div>
      </div>
    </div>
  )
}