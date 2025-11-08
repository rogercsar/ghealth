export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex items-center justify-between">
        <div>
          © {new Date().getFullYear()} GHealth — Cuidando da sua jornada de saúde.
        </div>
        <div className="flex gap-4">
          <a href="/" className="hover:text-primary">Landing</a>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:text-primary">Supabase</a>
        </div>
      </div>
    </footer>
  )
}