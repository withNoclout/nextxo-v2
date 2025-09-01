import React from 'react'
import Layout from '../ui/Layout'
import ProductSubNav from '../components/ProductSubNav'

export default function MonitoringPage() {
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
          <span className="text-white/70">{new Date().toLocaleDateString()}</span>
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
      </div>
      {/* Right side placeholder */}
  <div className="col-span-12 lg:col-span-5" style={{ marginTop: '65px' }}>
        <div className="h-[540px] w-[700px] max-w-full rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/20 text-sm overflow-hidden">
          (Right side placeholder)
        </div>
      </div>
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
