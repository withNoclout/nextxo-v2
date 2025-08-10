export default function ComingSoonDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="
          relative w-[1150px] h-[670px]
          rounded-2xl border border-white/10 bg-white/[.035]
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
          overflow-hidden
        "
      >
        {/* subtle grid tint */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,.04),transparent_70%)]" />

        {/* Fake dashboard layout */}
        <div className="absolute inset-0 p-6 grid grid-cols-12 grid-rows-6 gap-4">
          {/* big chart */}
          <div className="col-span-8 row-span-4 skeleton rounded-xl" />
          {/* side widgets */}
          <div className="col-span-4 row-span-2 skeleton rounded-xl" />
          <div className="col-span-4 row-span-2 skeleton rounded-xl" />
          {/* lower widgets */}
          <div className="col-span-4 row-span-2 skeleton rounded-xl" />
          <div className="col-span-4 row-span-2 skeleton rounded-xl" />
          <div className="col-span-4 row-span-2 skeleton rounded-xl" />
        </div>

        {/* COMING SOON overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-black/45 backdrop-blur-md">
            <span className="text-[13px] tracking-[0.14em] font-semibold text-white/95">
              COMING\u00A0SOON
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:.15s]" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:.3s]" />
          </div>
        </div>
      </div>
    </div>
  )
}
