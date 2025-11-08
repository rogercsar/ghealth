import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'

export function EnsureProfile({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [checked, setChecked] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('altura_cm, peso_kg, data_nascimento')
        .eq('id', user.id)
        .maybeSingle()
      if (error) {
        setChecked(true)
        return
      }
      const incomplete = !data || !data.altura_cm || !data.peso_kg || !data.data_nascimento
      setNeedsProfile(incomplete)
      setChecked(true)
    }
    check()
  }, [user])

  if (!checked) return <div className="p-4">Carregando...</div>
  if (needsProfile) return <Navigate to="/profile" replace />
  return <>{children}</>
}