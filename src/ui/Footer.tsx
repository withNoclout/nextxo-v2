export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-sm text-white/60">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-emerald-500 text-black font-bold flex items-center justify-center">N</div>
          <span>NetXO</span>
        </div>
        <p>© {new Date().getFullYear()} NetXO. Sample footer text.</p>
      </div>
    </footer>
  )
}
