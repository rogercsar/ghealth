import { supabase } from './supabaseClient'

export async function calculateHealthScore(userId: string) {
  let score = 100

  // Perfil para IMC
  const { data: profile } = await supabase
    .from('profiles')
    .select('altura_cm, peso_kg')
    .eq('id', userId)
    .maybeSingle()
  if (profile?.altura_cm && profile?.peso_kg) {
    const h = profile.altura_cm / 100
    const imc = profile.peso_kg / (h * h)
    if (imc > 25) score -= 10
  }

  // Último tracking diário
  const { data: tracking } = await supabase
    .from('daily_tracking')
    .select('data, passos, horas_sono, freq_cardiaca')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (tracking?.passos !== undefined && tracking.passos < 5000) {
    score -= 5
  }

  // Último exame de Glicose
  const { data: glicose } = await supabase
    .from('health_records')
    .select('tipo_exame, valor, unidade, data_exame')
    .eq('user_id', userId)
    .ilike('tipo_exame', 'glicose%')
    .order('data_exame', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (glicose?.valor && glicose.valor > 100) {
    score -= 10
  }

  return score
}