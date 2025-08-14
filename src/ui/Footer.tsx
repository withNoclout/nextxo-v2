export function Footer() {
  const menus: { head: string; items: string[] }[] = [
    { head: 'Product', items: ['Monitoring','Sensors','Pipelines','Realtime','Storage','Forecasts','Pricing'] },
    { head: 'Solutions', items: ['Enterprises','Manufacturing','Supply Chain','Startups','ESG Teams','Energy'] },
    { head: 'Resources', items: ['Blog','Support','System Status','Integrations','Security & Compliance','DPA'] },
    { head: 'Developers', items: ['Documentation','API & SDKs','Changelog','Open Source','Careers'] },
    { head: 'Company', items: ['About','General Availability','Terms','Privacy','Acceptable Use','SLA'] },
  ];

  return (
    <footer className="footer">
      {/* Security ribbon (unchanged) */}
      <div className="border-t border-white/10">
        <div className="max-w-[1375px] mx-auto px-6 py-4 text-sm flex flex-wrap items-center gap-6 justify-center sm:justify-between">
          <p className="text-white/80">
            We protect your data.{' '}<a href="#" className="text-[#22c55e] hover:opacity-90">More on Security</a>
          </p>
          <ul className="flex items-center gap-6 text-white/60">
            <li className="whitespace-nowrap">✓ SOC2 Type 2 <span className="text-white/40">Certified</span></li>
            <li className="whitespace-nowrap">✓ HIPAA <span className="text-white/40">Compliant</span></li>
          </ul>
        </div>
      </div>

      {/* Main brand + menus (pixel-spec) */}
      <div className="border-t border-white/10">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logoMark" aria-label="NetXO logo">N</div>
            <span className="footer__brandName">NetXO</span>
            <div className="footer__socials">
              <a href="#" aria-label="X"><IconX/></a>
              <a href="#" aria-label="GitHub"><IconGitHub/></a>
              <a href="#" aria-label="Discord"><IconDiscord/></a>
              <a href="#" aria-label="YouTube"><IconYouTube/></a>
            </div>
          </div>
          <nav className="footer__menus" aria-label="Footer navigation">
            {menus.map(m => (
              <section className="footer__menu" key={m.head}>
                <h4 className="footer__head">{m.head}</h4>
                <ul className="footer__list">
                  {m.items.map(it => (
                    <li key={it}><a href="#">{it}</a></li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1375px] mx-auto px-6 py-6 text-xs text-white/60 flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} NetXO, Inc.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Security.txt</a>
          </div>
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
