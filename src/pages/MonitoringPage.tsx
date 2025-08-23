import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import CitySim from '../monitoring/CitySim'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'

// Simple placeholder notifications data (could later be sourced dynamically)
const seedNotifications = [
  { id: 1, title: 'Signal Phase Shift Applied', detail: 'Adaptive cycle adjusted at 4 junctions', icon: '🔔', time: '2m ago' },
]

interface UINote { id:number; title:string; detail:string; severity?: 'normal'|'warn'|'block'|'clear'; time:string; count?:number }

function NotificationsPanel({ notes }:{ notes: UINote[] }){
  return (
    <div className="w-full flex flex-col h-full overflow-hidden" style={{ paddingTop:12, paddingBottom:12 }}>
      <div className="mb-3 px-1 shrink-0">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[11px] text-white/60 leading-snug">High‑signal system events only.</p>
      </div>
      <ul className="space-y-2 px-1 overflow-y-auto pr-1" style={{ scrollbarWidth:'thin' }}>
        {notes.map(n=> {
          const sev = n.severity || 'normal'
          const border = sev==='block' ? 'border-red-500/60 shadow-[0_0_6px_1px_rgba(239,68,68,0.35)] border-2' : sev==='warn' ? 'border-yellow-400/40 border' : 'border-white/10 border'
          return (
            <li key={n.id} className={`relative group flex items-start gap-3 rounded-md bg-black/30 px-3 py-[9px] ${border} transition-colors animate-[fadeIn_0.35s_ease]`}>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[12px] font-medium text-white/85 leading-snug truncate">{n.title}</p>
                <p className="text-[11px] text-white/45 leading-snug truncate">{n.detail}</p>
              </div>
              <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">{n.time}</span>
              {n.count && n.count>1 && (
                <span className="absolute top-1 right-1 text-[10px] font-semibold text-white/80 bg-white/15 backdrop-blur-sm px-1.5 py-[1px] rounded-md leading-none">×{n.count}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }){
  return (
    <div className="mx-auto" style={{ width: '100%', maxWidth: 1500 }}>
  <style>{`@media (max-width: 1024px){ .cm-grid-stack { grid-template-columns: 1fr !important; } .cm-grid-stack > :first-child { width: 100% !important; } } @keyframes fadeIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }`}</style>
      {children}
    </div>
  )
}

export default function MonitoringPage() {
  const [notes,setNotes] = React.useState<UINote[]>(seedNotifications as UINote[])
  const pushNotification = React.useCallback((e:NotificationEvent)=>{
    const raw = e.message.replace(/^([\u{1F534}🔴⚠️🟢])\s*/u,'').trim()
    const title = raw.split(':')[0]?.trim() || 'Update'
    const detail = raw.split(':').slice(1).join(':').trim() || raw
    let importance: 'show'|'hide' = 'hide'
    let severity: UINote['severity'] = 'normal'
    if (e.type==='block') { importance='show'; severity='block' }
    else if (e.type==='warn') {
      if (/(surge|congestion rising|heavy congestion|critical delay)/i.test(raw)) { importance='show'; severity='warn' }
    }
    if (e.type==='clear') importance='hide'
    if (/high ev adoption|traffic cleared|temporary relief/i.test(raw)) importance='hide'
    if (importance==='hide') return
    setNotes(prev => {
      const idx = prev.findIndex(n => n.title === title && n.severity===severity)
      if (idx !== -1) {
        const copy = [...prev]
        const ex = copy[idx]
        copy[idx] = { ...ex, detail, time:'now', count:(ex.count||1)+1 }
        return copy
      }
      return [ { id:e.id, title: title.slice(0,70), detail: detail.slice(0,110), severity, time:'now', count:1 }, ...prev.slice(0,30) ]
    })
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
            <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-3 self-start" style={{ width: 360, height:650 }}>
              <NotificationsPanel notes={notes} />
            </div>
      <div className="p-0 flex flex-col" style={{ width:1000, height:600 }}>
              <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Adaptive Network Grid</h2>
        <p className="text-[12px] text-white/60 leading-snug">Real-time routing • congestion-driven re-pathing</p>
              </div>
              <div className="flex-1 min-h-0">
        <AdaptiveNetworkSim desiredHeight={600-60} onNotify={pushNotification} frameless blendBackground className="-m-2 text-[12px]" />
              </div>
            </div>
          </div>
        </DashboardShell>
      </section>
    </Layout>
  )
}
