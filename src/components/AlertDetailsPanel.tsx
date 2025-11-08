import Card from './ui/Card'

export type AlertInfo = {
  key: string
  title: string
  description: string
  value?: number | string | null
}

const DICT: Record<string, { title: string; description: string }> = {
  IMC: { title: 'Índice de Massa Corporal (IMC)', description: 'IMC acima de 25 indica sobrepeso; considere ajustar dieta e exercícios.' },
  FC: { title: 'Frequência Cardíaca', description: 'FC fora de 50-100 bpm pode indicar estresse ou esforço indevido.' },
  Sono: { title: 'Sono', description: 'Dormir menos de 6 horas afeta recuperação e humor. Estabeleça rotina.' },
  Passos: { title: 'Passos Diários', description: 'Menos de 5k passos/dia: tente incluir caminhadas e pausas ativas.' },
  glicose: { title: 'Glicose', description: 'Glicemia elevada pode indicar resistência à insulina; procure avaliação.' },
  colesterol: { title: 'Colesterol', description: 'Colesterol alto aumenta risco cardiovascular; avalie dieta e acompanhamento.' },
  triglicer: { title: 'Triglicérides', description: 'Triglicerídeos elevados relacionam-se com dieta e metabolismo; avalie hábitos.' },
  Coração: { title: 'Coração', description: 'Resumo do coração: relate sintomas de dor, palpitações, falta de ar. Acompanhe FC e exames (colesterol, triglicérides).'},
  Cérebro: { title: 'Cérebro', description: 'Resumo do cérebro: observe dor de cabeça, tontura, lapsos de memória. Sono e estresse impactam bastante.'},
  Rins: { title: 'Rins', description: 'Resumo dos rins: fique atento a inchaço, urina espumosa ou alterações. Hidrate-se e monitore exames renais.'},
  Olhos: { title: 'Olhos', description: 'Resumo dos olhos: alterações de visão, dor ocular ou vermelhidão devem ser acompanhadas. Consulte especialista se persistir.'},
  Metabolismo: { title: 'Metabolismo', description: 'Glicose, hemoglobina glicada e hábitos (IMC, passos) refletem o estado metabólico. Ajustes de dieta, atividade física e acompanhamento médico são recomendados.' },
}

export default function AlertDetailsPanel({ alertKey, value, onClose }: { alertKey: string; value?: number | string | null; onClose: () => void }) {
  const info = DICT[alertKey] ?? { title: alertKey, description: 'Sem detalhes disponíveis.' }
  return (
    <Card title={info.title} subtitle={value ? `Valor: ${value}` : undefined}>
      <div className="text-sm text-[var(--text)]">{info.description}</div>
      <div className="mt-3">
        <button onClick={onClose} className="px-3 py-2 rounded border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-muted)] text-sm">Fechar</button>
      </div>
    </Card>
  )
}