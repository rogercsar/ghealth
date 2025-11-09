import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

type HealthRecord = {
  id: string
  tipo_exame: string
  valor: number | null
  unidade: string | null
  data_exame: string | null
  arquivo_url: string | null
}

export default function Exams() {
  const { user } = useAuth()
  const [tipo, setTipo] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [unidade, setUnidade] = useState('')
  const [dataExame, setDataExame] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [records, setRecords] = useState<HealthRecord[]>([])

  useEffect(() => {
    const loadRecords = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('data_exame', { ascending: false })
      if (!error && data) {
        setRecords(data as HealthRecord[])
      }
    }
    loadRecords()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    setFormError(null)
    setUploading(true)

    try {
      let arquivo_url: string | null = null
      if (file) {
        const bucket = import.meta.env.VITE_STORAGE_BUCKET || 'health-reports'
        const filePath = `${user.id}/${Date.now()}_${file.name}`
        const { error: upErr } = await supabase.storage.from(bucket).upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        })
        if (upErr) {
          setFormError(upErr.message)
          return
        }
        const { data } = await supabase.storage.from(bucket).getPublicUrl(filePath)
        arquivo_url = data.publicUrl
      }

      const { error } = await supabase.from('health_records').insert({
        user_id: user.id,
        tipo_exame: tipo,
        valor: valor || null,
        unidade,
        data_exame: dataExame,
        arquivo_url,
      })
      if (error) {
        setFormError(error.message)
        return
      }
      setStatus('Exame salvo com sucesso!')
      setTipo('')
      setValor('')
      setUnidade('')
      setDataExame('')
      setFile(null)

      // Reload records after insert
      const { data: refreshed } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('data_exame', { ascending: false })
      if (refreshed) setRecords(refreshed as HealthRecord[])
    } finally {
      setUploading(false)
    }
  }

  const fmtDate = (d?: string | null) => {
    if (!d) return '—'
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('pt-BR')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Meus Exames</h2>
          <p className="text-slate-600 text-sm">Adicione laudos e valores do exame</p>
        </div>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}
      {status && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {status}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Tipo de exame</label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: Glicose em jejum"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Valor</label>
            <input
              type="number"
              step={0.1}
              value={valor}
              onChange={(e) => setValor(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ex: 92.5"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Unidade</label>
            <input
              type="text"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex: mg/dL"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Data do exame</label>
            <input
              type="date"
              value={dataExame}
              onChange={(e) => setDataExame(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--primary)]/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2">Upload de Laudo (PDF/JPG)</label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer rounded-lg border border-dashed p-4 text-sm text-slate-600 hover:bg-[var(--bg-muted)]">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <span>{file ? file.name : 'Selecione um arquivo para enviar'}</span>
                <span className="px-3 py-1 rounded bg-[var(--bg-muted)] text-[var(--text)]">Escolher</span>
              </div>
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tipos suportados: PDF e imagens. Tamanho máximo conforme seu storage.</p>
        </div>

        <button
          className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] rounded-lg p-2.5 hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? 'Salvando...' : 'Salvar exame'}
        </button>
      </form>

      {/* Listagem de exames */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Exames recentes</h3>
            <p className="text-slate-600 text-sm">Últimos registros adicionados</p>
          </div>
        </div>
        {records.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-[var(--text-muted)] text-sm">Nenhum exame cadastrado ainda.</div>
        ) : (
          <div className="grid gap-4">
            <div className="mt-6 space-y-4">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="font-medium">{r.tipo_exame}</div>
                    <div className="text-slate-600 text-sm">
                      {r.valor ?? '—'} {r.unidade ?? ''} • {fmtDate(r.data_exame)}
                    </div>
                  </div>
                  {r.arquivo_url ? (
                    <a
                      href={r.arquivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded border hover:bg-[var(--bg-muted)] text-sm"
                    >
                      Ver arquivo
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs">Sem laudo</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}