import React from 'react'

export default function TopBar() {
  return (
    <header className="w-[1385px] h-[90px] mx-auto border-b border-white/10">
      <div className="h-full flex items-center justify-between py-[25px]">
        {/* left: brand + nav */}
        <div className="flex items-center">
          {/* brand */}
          <a href="#" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-sm bg-[#22c55e] grid place-items-center text-black font-bold">N</div>
            <span className="text-white text-xl font-semibold">NetXO</span>
          </a>

          {/* nav (brand -> 40px gap) */}
          <nav className="ml-[40px] h-[40px] flex items-center gap-[25px] text-white/80">
            <Drop label="Product"    items={["Monitoring", "Pipelines", "Sensors", "Pricing"]} />
            <Drop label="Developers" items={["Docs", "API & SDKs", "CLI", "Changelog"]} />
            <Drop label="Solutions"  items={["Enterprises", "Manufacturing", "ESG Teams", "Energy"]} />
            <Drop label="Pricing"    items={["Plans", "Calculator", "Enterprise"]} />
            <Drop label="Docs"       items={["Getting started", "Guides", "Reference"]} />
            <Drop label="Community"  items={["Discord", "GitHub", "Blog", "Events"]} />
          </nav>
        </div>

        {/* right: visits metric */}
        <div className="h-[40px] flex items-center gap-2 text-white/80">
          <GitHubIcon className="h-5 w-5 fill-white/70" />
          <span className="tabular-nums">80.1K</span>
        </div>
      </div>
    </header>
  );
}

/* ------------------ dropdown (mock) ------------------ */
function Drop({ label, items = [] }: { label: string; items?: string[] }) {
  return (
    <div className="relative group h-[40px]">
      <button
        className="h-[40px] inline-flex items-center gap-2 px-2 rounded-md text-white/80 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* menu */}
      <div
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition
                   absolute left-0 top-[calc(100%+12px)] z-50 w-[220px]
                   rounded-xl border border-white/10 bg-[#0E0E0E]/95 backdrop-blur
                   shadow-[0_12px_28px_rgba(0,0,0,.45)] p-2"
      >
        <ul className="py-1">
          {items.map((t) => (
            <li key={t}>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-sm text-white/80 hover:text-white hover:bg-white/5"
              >
                {t}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------ icons ------------------ */
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" {...rest}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props
  return (
    <svg viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M12 .6A11.4 11.4 0 0 0 .6 12.2c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.7.4-1.1.6-1.3-2.5-.3-5.2-1.3-5.2-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.4.1-3 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.7 1 .7 2.1v3c0 .3.2.7.8.6A11.4 11.4 0 0 0 23.4 12 11.4 11.4 0 0 0 12 .6z"/>
    </svg>
  );
}
