export default function GradientTitle({ text }: { text: string }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-1,#0EA5E9), var(--brand-2,#9333EA), var(--brand-3,#F59E0B))' }}>
      {text}
    </h2>
  )
}