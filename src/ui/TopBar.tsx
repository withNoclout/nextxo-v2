import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function TopBar() {
  const [activeMenu, setActiveMenu] = React.useState<null | 'Product' | 'Developers' | 'Solutions'>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setActiveMenu(null), 1000)
  }
  const openMenu = (key: 'Product' | 'Developers' | 'Solutions') => {
    cancelClose()
    setActiveMenu(key)
  }

  return (
    <>
      {/* full-width hairline lives here now */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-[1385px] h-[65px] px-4">
          <div className="h-full flex items-center justify-between">
            {/* left */}
            <div className="flex items-center">
              <a className="flex items-center gap-3" href="#">
                <div className="h-7 w-7 rounded-sm bg-[#22c55e] grid place-items-center text-black font-bold">N</div>
                <span className="text-white text-lg font-semibold">NetXO</span>
              </a>

              {/* nav: keep pointer inside container to avoid closing */}
              <nav
                className="ml-[40px] flex items-center gap-5 text-[14px] leading-none"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <Mega
                  label="Product"
                  open={activeMenu === 'Product'}
                  onOpen={() => openMenu('Product')}
                  onKeepOpen={cancelClose}
                  onMaybeClose={scheduleClose}
                />
                <Mega
                  label="Developers"
                  open={activeMenu === 'Developers'}
                  onOpen={() => openMenu('Developers')}
                  onKeepOpen={cancelClose}
                  onMaybeClose={scheduleClose}
                />
                <Mega
                  label="Solutions"
                  open={activeMenu === 'Solutions'}
                  onOpen={() => openMenu('Solutions')}
                  onKeepOpen={cancelClose}
                  onMaybeClose={scheduleClose}
                />
                <NavLink>Pricing</NavLink>
                <NavLink>Docs</NavLink>
                <NavLink>Community</NavLink>
              </nav>
            </div>

            {/* right cluster left as-is */}
            <div className="flex items-center gap-3">
              <div className="h-[30px] px-2 flex items-center gap-2 text-white/80">
                <GitHubIcon className="h-4 w-4 fill-white/70" />
                <span className="tabular-nums text-[12px]">80.1K</span>
              </div>
              <ButtonNeutral>Support</ButtonNeutral>
              <ButtonGreen>Get started</ButtonGreen>
            </div>
          </div>
        </div>
      </header>
      <div className="h-[65px]" />
    </>
  )
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

/* 85×30 neutral (demo-style) */
function ButtonNeutral({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="
        w-[85px] h-[30px] text-[10px]
        rounded-lg flex items-center justify-center
        border border-white/30 text-white
        bg-[#161616] hover:bg-[#1d1d1d]
        active:translate-y-[1px] transition
      "
    >
      {children}
    </button>
  );
}

/* 85×30 green (primary) */
function ButtonGreen({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="
        w-[85px] h-[30px] text-[10px]
        rounded-lg flex items-center justify-center
        border border-white/30 text-white
        bg-[#0B7A54] hover:brightness-110
        active:translate-y-[1px] transition
      "
    >
      {children}
    </button>
  );
}

/* ---------- mega menu (TopBar-controlled) ---------- */
function Mega({ label, open, onOpen, onKeepOpen, onMaybeClose }: {
  label: 'Product' | 'Developers' | 'Solutions';
  open: boolean;
  onOpen: () => void;
  onKeepOpen: () => void;
  onMaybeClose: () => void;
}) {
  const id = React.useId()
  return (
    <div className="relative" onMouseEnter={onOpen} onFocus={onOpen}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onMouseEnter={onOpen}
        onFocus={onOpen}
        onClick={() => (open ? onMaybeClose() : onOpen())}
        className={[
          'inline-flex items-center gap-1.5 h-[30px] rounded outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors',
          open ? 'text-emerald-400' : 'text-white/80 hover:text-emerald-400',
        ].join(' ')}
      >
        {label}
        <ChevronDown className={'h-4 w-4 ' + (open ? 'text-emerald-400' : '')} />
      </button>

      {/* panel */}
      <div
        id={id}
        onMouseEnter={onKeepOpen}
        onMouseLeave={onMaybeClose}
        className={[
          'absolute left-0 top-[calc(100%+10px)] z-50 w-[920px]',
          'rounded-2xl border border-white/10 bg-[#0E0E0E]/95 backdrop-blur-md',
          'shadow-[0_18px_44px_rgba(0,0,0,.5)] p-5 transition',
          open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2',
        ].join(' ')}
      >
        <div className="grid grid-cols-12 gap-6">
          {/* PRODUCTS */}
          <div className="col-span-6">
            <SectionTitle>PRODUCTS</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
              {(() => {
                const location = useLocation();
                const items: { id: string; title: string; desc: string; href?: string }[] = [
                  { id: 'db', title: 'Database', desc: 'Fully portable Postgres database' },
                  { id: 'monitoring', title: 'Monitoring', desc: 'Real-time carbon monitoring', href: '/monitoring' },
                  { id: 'storage', title: 'Storage', desc: 'Serverless storage for any media' },
                  { id: 'edge', title: 'Edge Functions', desc: 'Deploy code globally on the edge' },
                  { id: 'realtime', title: 'Realtime', desc: 'Synchronize and broadcast events' },
                ];
                return items.map(it => (
                  <li key={it.id}>
                    {it.href ? (
                      <Link
                        to={it.href}
                        aria-current={location.pathname === it.href ? 'page' : undefined}
                        className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      >
                        <SquareIcon className="h-10 w-10 stroke-white/50" />
                        <div>
                          <div className={(location.pathname === it.href ? 'text-emerald-400 ' : 'text-white ') + 'font-medium group-hover:text-emerald-400 group-focus:text-emerald-400'}>{it.title}</div>
                          <div className="text-white/60 text-sm">{it.desc}</div>
                        </div>
                      </Link>
                    ) : (
                      <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                        <SquareIcon className="h-10 w-10 stroke-white/50" />
                        <div>
                          <div className="text-white font-medium group-hover:text-emerald-400 group-focus:text-emerald-400">{it.title}</div>
                          <div className="text-white/60 text-sm">{it.desc}</div>
                        </div>
                      </div>
                    )}
                  </li>
                ));
              })()}
            </ul>
          </div>

          {/* MODULES */}
          <div className="col-span-3">
            <SectionTitle>MODULES</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
              {[
                ['Vector', 'AI toolkit for embeddings'],
                ['Cron', 'Recurring jobs'],
                ['Queues', 'Durable message queues'],
                ['Features', 'Explore everything'],
              ].map(([t, d]) => (
                <li key={t as string}>
                  <a href="#" className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                    <CubeIcon className="h-10 w-10 stroke-white/50" />
                    <div>
                      <div className="text-white font-medium group-hover:text-emerald-400 group-focus:text-emerald-400">{t}</div>
                      <div className="text-white/60 text-sm">{d}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* STORIES / COMPARE */}
          <div className="col-span-3">
            <SectionTitle>CUSTOMER STORIES</SectionTitle>
            <a href="#" className="block p-3 rounded-lg border border-white/10 hover:bg-white/5">
              <div className="text-white font-medium hover:text-emerald-400">Kayhan Space 8× speed</div>
              <div className="text-white/60 text-sm">after moving to NetXO</div>
            </a>

            <div className="h-4" />
            <SectionTitle>COMPARE NETXO</SectionTitle>
            <ul className="space-y-5 leading-[20px]">
              {['NetXO vs Firebase', 'NetXO vs Heroku Postgres', 'NetXO vs Auth0'].map((t) => (
                <li key={t}>
                  <a href="#" className="text-white/80 hover:text-emerald-400">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
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
