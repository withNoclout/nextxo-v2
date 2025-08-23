import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import CitySim from '../monitoring/CitySim'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'

// Simple placeholder notifications data (could later be sourced dynamically)
const seedNotifications = [
  { id: 1, title: 'Signal Phase Shift Applied', detail: 'Adaptive cycle adjusted at 4 junctions', icon: '🔔', time: '2m ago' },
]

interface UINote { id:number; title:string; detail:string; icon:string; time:string }

function NotificationsPanel({ notes }:{ notes: UINote[] }){
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[11px] text-white/60 leading-snug">Live system events & signal insights.</p>
      </div>
      <div className="relative flex-1 min-h-0">
        <ul className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
          {notes.map(n=> (
            <li key={n.id} className="group flex items-center gap-3 rounded-lg bg-black/40 border border-white/10 px-3 py-2 hover:border-emerald-500/30 transition-colors" style={{ height: 60 }}>
              <div className="text-xl leading-none select-none" aria-hidden>{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/90 truncate">{n.title}</p>
                <p className="text-[11px] text-white/55 truncate">{n.detail}</p>
              </div>
              <span className="text-[10px] text-white/40 ml-2 whitespace-nowrap">{n.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }){
  return (
    <div className="mx-auto" style={{ width: '100%', maxWidth: 1370 }}>
  <style>{`@media (max-width: 1024px){ .cm-grid-stack { grid-template-columns: 1fr !important; } .cm-grid-stack > :first-child { width: 100% !important; } }`}</style>
      {children}
    </div>
  )
}

export default function MonitoringPage() {
  const [notes,setNotes] = React.useState<UINote[]>(seedNotifications)
  const pushNotification = React.useCallback((e:NotificationEvent)=>{
    // Map event types to icon & formatting
    const icon = e.message.startsWith('🔴') ? '🔴' : e.message.startsWith('⚠️') ? '⚠️' : e.message.startsWith('🟢') ? '🟢' : '🔔'
    const clean = e.message.replace(/^([🟢🔴⚠️])\s*/,'')
    setNotes(prev=>[
      { id:e.id, title: clean.split(':')[0]?.slice(0,70) || 'Update', detail: clean.split(':').slice(1).join(':').trim().slice(0,80) || clean, icon, time: 'now' },
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
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 flex flex-col" style={{ minHeight: 560 }}>
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold tracking-tight mb-1">Adaptive Network Grid</h2>
                <p className="text-[11px] text-white/60 leading-snug">Real-time routing • congestion-driven re-pathing</p>
              </div>
              <div className="flex-1 min-h-0">
                <AdaptiveNetworkSim desiredHeight={550} onNotify={pushNotification} />
              </div>
            </div>
          </div>
        </DashboardShell>
      </section>
    </Layout>
  )
}
