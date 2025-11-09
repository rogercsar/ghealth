import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function Tracking() {
  const { user } = useAuth()
  const [data, setData] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [passos, setPassos] = useState<number | ''>('')
  const [sono, setSono] = useState<number | ''>('')
  const [freq, setFreq] = useState<number | ''>('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const loadToday = async () => {
      if (!user) return
      const { data: existing } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', data)
        .maybeSingle()
      if (existing) {
        setPassos(existing.passos ?? '')
        setSono(existing.horas_sono ?? '')
        setFreq(existing.freq_cardiaca ?? '')
      }
    }
    loadToday()
  }, [user, data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    const payload = {
      user_id: user.id,
      data,
      passos: passos || null,
      horas_sono: sono || null,
      freq_cardiaca: freq || null,
    }
    const { error } = await supabase.from('daily_tracking').upsert(payload, { onConflict: 'user_id,data' })
    if (error) {
      setStatus(error.message)
      return
    }
    setStatus('Registro salvo!')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Tracking diário</h2>
          <p className="text-slate-600 text-sm">Registre seus hábitos de hoje</p>
        </div>
      </div>

      {status && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40" />
          </div>
          <div>
            <label className="block text-sm mb-1">Passos</label>
            <input type="number" min={0} value={passos} onChange={(e) => setPassos(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40" />
          </div>
          <div>
            <label className="block text-sm mb-1">Horas de Sono</label>
            <input type="number" min={0} step={0.1} value={sono} onChange={(e) => setSono(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40" />
          </div>
          <div>
            <label className="block text-sm mb-1">Frequência Cardíaca (bpm)</label>
            <input type="number" min={0} value={freq} onChange={(e) => setFreq(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40" />
          </div>
        </div>
        <button className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] rounded-lg p-2.5 hover:bg-[var(--color-primary-dark)]">Salvar</button>
      </form>
    </div>
  )
}