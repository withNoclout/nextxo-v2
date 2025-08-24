import Layout from '../ui/Layout'
import React, { useRef, useEffect, useState } from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import CitySim from '../monitoring/CitySim'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'
import CommunityFeedbackRow, { Feedback } from '../components/CommunityFeedbackRow'

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
  pinUntil?: number
}

function NotificationsPanel({ pinnedCritical, regularFeed, onDismiss, tickerPaused, onMouseEnter, onMouseLeave }:{
  pinnedCritical: UINote[];
  regularFeed: UINote[];
  onDismiss: (id:number)=>void;
  tickerPaused: boolean;
  onMouseEnter: ()=>void;
  onMouseLeave: ()=>void;
}){
  const listRef = useRef<HTMLUListElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  // Fade mask CSS is always present
  return (
    <div className="w-full flex flex-col h-full overflow-hidden notifications-viewport" style={{ paddingTop:12, paddingBottom:12, position:'relative', maskImage:'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)', WebkitMaskImage:'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)' }}
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    >
      <div className="mb-3 px-1 shrink-0">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[11px] text-white/60 leading-snug">Critical events pinned • ticker below.</p>
      </div>
      {/* Pinned critical block */}
      {pinnedCritical.length > 0 && (
        <ul className="space-y-2 px-1 mb-2">
          {pinnedCritical.slice(0,3).map((n,i) => {
            const border = 'border-red-500/70 shadow-[0_0_6px_1px_rgba(239,68,68,0.45)] border-2'
            const full = n.detail ? `${n.title}: ${n.detail}` : n.title
            return (
              <li key={n.id} className={`group flex items-start gap-3 rounded-md bg-black/30 px-3 py-[9px] ${border} transition-colors animate-[fadeIn_0.35s_ease] relative`}>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[12px] font-medium text-white/85 leading-snug truncate" title={full}>{full}</p>
                </div>
                <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">{n.time}</span>
                <button className="absolute top-1 right-1 text-[13px] text-white/60 hover:text-white/90 px-1 py-0.5 rounded focus:outline-none" title="Dismiss" onClick={()=>onDismiss(n.id)}>&times;</button>
              </li>
            )
          })}
          {pinnedCritical.length > 3 && (
            <li className="flex items-center justify-center text-[11px] text-red-300/80 mt-1">+{pinnedCritical.length-3} more critical</li>
          )}
        </ul>
      )}
      {/* Ticker for regular feed */}
      <div className="relative flex-1 min-h-0" style={{overflow:'hidden'}}>
        <div ref={trackRef} style={{transition:'none'}}>
          <ul ref={listRef} className="space-y-2 px-1 select-none">
            {regularFeed.map((n,i) => {
              const border = n.category==='major'
                ? 'border-yellow-400/40 border'
                : 'border-white/10 border'
              const full = n.detail ? `${n.title}: ${n.detail}` : n.title
              const line = (n.count && n.count>1) ? `${full} (x${n.count})` : full
              return (
                <li key={n.id+':'+(n.time||i)} className={`group flex items-start gap-3 rounded-md bg-black/30 px-3 py-[9px] ${border} transition-colors animate-[fadeIn_0.35s_ease]`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[12px] font-medium text-white/85 leading-snug truncate" title={full}>{line}</p>
                  </div>
                  <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">{n.time}</span>
                </li>
              )
            })}
          </ul>
        </div>
        {/* Fallback fade overlay for browsers without mask support */}
        <div style={{position:'absolute',left:0,right:0,bottom:0,height:36,pointerEvents:'none',background:'linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,0.85) 90%)'}} />
      </div>
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
  // --- Notification state ---
  const PIN_SECONDS = 10
  const [pinnedCritical, setPinnedCritical] = useState<UINote[]>([])
  const [regularFeed, setRegularFeed] = useState<UINote[]>([])
  const seen = useRef<Set<number>>(new Set())
  // Ticker state
  const [tickerPaused, setTickerPaused] = useState(false)
  const tickerOffset = useRef(0)
  const tickerRaf = useRef<number>()
  const tickerListRef = useRef<HTMLUListElement>(null)
  const tickerTrackRef = useRef<HTMLDivElement>(null)
  // Ingest logic
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
    if (seen.current.has(e.id)) return
    seen.current.add(e.id)
    if (category==='critical') {
      setPinnedCritical(prev => [
        { id:e.id, title: title.slice(0,90), detail: detail.slice(0,140), severity, category, time:'now', count:1, pinUntil: Date.now() + PIN_SECONDS*1000 },
        ...prev.filter(n=>n.id!==e.id)
      ])
    } else {
      setRegularFeed(prev => {
        // Group by title+detail+category signature
        const keyIdx = prev.findIndex(n => n.category===category && n.title===title && n.detail===detail)
        if (keyIdx !== -1) {
          const copy=[...prev]
          const ex=copy[keyIdx]
          copy[keyIdx] = { ...ex, time:'now', count:(ex.count||1)+1 }
          return copy
        }
        return [ { id:e.id, title: title.slice(0,90), detail: detail.slice(0,140), severity, category, time:'now', count:1 }, ...prev.slice(0,99) ]
      })
    }
  },[])
  // Pin expiry GC
  useEffect(()=>{
    const interval = setInterval(()=>{
      setPinnedCritical(prev => {
        const now = Date.now()
        const keep:UINote[] = []
        const expired:UINote[] = []
        for (const ev of prev) {
          if (ev.pinUntil && now <= ev.pinUntil) keep.push(ev)
          else expired.push({...ev, pinUntil: undefined})
        }
        if (expired.length) setRegularFeed(rf => [...expired, ...rf])
        return keep
      })
    }, 1000)
    return ()=>clearInterval(interval)
  },[])
  // Manual dismiss
  const handleDismiss = (id:number) => {
    setPinnedCritical(prev => {
      const idx = prev.findIndex(n=>n.id===id)
      if (idx===-1) return prev
      const [removed] = prev.splice(idx,1)
      setRegularFeed(rf => [{...removed, pinUntil:undefined}, ...rf])
      return [...prev]
    })
  }
  // --- Ticker logic ---
  useEffect(()=>{
    let raf:number; let last=performance.now()
    function step(now:number){
      if (tickerPaused) { raf=requestAnimationFrame(step); return }
      const dt = (now-last)/1000; last=now
      const SPEED = 28 // px/sec
      tickerOffset.current += SPEED*dt
      const list = tickerListRef.current
      const track = tickerTrackRef.current
      if (list && track) {
        const rowH = list.firstElementChild?.clientHeight||0
        if (rowH && tickerOffset.current >= rowH) {
          tickerOffset.current -= rowH
          setRegularFeed(prev => {
            if (prev.length<2) return prev
            const first = prev[0];
            return [...prev.slice(1), first]
          })
        }
        track.style.transform = `translateY(${-tickerOffset.current}px)`
      }
      raf=requestAnimationFrame(step)
    }
    raf=requestAnimationFrame(step)
    return ()=>cancelAnimationFrame(raf)
  },[tickerPaused])
  // Pause on hover or tab hidden
  useEffect(()=>{
    function onVis(){ setTickerPaused(document.hidden) }
    document.addEventListener('visibilitychange', onVis)
    return ()=>document.removeEventListener('visibilitychange', onVis)
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
              <NotificationsPanel
                pinnedCritical={pinnedCritical}
                regularFeed={regularFeed}
                onDismiss={handleDismiss}
                tickerPaused={tickerPaused}
                onMouseEnter={()=>setTickerPaused(true)}
                onMouseLeave={()=>setTickerPaused(false)}
              />
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
          {/* Community Feedback Row */}
          <CommunityFeedbackRow
            initial={[
              {"id":"fb-001","bold":"รถบรรทุกจอดคาปากแยก","text":" นานเกินไป ทำให้ช่องทาง Analytics ติดขัดหนัก ช่วยจัดการที","user":"anonymous-user1","dept":"Analytics","ts":1735039200000,"severity":"critical"},
              {"id":"fb-002","bold":"คาร์บอนของฝ่าย Compliance พุ่งขึ้นอย่างผิดปกติ","text":" เมื่อเทียบกับเมื่อวาน เกิดอะไรขึ้นครับ","user":"anonymous-user2","dept":"Compliance","ts":1735039260000},
              {"id":"fb-003","bold":"มีรถบรรทุกจอดซ้อนเลน","text":" หน้าฝ่าย Operations ทำให้รถสวนกันไม่ได้","user":"anonymous-user3","dept":"Operations","ts":1735039320000},
              {"id":"fb-004","bold":"การปล่อย CO₂ ฝ่าย Supply Chain เพิ่มขึ้น 35%","text":" ภายใน 1 ชั่วโมงที่ผ่านมา ตรวจสอบด่วน","user":"anonymous-user4","dept":"Supply Chain","ts":1735039380000,"severity":"warning"},
              {"id":"fb-005","bold":"รถส่งของขวางช่องทาง Customer Service","text":" ติดยาวหลายบล็อกแล้ว","user":"anonymous-user5","dept":"Customer Service","ts":1735039440000},
              {"id":"fb-006","bold":"ค่าคาร์บอนของ R&D กระโดดขึ้นทันที","text":" หลังรอบเปลี่ยนกะ มีการทดสอบเครื่องจักรหรือไม่","user":"anonymous-user6","dept":"R&D","ts":1735039500000},
              {"id":"fb-007","bold":"รถบรรทุกจอดกินเลน","text":" แถว Finance ทำให้รถเลี้ยวไม่ได้","user":"anonymous-user7","dept":"Finance","ts":1735039560000},
              {"id":"fb-008","bold":"ค่าการปล่อยของฝ่าย IT สูงผิดปกติ","text":" ตั้งแต่ช่วงเช้า ใครเปิดเครื่องเยอะไปหรือเปล่า","user":"anonymous-user8","dept":"IT","ts":1735039620000},
              {"id":"fb-009","bold":"รถยกขึ้นของหลุด","text":" ทำให้ทางเข้า Procurement ตัน ช่วยเคลียร์ด่วน","user":"anonymous-user9","dept":"Procurement","ts":1735039680000,"severity":"critical"},
              {"id":"fb-010","bold":"การปล่อย CO₂ ฝ่าย Legal เพิ่มแบบพรวดพราด","text":" เกิดจากระบบระบายอากาศเสียหรือไม่","user":"anonymous-user10","dept":"Legal","ts":1735039740000},
              {"id":"fb-011","bold":"รถบรรทุกจอดรอเอกสาร","text":" ขวางหน้าฝ่าย Security เป็นชั่วโมงแล้ว","user":"anonymous-user11","dept":"Security","ts":1735039800000},
              {"id":"fb-012","bold":"ฝั่ง Training ควันดำขึ้นชัดเจน","text":" ควรตรวจเครื่องปั่นไฟด่วน","user":"anonymous-user12","dept":"Training","ts":1735039860000,"severity":"warning"}
            ]}
          />
        </DashboardShell>
      </section>
    </Layout>
  )
}
