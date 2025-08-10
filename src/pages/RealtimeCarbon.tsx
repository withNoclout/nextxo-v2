import Layout from '../ui/Layout'

const MonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" fill="none" strokeWidth="1.5"/>
    <rect x="9" y="18" width="6" height="2" rx="1" fill="currentColor"/>
  </svg>
)

export default function RealtimeCarbonPage(){
  return (
    <Layout>
      <section className="rcm-wrap">
        <div className="rcm-card">
          <div className="rcm-grid">
            {/* Left promo */}
            <div className="rcm-left">
              <h1 className="rcm-title">
                <MonitorIcon style={{color:'var(--mint)'}}/> Realtime Carbon Monitor
              </h1>
              <p className="rcm-lead">
                Monitor live traffic flow and carbon signals across campus — built for dark UI with Supabase styling.
              </p>
              <ul className="rcm-bullets">
                <li>Live updates with smooth animations</li>
                <li>Pluggable traffic module (mapless placeholder for now)</li>
                <li>Designed for black / mint theme</li>
              </ul>
            </div>

            {/* Right dashboard panel (no outline) */}
            <div className="rcm-right">
              <div className="rcm-dashboard">
                <div className="rcm-placeholder">
                  Traffic dashboard (coming soon)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
