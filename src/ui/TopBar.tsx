import React from 'react'

export default function TopBar() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        <div
          className="
            mx-auto max-w-[1385px] h-[65px] px-4
            border-b border-white/10
            bg-black/40 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md
          "
        >
          <div className="h-full flex items-center justify-between">
            {/* left: brand + nav */}
            <div className="flex items-center">
              <a href="#" className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-sm bg-[#22c55e] grid place-items-center text-black font-bold">N</div>
                <span className="text-white text-lg font-semibold">NetXO</span>
              </a>

              {/* nav — 14px text, 40px from brand, 20px between */}
              <nav className="ml-[40px] flex items-center gap-5 text-[14px] leading-none">
                <Mega label="Product" />
                <Mega label="Developers" />
                <Mega label="Solutions" />
                <NavLink>Pricing</NavLink>
                <NavLink>Docs</NavLink>
                <NavLink>Community</NavLink>
              </nav>
            </div>

            {/* right: metric + buttons (different colors) */}
            <div className="flex items-center gap-3">
              <div className="h-[36px] px-3 flex items-center gap-2 text-white/80">
                <GitHubIcon className="h-5 w-5 fill-white/70" />
                <span className="tabular-nums">80.1K</span>
              </div>

              {/* Support = neutral dark (like Request a demo) */}
              <ButtonNeutral>Support</ButtonNeutral>

              {/* Get started = green (like Start your project) */}
              <ButtonGreen>Get started</ButtonGreen>
            </div>
          </div>
        </div>
      </header>
      {/* spacer so content doesn’t hide behind the fixed bar */}
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

/* Neutral dark button (like “Request a demo”) */
function ButtonNeutral({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="
        h-[40px] px-4 rounded-xl
        border border-white/30 text-white
        bg-[#161616]
        hover:bg-[#1d1d1d]
        active:translate-y-[1px]
        transition
      "
    >
      {children}
    </button>
  );
}

/* Green button (like “Start your project”) */
function ButtonGreen({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="
        h-[40px] px-4 rounded-xl
        border border-white/30 text-white
        bg-[#0B7A54]  /* deep green similar to your hero button */
        hover:brightness-110
        active:translate-y-[1px]
        transition
      "
    >
      {children}
    </button>
  );
}

/* ---------- mega menu (with 20px row spacing) ---------- */
function Mega({ label }: { label: string }) {
  return (
    <div className="relative group">
      <button className="inline-flex items-center gap-1.5 text-white/80 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded">
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      <div
        className="
          invisible opacity-0 translate-y-2
          group-hover:visible group-hover:opacity-100 group-hover:translate-y-0
          focus-within:visible focus-within:opacity-100 focus-within:translate-y-0
          transition
          absolute left-0 top-[calc(100%+10px)] z-50
          w-[920px] rounded-2xl border border-white/10
          bg-[#0E0E0E]/95 backdrop-blur-md
          shadow-[0_18px_44px_rgba(0,0,0,.5)]
          p-5
        "
      >
        <div className="grid grid-cols-12 gap-6">
          {/* Left: products */}
          <div className="col-span-6">
            <SectionTitle>PRODUCTS</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
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

          {/* Middle: modules */}
          <div className="col-span-3">
            <SectionTitle>MODULES</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
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

          {/* Right: stories & compare */}
          <div className="col-span-3">
            <SectionTitle>CUSTOMER STORIES</SectionTitle>
            <a href="#" className="block p-3 rounded-lg border border-white/10 hover:bg-white/5">
              <div className="text-white font-medium">Kayhan Space 8× speed</div>
              <div className="text-white/60 text-sm">after moving to NetXO</div>
            </a>

            <div className="h-4" />
            <SectionTitle>COMPARE NETXO</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
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
  return <div className="text-white/60 text-xs tracking-[0.12em] mb-2">{children}</div>;
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
