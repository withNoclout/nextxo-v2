import React, { useCallback, useEffect, useRef, useState } from 'react'
import Layout from '../ui/Layout'
import TabsWithDropdown from '@/components/TabsWithDropdown'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'
import CommunityFeedbackRow from '../components/CommunityFeedbackRow'
import { startFeedbackMock } from '../mock/feedbackMock'

// --- Types ---
interface UINote {
  id: number
  title: string
  detail: string
  severity?: 'normal' | 'warn' | 'block' | 'clear'
  category: 'critical' | 'major' | 'routine'
  time: string
  count?: number
  pinUntil?: number
  _entered?: boolean // internal animation flag
}

// --- Notifications Panel (pure presentational + refs passed from parent for ticker) ---
function NotificationsPanel({ pinned, feed, onDismiss, entering }:{
  pinned: UINote[]
  feed: UINote[]
  onDismiss: (id:number)=>void
  entering: Set<number>
}) {
  const renderItem = (n:UINote, critical:boolean) => {
    const enteringCls = entering.has(n.id) ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
    const sevCls = n.category==='critical'
      ? 'border border-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      : n.category==='major'
        ? 'border border-yellow-400/60 bg-yellow-400/5'
        : 'border border-white/10 bg-white/5'
    const titleTxt = n.title
    return (
      <li
        key={n.id}
        className={`rounded-lg px-4 py-3 transition-colors text-[12.5px] will-change-transform transition-[transform,opacity] duration-250 ${sevCls} ${enteringCls}`}
      >
        <div className="flex justify-between items-start gap-2">
          <p className="font-medium text-sm leading-snug text-white/90 truncate" title={titleTxt}>{titleTxt}{n.count && n.count>1 && <span className="ml-1 text-[10px] font-medium text-white/50">×{n.count}</span>}</p>
          <span className="text-[10px] text-white/50 ml-2 shrink-0 mt-0.5">{n.time}</span>
        </div>
        {n.detail && <p className="text-white/70 text-[11px] leading-snug mt-1 line-clamp-3 break-words">{n.detail}</p>}
        {critical && (
          <button
            className="absolute top-1 right-1 text-[13px] text-white/50 hover:text-white/80 px-1 py-0.5 rounded focus:outline-none"
            title="Dismiss"
            onClick={()=>onDismiss(n.id)}
          >&times;</button>
        )}
      </li>
    )
  }
  return (
    <div className="flex flex-col h-full" aria-label="Notifications">
  <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-white/10 rounded-t-2xl">
        <span className="text-xs uppercase tracking-wide text-white/60">Recent Notifications</span>
        <span className="text-xs text-white/40">Newest first</span>
      </div>
      {pinned.length>0 && (
        <ul className="px-3 pb-2 space-y-3" aria-label="Pinned critical">
          {pinned.map(n=> renderItem(n,true))}
        </ul>
      )}
      <ul className="flex-1 overflow-visible px-3 pt-1 pb-3 space-y-3" aria-live="polite" aria-label="Notification feed">
        {feed.map(n=> renderItem(n,false))}
      </ul>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto px-6" style={{ width: '100%', maxWidth: 1350 }}>
      <style>
        {`@keyframes fadeIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }`}
      </style>
      {children}
    </div>
  )
}

