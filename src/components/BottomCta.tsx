export default function BottomCta() {
  return (
    <section
      id="bottom-cta"
      className="
        mx-auto max-w-[1385px] px-6
        mb-[220px]
      "
      aria-labelledby="bottomCtaHeading"
    >
      <h2
        id="bottomCtaHeading"
        className="
          text-[56px] md:text-[72px] lg:text-[88px]
          leading-[1.08] tracking-[-0.02em] font-semibold
        "
      >
        <span className="text-white/45">Build in a weekend,</span>{' '}
        <span className="text-white">scale to millions</span>
      </h2>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href="#get-started"
          className="
            inline-flex items-center justify-center
            h-12 px-6 rounded-xl
            bg-emerald-700 text-white
            shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset]
            hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60
            transition
          "
          aria-label="Start your project"
        >
          Start your project
        </a>

        <a
          href="#request-demo"
          className="
            inline-flex items-center justify-center
            h-12 px-6 rounded-xl
            bg-white/[.08] text-white/90
            border border-white/15
            hover:bg-white/[.12] focus:outline-none focus:ring-2 focus:ring-white/30
            transition
          "
          aria-label="Request a demo"
        >
          Request a demo
        </a>
      </div>
    </section>
  )
}
