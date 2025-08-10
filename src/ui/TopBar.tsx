import React from 'react'

export default function TopBar() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-transparent">
        <div className="mx-auto max-w-[1385px] h-[65px] px-4 border-b border-white/10">
          <div className="h-full flex items-center justify-between">
            {/* Left: brand + nav */}
            <div className="flex items-center">
              {/* Brand */}
              <a href="#" className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-sm bg-[#22c55e] grid place-items-center text-black font-bold">N</div>
                <span className="text-white text-xl font-semibold">NetXO</span>
              </a>

              {/* Nav (first item 40px from brand, items gap 25px) */}
              <nav className="ml-[40px] flex items-center gap-[25px] text-[20px] leading-none">
                <Mega label="Product"    />
                <Mega label="Developers" />
                <Mega label="Solutions"  />
                <NavLink>Pricing</NavLink>
                <NavLink>Docs</NavLink>
                <NavLink>Community</NavLink>
              </nav>
            </div>

            {/* Right: metric + buttons */}
            <div className="flex items-center gap-3">
              <div className="h-[40px] px-3 flex items-center gap-2 text-white/80">
                <GitHubIcon className="h-5 w-5 fill-white/70" />
                <span className="tabular-nums">80.1K</span>
              </div>

              <BtnGreen>Support</BtnGreen>
              <BtnGreen>Get started</BtnGreen>
            </div>
          </div>
        </div>
      </header>

      {/* spacer so content doesn’t jump behind fixed bar */}
      <div className="h-[65px]" />
    </>
  );
}

/* ---------- primitives ---------- */
function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="text-white/80 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
    >
      {children}
    </a>
  );
}

function BtnGreen({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="
        h-[40px] px-4 rounded-xl
        border border-white/80 text-white
        bg-[#22c55e]
        shadow-[0_2px_0_rgba(0,0,0,.35)]
        hover:brightness-110
        active:translate-y-[1px] active:shadow-none
        transition
      "
    >
      {children}
    </button>
  );
}

/* ---------- mega menu (Supabase-like) ---------- */
function Mega({ label }: { label: string }) {
  return (
    <div className="relative group">
      <button className="inline-flex items-center gap-2 text-white/80 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded">
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* panel */}
      <div
        className="
          invisible opacity-0 translate-y-2
          group-hover:visible group-hover:opacity-100 group-hover:translate-y-0
          focus-within:visible focus-within:opacity-100 focus-within:translate-y-0
          transition
          absolute left-0 top-[calc(100%+12px)] z-50
          w-[880px] rounded-2xl border border-white/10 bg-[#0E0E0E]/95 backdrop-blur
          shadow-[0_18px_44px_rgba(0,0,0,.5)]
          p-4
        "
      >
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Products list */}
          <div className="col-span-6">
            <SectionTitle>PRODUCTS</SectionTitle>
            <ul className="space-y-2">
              {[
                ["Database", "Fully portable Postgres database"],
                ["Authentication", "User management out of the box"],
                ["Storage", "Serverless storage for any media"],
                ["Edge Functions", "Deploy code globally on the edge"],
                ["Realtime", "Synchronize and broadcast events"],
              ].map(([t,d]) => (
                <li key={t as string}>
                  <a href="#" className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                    <SquareIcon className="h-10 w-10 stroke-white/50" />
                    <div>
                      <div className="text-white font-medium">{t}</div>
                      <div className="text-white/60 text-sm">{d}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Middle: Modules */}
          <div className="col-span-3">
            <SectionTitle>MODULES</SectionTitle>
            <ul className="space-y-2">
              {[
                ["Vector", "AI toolkit for embeddings"],
                ["Cron", "Recurring jobs"],
                ["Queues", "Durable message queues"],
                ["Features", "Explore everything"],
              ].map(([t,d]) => (
                <li key={t as string}>
                  <a href="#" className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                    <CubeIcon className="h-10 w-10 stroke-white/50" />
                    <div>
                      <div className="text-white font-medium">{t}</div>
                      <div className="text-white/60 text-sm">{d}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Stories & Compare */}
          <div className="col-span-3">
            <SectionTitle>CUSTOMER STORIES</SectionTitle>
            <a href="#" className="block p-3 rounded-lg border border-white/10 hover:bg-white/5">
              <div className="text-white font-medium">Kayhan Space 8× speed</div>
              <div className="text-white/60 text-sm">when moving to NetXO</div>
            </a>

            <div className="h-4" />
            <SectionTitle>COMPARE NETXO</SectionTitle>
            <ul className="space-y-2">
              {["NetXO vs Firebase","NetXO vs Heroku Postgres","NetXO vs Auth0"].map(t => (
                <li key={t}><a href="#" className="text-white/80 hover:text-white">{t}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-white/60 text-sm tracking-[0.12em] mb-2">{children}</div>;
}

/* ---------- icons ---------- */
function ChevronDown({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" {...rest}><path d="M6 9l6 6 6-6"/></svg>);
}
function GitHubIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" className={className} {...rest}><path d="M12 .6A11.4 11.4 0 0 0 .6 12.2c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.7.4-1.1.6-1.3-2.5-.3-5.2-1.3-5.2-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.4.1-3 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.7 1 .7 2.1v3c0 .3.2.7.8.6A11.4 11.4 0 0 0 23.4 12 11.4 11.4 0 0 0 12 .6z"/></svg>);
}
function SquareIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" {...rest}><rect x="4" y="4" width="16" height="16" rx="3"/></svg>);
}
function CubeIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" {...rest}><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 7v10l9 5 9-5V7"/></svg>);
}
