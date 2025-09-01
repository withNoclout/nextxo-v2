import React, { useEffect, useState } from 'react'
import Layout from '../ui/Layout'
import ProductSubNav from '../components/ProductSubNav'

export default function MonitoringPage() {
  // Animated date component (reveals the date like it's being freshly generated each visit)
  const AnimatedDate: React.FC = () => {
    const finalText = new Date().toLocaleDateString()
    const [shown, setShown] = useState('')

    useEffect(() => {
      let i = 0
      const step = () => {
        i++
        setShown(finalText.slice(0, i))
        if (i < finalText.length) {
          timeout = window.setTimeout(step, 55)
        }
      }
      let timeout = window.setTimeout(step, 180) // slight delay before starting
      return () => window.clearTimeout(timeout)
    }, [finalText])

    return (
      <span className="tabular-nums tracking-tight relative">
        <span className="opacity-90">{shown}</span>
        <span className="inline-block w-px -ml-px align-middle h-[1em] animate-pulse bg-white/40" style={{ visibility: shown === finalText ? 'hidden' : 'visible' }} />
      </span>
    )
  }
  // Product dropdown list representation (add / adjust icons as needed)
  const productItems = [
    {
      id: 'database',
      label: 'Database',
      icon: (
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.4" className="w-[15px] h-[15px]">
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
          <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </svg>
      )
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: (
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.4" className="w-[15px] h-[15px]">
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M3 15h18M10 9l2 2 3-3" />
        </svg>
      )
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: (
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.4" className="w-[15px] h-[15px]">
          <path d="M3 7h18v10H3z" />
          <path d="M3 11h18" />
        </svg>
      )
    },
    {
      id: 'edge-functions',
      label: 'Edge Functions',
      icon: (
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.4" className="w-[15px] h-[15px]">
          <path d="M4 4h7v7H4zM13 13h7v7h-7z" />
          <path d="M4 13l3 3 4-4M13 4l4 4 3-3" />
        </svg>
      )
    },
    {
      id: 'realtime',
      label: 'Realtime',
      icon: (
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.4" className="w-[15px] h-[15px]">
          <path d="M4 12h4l2 7 4-14 2 7h4" />
        </svg>
      )
    }
  ]

  const handleNavigate = (pageId: string) => {
    console.log('Navigate to:', pageId)
    // TODO: Implement actual navigation logic
  }

  // Placeholder realtime server status (replace with real data later)
  const isOnline = true // toggle for demo; integrate with realtime status source later

  const WaveKeyframes = () => (
    <style>{`
      @keyframes onairWave {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  )

  return (
    <Layout>
  <ProductSubNav items={productItems} current="monitoring" onChange={handleNavigate} />
  {/* Status / Info Block (placeholder content) */}
  <div className="w-full" style={{ marginTop: '70px' }}>
    <div className="max-w-[1350px] mx-auto px-6 grid grid-cols-12 gap-10">
      {/* Left side */}
      <div className="col-span-12 lg:col-span-7 flex flex-col">
        <div className="text-[15px] font-medium tracking-tight flex flex-wrap items-center gap-3">
          <span>
            {isOnline && <WaveKeyframes />}
            <span
              className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[12px] font-semibold tracking-wide overflow-hidden ${
                isOnline
                  ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                  : 'text-red-400 border-red-500/30 bg-red-500/10'
              }`}
            >
              {isOnline && (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.15) 35%, rgba(16,185,129,0.4) 50%, rgba(16,185,129,0.15) 65%, rgba(16,185,129,0) 100%)',
                    animation: 'onairWave 1.8s linear infinite'
                  }}
                />
              )}
              <span className="relative z-10">{isOnline ? 'OnAir' : 'Offline'}</span>
            </span>
          </span>
          <span className="text-white/25">|</span>
          <span className="text-white/70"><AnimatedDate /></span>
          <span className="text-white/25">|</span>
          <span className="text-white/50">Active Server:</span>
          <span className="text-white/90 font-semibold">us-east-1</span>
        </div>
        <div className="mt-10 flex items-center gap-4">
          <div className="h-[35px] w-[35px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/50">MP</div>
          <div className="flex flex-col justify-center">
            <div className="text-[14px] text-white font-semibold leading-tight">Monitoring Page</div>
            <div className="text-[12px] text-white/50 leading-tight">Project environment overview</div>
          </div>
        </div>

        {/* Two-line quote 40px below (mt-10 ~ 40px) */}
        <div className="mt-10 leading-[1.07] select-none">
          <div className="text-[27px] font-semibold tracking-tight text-white">REALTIME VISIBILITY</div>
          <div className="text-[23px] font-medium tracking-tight text-white/90">for emissions & node health</div>
        </div>

        {/* Explanation 50px below */}
  <p className="max-w-[520px] text-[15px] text-white/60 leading-relaxed" style={{ marginTop: '50px' }}>
          Live streaming metrics capture carbon deltas, performance anomalies, and node uptime in one unified view.
          Use this page to spot drift early, validate optimizations, and keep infrastructure efficient.
        </p>
        {/* Action buttons 40px below explanation */}
        <div className="mt-10 flex items-center gap-4">
          <button
            className="h-10 px-5 rounded-md bg-emerald-500 text-white text-[13px] font-medium tracking-tight border border-emerald-400/40 shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-[0.985] transition"
            type="button"
          >
            Start Monitoring
          </button>
          <a
            href="https://supabase.com/docs/guides/auth"
            target="_blank"
            rel="noreferrer"
            className="h-10 px-5 rounded-md border border-white/15 bg-white/[0.03] text-white/85 text-[13px] font-medium tracking-tight hover:text-white hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/25 active:scale-[0.985] transition inline-flex items-center justify-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px] text-white/60"
              aria-hidden="true"
            >
              <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h11.5v15.5A2.5 2.5 0 0 0 16 16H7a2.5 2.5 0 0 0-2.5 2.5V5.5Z" />
              <path d="M16 3v13c-.5-.3-1.1-.5-2-.5H7c-.9 0-1.5.2-2 .5" />
            </svg>
            <span>See documentation</span>
          </a>
        </div>
      </div>
      {/* Right side placeholder */}
  <div className="col-span-12 lg:col-span-5" style={{ marginTop: '65px' }}>
        <div className="h-[540px] w-[700px] max-w-full rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/20 text-sm overflow-hidden">
          (Right side placeholder)
        </div>
      </div>
    </div>
  </div>
  {/* Second session: three equal panels 60px below previous section */}
  <div className="mt-[60px] max-w-[1350px] mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          title: 'Log Stream',
          desc: 'Aggregated real‑time application logs with query filters for latency spikes, error bursts, and user impact tracing.',
          icon: (
            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" className="w-[30px] h-[30px] text-white/60">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 9h8M8 13h5M8 17h3" />
            </svg>
          )
        },
        {
          title: 'Anomaly Scanner',
          desc: 'Streaming detection surfaces carbon or performance outliers early so you can remediate before users notice.',
          icon: (
            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" className="w-[30px] h-[30px] text-white/60">
              <path d="M12 3l9 6-9 6-9-6 9-6z" />
              <path d="M5 15l7 6 7-6" />
            </svg>
          )
        },
        {
          title: 'Carbon Profiler',
          desc: 'Breaks down emission contribution per region & function, guiding optimization and greener scaling decisions.',
          icon: (
            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" className="w-[30px] h-[30px] text-white/60">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          )
        }
      ].map((p, i) => (
  <div key={i} className="h-[250px] p-5 flex flex-col">
          <div className="flex items-start">{p.icon}</div>
          <h3 className="mt-[25px] text-[17px] font-semibold tracking-tight text-white">{p.title}</h3>
          <p className="mt-[35px] text-[14px] leading-relaxed text-white/55 max-w-[300px]">
            {p.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
  <section
        className="relative min-h-[70vh] bg-transparent"
        aria-labelledby="monitoring-heading"
      >
        <h1 id="monitoring-heading" className="sr-only">Monitoring</h1>
        {/* Future monitoring content will go here */}
      </section>
    </Layout>
  )
}
