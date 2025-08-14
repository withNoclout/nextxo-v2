const menus = [
  { title: 'Product', items: ['Monitoring','Sensors','Pipelines','Realtime','Storage','Forecasts','Pricing'] },
  { title: 'Solutions', items: ['Enterprises','Manufacturing','Supply Chain','Startups','ESG Teams','Energy'] },
  { title: 'Resources', items: ['Blog','Support','System Status','Integrations','Security & Compliance','DPA'] },
  { title: 'Developers', items: ['Documentation','API & SDKs','Changelog','Open Source','Careers'] },
  { title: 'Company', items: ['About','General Availability','Terms','Privacy','Acceptable Use','SLA'] },
];

export function Footer() {

  return (
    <footer className="w-full px-6 pb-16 mt-[100px]">
      <div className="max-w-7xl w-full mx-auto flex items-start justify-between">
        {/* Brand block */}
        <div className="shrink-0 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-sm bg-emerald-500 grid place-items-center text-black font-bold">N</div>
            <span className="text-white text-xl font-semibold">NetXO</span>
          </div>
          <div className="flex items-center gap-5 text-white/60">
            <IconX/> <IconGitHub/> <IconDiscord/> <IconYouTube/>
          </div>
        </div>

        {/* Menus */}
        <div className="hidden lg:grid grid-flow-col auto-cols-max gap-x-[200px]">
          {menus.map(m => (
            <nav key={m.title} className="text-left">
              <h4 className="text-[15px] font-medium text-neutral-200 tracking-tight">{m.title}</h4>
              <ul className="mt-[40px] space-y-[25px]">
                {m.items.map(item => (
                  <li key={item}><a href="#" className="text-[15px] font-normal text-neutral-400 hover:text-neutral-200 transition-colors">{item}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Mobile / tablet stacked menus */}
      <div className="lg:hidden max-w-7xl mx-auto mt-16 grid grid-cols-2 gap-y-8 gap-x-16">
        {menus.map(m => (
          <div key={m.title}>
            <h4 className="text-[15px] font-medium text-neutral-200 tracking-tight">{m.title}</h4>
            <ul className="mt-6 space-y-4">
              {m.items.map(item => (
                <li key={item}><a href="#" className="text-[14px] font-normal text-neutral-400 hover:text-neutral-200 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom legal bar */}
      <div className="mt-20 pt-8 border-t border-white/10 text-xs text-white/50 flex flex-col sm:flex-row items-center gap-4 justify-between max-w-7xl mx-auto">
        <span>© {new Date().getFullYear()} NetXO, Inc.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Security.txt</a>
        </div>
      </div>
    </footer>
  );
}

/* minimal SVGs (placeholders) */
function IconX(){return(<svg width="20" height="20" viewBox="0 0 24 24" className="icon"><path d="M18 2l-7.5 9.5L18 22h-2.5L9 13.8 4.5 22H2l7-10L2.5 2H5l5.2 8L16 2h2z"/></svg>);} 
function IconGitHub(){return(<svg width="20" height="20" viewBox="0 0 24 24" className="icon"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.12-1.46-1.12-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.66.35-1.1.63-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .85-.27 2.8 1.02A9.7 9.7 0 0112 6.8c.86 0 1.72.12 2.53.35 1.95-1.29 2.8-1.02 2.8-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0012 2z"/></svg>);} 
function IconDiscord(){return(<svg width="20" height="20" viewBox="0 0 24 24" className="icon"><path d="M20 4a18 18 0 00-4.39-1.35l-.21.42A14 14 0 0012 2c-1.55 0-3.08.23-4.39.65l-.22-.42A18 18 0 003 4C1.17 6.35.36 8.6.12 10.85 0 14.5 1.64 17.8 4 20c2.07 1.77 4.58 2 7.99 2s5.92-.23 7.99-2c2.36-2.2 4-5.5 3.88-9.15C23.64 8.6 22.83 6.35 21 4zm-8 11.5c-1.65 0-3-1.57-3-3.5s1.35-3.5 3-3.5 3 1.57 3 3.5-1.35 3.5-3 3.5z"/></svg>);} 
function IconYouTube(){return(<svg width="22" height="22" viewBox="0 0 24 24" className="icon"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.2 3.5 12 3.5 12 3.5s-7.2 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c2.2.6 9.4.6 9.4.6s7.2 0 9.4-.6a3 3 0 002.1-2.1c.4-1.9.5-3.8.5-5.8a31 31 0 00-.5-5.8zM9.8 15.5V8.5L15.5 12l-5.7 3.5z"/></svg>);} 
