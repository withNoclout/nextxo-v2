import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import CitySim from '../monitoring/CitySim'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'

// Simple placeholder notifications data (could later be sourced dynamically)
const seedNotifications: Array<Pick<UINote,'id'|'title'|'detail'|'time'>> = [
  { id: 1, title: 'Signal Phase Shift Applied', detail: 'Adaptive cycle adjusted at 4 junctions', time: '2m ago' },
]

interface UINote {
  id:number
  title:string
  detail:string
  severity?: 'normal'|'warn'|'block'|'clear'
  category: 'critical'|'major'|'routine'
  time:string
  count?:number
}

function NotificationsPanel({ notes }:{ notes: UINote[] }){
  return (
    <div className="w-full flex flex-col h-full overflow-hidden" style={{ paddingTop:12, paddingBottom:12 }}>
      <div className="mb-3 px-1 shrink-0">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[11px] text-white/60 leading-snug">Critical events ungrouped • others grouped.</p>
      </div>
      <ul className="space-y-2 px-1 overflow-y-auto pr-1" style={{ scrollbarWidth:'thin' }}>
        {notes.map(n=> {
          const border = n.category==='critical'
            ? 'border-red-500/70 shadow-[0_0_6px_1px_rgba(239,68,68,0.45)] border-2'
            : n.category==='major'
              ? 'border-yellow-400/40 border'
              : 'border-white/10 border'
          const full = n.detail ? `${n.title}: ${n.detail}` : n.title
          const line = (n.count && n.count>1) ? `${full} (x${n.count})` : full
          return (
            <li key={n.id} className={`group flex items-start gap-3 rounded-md bg-black/30 px-3 py-[9px] ${border} transition-colors animate-[fadeIn_0.35s_ease]`}>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[12px] font-medium text-white/85 leading-snug truncate" title={full}>{line}</p>
              </div>
              <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">{n.time}</span>
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
  const [notes,setNotes] = React.useState<UINote[]>(() => seedNotifications.map(n=> ({...n, severity:'normal', category:'routine', count:1 })))
  const pushNotification = React.useCallback((e:NotificationEvent)=>{
    const raw = e.message.replace(/^([\u{1F534}🔴⚠️🟢])\s*/u,'').trim()
    const lower = raw.toLowerCase()
    const title = raw.split(':')[0]?.trim() || 'Update'
    const detail = raw.split(':').slice(1).join(':').trim()
    // Classification rules
    let category: UINote['category'] = 'routine'
    if (/(gridlock|emission spike|node failure|critical delay|blockage|critical congestion|link closed)/i.test(raw)) category='critical'
    else if (/(heavy congestion|peak-hour surge|congestion rising)/i.test(raw)) category='major'
    else category='routine'
    // Map to severity for legacy styling (critical/block, major/warn)
    let severity: UINote['severity'] = category==='critical' ? 'block' : category==='major' ? 'warn' : 'normal'
    // Filtering: optionally ignore low-value clears/green adoption unless critical
    if (/high ev adoption|traffic cleared|temporary relief/i.test(lower)) return
    if (e.type==='clear' && category!=='critical') return
    setNotes(prev => {
      if (category==='critical') {
        // Always append (no grouping)
        return [ { id:e.id, title: title.slice(0,90), detail: detail.slice(0,140), severity, category, time:'now', count:1 }, ...prev.slice(0,49) ]
      }
      // Group by title+detail+category signature
      const keyIdx = prev.findIndex(n => n.category===category && n.title===title && n.detail===detail)
      if (keyIdx !== -1) {
        const copy=[...prev]
        const ex=copy[keyIdx]
        copy[keyIdx] = { ...ex, time:'now', count:(ex.count||1)+1 }
        return copy
      }
      return [ { id:e.id, title: title.slice(0,90), detail: detail.slice(0,140), severity, category, time:'now', count:1 }, ...prev.slice(0,49) ]
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
