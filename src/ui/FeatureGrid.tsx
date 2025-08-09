function Band({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
      <div className="bg-white/5 border-b border-white/10 px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="p-6 text-white/80 text-sm">{children}</div>
    </div>
  )
}

export function FeatureGrid() {
  return (
    <section id="features" className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Band title="Authentication">
          Sample text. Replace with your content.
        </Band>
        <Band title="Database">
          Sample text. Replace with your content.
        </Band>
        <Band title="Storage">
          Sample text. Replace with your content.
        </Band>
        <Band title="Edge Functions">
          Sample text. Replace with your content.
        </Band>
        <Band title="Realtime">
          Sample text. Replace with your content.
        </Band>
        <Band title="AI/Vector">
          Sample text. Replace with your content.
        </Band>
      </div>
    </section>
  )
}
