export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center font-bold">N</div>
          <span className="font-semibold">NetXO</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#docs" className="hover:text-white">Docs</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-white/10 text-sm">Sign in</button>
          <button className="px-4 py-2 rounded bg-emerald-500 text-black font-medium text-sm">Get started</button>
        </div>
      </div>
    </header>
  )
}
