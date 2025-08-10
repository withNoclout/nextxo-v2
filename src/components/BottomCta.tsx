export default function BottomCta() {
  return (
    <section
      id="bottom-cta"
      className="mx-auto max-w-[1385px] px-6 mb-[220px] text-center"
      aria-labelledby="bottomCtaHeading"
    >
      <h2
        id="bottomCtaHeading"
        className="text-[30px] leading-[1.25] tracking-[-0.01em] font-semibold"
      >
        <span className="text-white/45">Build in a weekend,</span>{' '}
        <span className="text-white">scale to millions</span>
      </h2>

      {/* 55px gap to buttons */}
      <div className="mt-[55px] flex flex-wrap items-center justify-center gap-4">
        <a
          href="#get-started"
          className="inline-flex h-12 px-6 items-center justify-center rounded-xl
                     bg-emerald-700 text-white hover:bg-emerald-600
                     shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset]
                     focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition"
          aria-label="Start your project"
        >
          Start your project
        </a>

        <a
          href="#request-demo"
          className="inline-flex h-12 px-6 items-center justify-center rounded-xl
                     bg-white/[.08] text-white/90 border border-white/15
                     hover:bg-white/[.12]
                     focus:outline-none focus:ring-2 focus:ring-white/30 transition"
          aria-label="Request a demo"
        >
          Request a demo
        </a>
      </div>
    </section>
  )
}
