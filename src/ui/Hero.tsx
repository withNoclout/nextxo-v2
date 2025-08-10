export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid-size opacity-30 pointer-events-none" />
      <div className="container mx-auto px-6 py-28 md:py-36">
        <div className="mx-auto text-center">
          <h1 className="hero__title mx-auto max-w-[980px] text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            <span className="block">Build in a weekend</span>
            <span className="block text-emerald-400">Scale to millions</span>
          </h1>
          <p className="hero__desc mx-auto max-w-[900px] text-[15px] md:text-lg text-white/80 leading-relaxed">
            NetXO is the real-time carbon platform. Track live activity, surface inefficiencies, and turn insights into action.
            Monitor emissions as they happen, squeeze more efficiency from operations, and share transparent impact — fast, in dark mode.
          </p>
          {/* CTAs */}
          <div className="hero__ctas flex gap-3 justify-center">
            <button className="btn btn-primary">Start your project</button>
            <button className="btn btn-outline">Request a demo</button>
          </div>

          {/* Brand rail */}
          <section className="hero__brands brand-rail">
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
          </section>
          <p className="hero__trust brand-caption">Trusted by fast‑growing companies worldwide</p>
        </div>
      </div>
    </section>
  )
}
