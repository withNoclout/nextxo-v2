export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid-size opacity-30 pointer-events-none" />
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Build in a weekend. Scale to millions.
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl">
            Sample text goes here to describe the product. Keep this as placeholder. More sample text for the hero section.
          </p>
          <div className="mt-8 flex gap-3">
            <button className="px-5 py-3 rounded bg-emerald-500 text-black font-medium">Start your project</button>
            <button className="px-5 py-3 rounded border border-white/10">View docs</button>
          </div>

          {/* Brand rail */}
          <section className="brand-rail">
            <div className="brand-viewport">
              <div className="brand-track" aria-hidden="true">
                {/* Set A */}
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                {/* Set B (duplicate) */}
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
                <div className="brand-box" />
              </div>
              <div className="brand-fade brand-fade--left" aria-hidden="true" />
              <div className="brand-fade brand-fade--right" aria-hidden="true" />
            </div>
            <p className="brand-caption">Trusted by fast‑growing companies worldwide</p>
          </section>
        </div>
      </div>
    </section>
  )
}