export default function MonitoringPage() {
  const PIN_SECONDS = 10
  const [pinned, setPinned] = useState<UINote[]>([])
  const [feed, setFeed] = useState<UINote[]>([])
  const seen = useRef<Set<number>>(new Set())
  const entering = useRef<Set<number>>(new Set())
  const [, forceRender] = useState(0) // to flush entering removal

  // Remove entering flag after first frame for any newly added items
  const scheduleEnterClear = (id:number) => {
    requestAnimationFrame(()=>{
      entering.current.delete(id)
      forceRender(x=>x+1)
    })
  }

  const classify = (raw:string):UINote['category'] => {
    if (/(gridlock|emission spike|node failure|critical delay|blockage|critical congestion|link closed)/i.test(raw)) return 'critical'
    if (/(heavy congestion|peak-hour surge|congestion rising)/i.test(raw)) return 'major'
    return 'routine'
  }

  const pushNotification = useCallback((e:NotificationEvent) => {
    const raw = e.message.replace(/^([\u{1F534}🔴⚠️🟢])\s*/u,'').trim()
    const lower = raw.toLowerCase()
    const [first, ...rest] = raw.split(':')
    const title = (first||'Update').trim()
    const detail = rest.join(':').trim()
    const category = classify(raw)
    const severity: UINote['severity'] = category==='critical' ? 'block' : category==='major' ? 'warn' : 'normal'
    if (/high ev adoption|traffic cleared|temporary relief/i.test(lower)) return
    if (e.type==='clear' && category!=='critical') return
    if (seen.current.has(e.id)) return
    seen.current.add(e.id)
    const base:UINote = { id:e.id, title:title.slice(0,90), detail:detail.slice(0,140), severity, category, time:'now', count:1 }

    if (category==='critical') {
      setPinned(prev => {
        // merge duplicate
        const idx = prev.findIndex(n=>n.title===base.title && n.detail===base.detail && n.category===base.category)
        if (idx>=0) {
          const copy=[...prev]
          copy[idx] = { ...copy[idx], count:(copy[idx].count||1)+1, time:'now', pinUntil: Date.now()+PIN_SECONDS*1000 }
          return copy
        }
        const withPin = { ...base, pinUntil: Date.now()+PIN_SECONDS*1000 }
        entering.current.add(withPin.id); scheduleEnterClear(withPin.id)
        const next = [withPin, ...prev]
        if (next.length<=3) return next
        // overflow to feed
        const overflow = next.slice(3)
        if (overflow.length) {
          setFeed(f => {
            overflow.forEach(o=>{ entering.current.add(o.id); scheduleEnterClear(o.id) })
            return [...overflow, ...f]
          })
        }
        return next.slice(0,3)
      })
    } else {
      setFeed(prev => {
        const idx = prev.findIndex(n=>n.title===base.title && n.detail===base.detail && n.category===base.category)
        if (idx>=0) {
          const copy=[...prev]
          copy[idx] = { ...copy[idx], count:(copy[idx].count||1)+1, time:'now' }
          return copy
        }
        entering.current.add(base.id); scheduleEnterClear(base.id)
        return [base, ...prev]
      })
    }
  }, [PIN_SECONDS])

  // Expire pinned every 1s
  useEffect(()=>{
    const t = setInterval(()=>{
      const now = Date.now()
      setPinned(prev => {
        const keep:UINote[] = []
        const expired:UINote[] = []
        for (const n of prev) {
          if (n.pinUntil && n.pinUntil > now) {
            keep.push(n)
          } else {
            expired.push({ ...n, pinUntil: undefined })
          }
        }
        if (expired.length) {
          setFeed(f => {
            expired.forEach(x=>{ entering.current.add(x.id); scheduleEnterClear(x.id) })
            return [...expired, ...f]
          })
        }
        return keep
      })
    }, 1000)
    return ()=>clearInterval(t)
  },[])

  // Feedback mock
  useEffect(()=>{ const stop = startFeedbackMock(); return stop },[])

  const handleDismiss = (id:number) => {
    setPinned(prev => prev.filter(n=>n.id!==id))
  }

  return (
    <Layout>
      <TabsWithDropdown
        tabs={[
          { id: 'monitoring', label: 'Monitoring' },
          { id: 'optimization', label: 'Optimization' },
          { id: 'reporting', label: 'Reporting' },
        ]}
        initial="monitoring"
        onChange={(id) => { /* TODO: hook into routing or state */ }}
      />
      <section
        className="relative min-h-[70vh] bg-transparent px-6 pt-8"
        aria-labelledby="monitoring-heading"
      >
        <DashboardShell>
          <header className="mb-8">
            <h1
              id="monitoring-heading"
              className="text-3xl font-semibold tracking-tight mb-3"
            >
              Carbon Monitoring
            </h1>
            <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
              Real‑time urban flow model: signal phases, vehicles & pedestrian
              activity visualization.
            </p>
          </header>
          <div className="max-w-[1350px] mx-auto md:flex md:items-start md:gap-[60px]">
            <aside className="basis-[360px] w-[360px] shrink-0 mb-10 md:mb-0">
              <div className="h-[640px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-gutter-stable pr-2">
                  <NotificationsPanel pinned={pinned} feed={feed} onDismiss={handleDismiss} entering={entering.current} />
                </div>
              </div>
            </aside>
            <section className="flex-1 min-w-0">
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold tracking-tight mb-1">Adaptive Network Grid</h2>
                <p className="text-[12px] text-white/60 leading-snug">Real-time routing • congestion-driven re-pathing</p>
              </div>
              <div className="flex-1 min-h-0" style={{height:600}}>
                <AdaptiveNetworkSim desiredHeight={600-60} onNotify={pushNotification} frameless blendBackground className="-m-2 text-[12px]" />
              </div>
            </section>
          </div>
          <CommunityFeedbackRow
            width={1350}
            initial={[
              {
                id: 'fb-001',
                bold: 'รถบรรทุกจอดคาปากแยก',
                text: ' นานเกินไป ทำให้ช่องทาง Analytics ติดขัดหนัก ช่วยจัดการที',
                user: 'anonymous-user1',
                dept: 'Analytics',
                ts: 1735039200000,
                severity: 'critical',
              },
              {
                id: 'fb-002',
                bold: 'คาร์บอนของฝ่าย Compliance พุ่งขึ้นอย่างผิดปกติ',
                text: ' เมื่อเทียบกับเมื่อวาน เกิดอะไรขึ้นครับ',
                user: 'anonymous-user2',
                dept: 'Compliance',
                ts: 1735039260000,
              },
              {
                id: 'fb-003',
                bold: 'มีรถบรรทุกจอดซ้อนเลน',
                text: ' หน้าฝ่าย Operations ทำให้รถสวนกันไม่ได้',
                user: 'anonymous-user3',
                dept: 'Operations',
                ts: 1735039320000,
              },
              {
                id: 'fb-004',
                bold: 'การปล่อย CO₂ ฝ่าย Supply Chain เพิ่มขึ้น 35%',
                text: ' ภายใน 1 ชั่วโมงที่ผ่านมา ตรวจสอบด่วน',
                user: 'anonymous-user4',
                dept: 'Supply Chain',
                ts: 1735039380000,
                severity: 'warning',
              },
              {
                id: 'fb-005',
                bold: 'รถส่งของขวางช่องทาง Customer Service',
                text: ' ติดยาวหลายบล็อกแล้ว',
                user: 'anonymous-user5',
                dept: 'Customer Service',
                ts: 1735039440000,
              },
              {
                id: 'fb-006',
                bold: 'ค่าคาร์บอนของ R&D กระโดดขึ้นทันที',
                text: ' หลังรอบเปลี่ยนกะ มีการทดสอบเครื่องจักรหรือไม่',
                user: 'anonymous-user6',
                dept: 'R&D',
                ts: 1735039500000,
              },
              {
                id: 'fb-007',
                bold: 'รถบรรทุกจอดกินเลน',
                text: ' แถว Finance ทำให้รถเลี้ยวไม่ได้',
                user: 'anonymous-user7',
                dept: 'Finance',
                ts: 1735039560000,
              },
              {
                id: 'fb-008',
                bold: 'ค่าการปล่อยของฝ่าย IT สูงผิดปกติ',
                text: ' ตั้งแต่ช่วงเช้า ใครเปิดเครื่องเยอะไปหรือเปล่า',
                user: 'anonymous-user8',
                dept: 'IT',
                ts: 1735039620000,
              },
              {
                id: 'fb-009',
                bold: 'รถยกขึ้นของหลุด',
                text: ' ทำให้ทางเข้า Procurement ตัน ช่วยเคลียร์ด่วน',
                user: 'anonymous-user9',
                dept: 'Procurement',
                ts: 1735039680000,
                severity: 'critical',
              },
              {
                id: 'fb-010',
                bold: 'การปล่อย CO₂ ฝ่าย Legal เพิ่มแบบพรวดพราด',
                text: ' เกิดจากระบบระบายอากาศเสียหรือไม่',
                user: 'anonymous-user10',
                dept: 'Legal',
                ts: 1735039740000,
              },
              {
                id: 'fb-011',
                bold: 'รถบรรทุกจอดรอเอกสาร',
                text: ' ขวางหน้าฝ่าย Security เป็นชั่วโมงแล้ว',
                user: 'anonymous-user11',
                dept: 'Security',
                ts: 1735039800000,
              },
              {
                id: 'fb-012',
                bold: 'ฝั่ง Training ควันดำขึ้นชัดเจน',
                text: ' ควรตรวจเครื่องปั่นไฟด่วน',
                user: 'anonymous-user12',
                dept: 'Training',
                ts: 1735039860000,
                severity: 'warning',
              },
            ]}
          />
  </DashboardShell>
      </section>
    </Layout>
  )
}

