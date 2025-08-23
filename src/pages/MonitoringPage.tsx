import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import CitySim from '../monitoring/CitySim'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'

// Simple placeholder notifications data (could later be sourced dynamically)
const seedNotifications = [
  { id: 1, title: 'Signal Phase Shift Applied', detail: 'Adaptive cycle adjusted at 4 junctions', icon: '🔔', time: '2m ago' },
]

interface UINote { id:number; title:string; detail:string; severity?: 'normal'|'warn'|'block'|'clear'; time:string }

function NotificationsPanel({ notes }:{ notes: UINote[] }){
  return (
  <div className="flex flex-col h-full w-full">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[11px] text-white/60 leading-snug">Live system events & signal insights.</p>
      </div>
      <div className="relative flex-1 min-h-0">
  <ul className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '520px', paddingRight:4 }}>
          {notes.map(n=> {
            const sev = n.severity || 'normal'
            const border = sev==='block' ? 'border-red-500/60 shadow-[0_0_6px_1px_rgba(239,68,68,0.35)] border-2' : sev==='warn' ? 'border-yellow-400/40 border' : 'border-white/10 border'
            return (
              <li key={n.id} className={`group flex items-start gap-3 rounded-md bg-black/25 px-3 py-2 ${border} transition-colors animate-[fadeIn_0.4s_ease]`} style={{ minHeight:56 }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/85 leading-snug truncate">{n.title}</p>
                  <p className="text-[11px] text-white/45 leading-snug truncate">{n.detail}</p>
                </div>
                <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">{n.time}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }){
  return (
    <div className="mx-auto" style={{ width: '100%', maxWidth: 1370 }}>
  <style>{`@media (max-width: 1024px){ .cm-grid-stack { grid-template-columns: 1fr !important; } .cm-grid-stack > :first-child { width: 100% !important; } } @keyframes fadeIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }`}</style>
      {children}
    </div>
  )
}

export default function MonitoringPage() {
  const [notes,setNotes] = React.useState<UINote[]>(seedNotifications as UINote[])
  const pushNotification = React.useCallback((e:NotificationEvent)=>{
    // Map event types to icon & formatting
    const clean = e.message.replace(/^([��🔴⚠️])\s*/,'')
    let severity: UINote['severity'] = 'normal'
    if (e.type==='block') severity='block'; else if(e.type==='warn') severity='warn'; else if(e.type==='clear') severity='clear'
    setNotes(prev=>[
      { id:e.id, title: clean.split(':')[0]?.slice(0,70) || 'Update', detail: clean.split(':').slice(1).join(':').trim().slice(0,110) || clean, severity, time: 'now' },
      ...prev.slice(0,30)
    ])
  },[])
  return (
    <Layout>
      {/* Secondary product navigation */}
      <ProductTabs />
      <section className="relative min-h-[70vh] bg-transparent px-6 pt-8" aria-labelledby="monitoring-heading">
        <DashboardShell>
          <header className="mb-8">
            <h1 id="monitoring-heading" className="text-3xl font-semibold tracking-tight mb-3">Carbon Monitoring</h1>
            <p className="text-white/70 max-w-2xl text-sm leading-relaxed">Real‑time urban flow model: signal phases, vehicles & pedestrian activity visualization.</p>
          </header>
          <div className="cm-grid-stack grid gap-[60px]" style={{ gridTemplateColumns: '360px 1fr' }}>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4" style={{ width: 360 }}>
              <NotificationsPanel notes={notes} />
            </div>
      <div className="p-0 flex flex-col" style={{ minHeight: 560 }}>
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold tracking-tight mb-1">Adaptive Network Grid</h2>
                <p className="text-[11px] text-white/60 leading-snug">Real-time routing • congestion-driven re-pathing</p>
              </div>
              <div className="flex-1 min-h-0">
        <AdaptiveNetworkSim desiredHeight={550} onNotify={pushNotification} frameless blendBackground className="-m-2" />
              </div>
            </div>
          </div>
        </DashboardShell>
      </section>
    </Layout>
  )
}
