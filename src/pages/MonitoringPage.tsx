import Layout from '../ui/Layout'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import AdaptiveNetworkSim, { NotificationEvent } from '../monitoring/AdaptiveNetworkSim'
import CommunityFeedbackRow from '../components/CommunityFeedbackRow'

// relative time helper
function timeAgo(ts:number){
  const diff = Date.now()-ts; if (diff<60000) return 'now';
  const m = Math.floor(diff/60000); if (m<60) return m+'m';
  const h = Math.floor(m/60); return h+'h';
}

// New grouped alert model
type Alert = {
  id: string;
  ts: number; // epoch ms
  title: string; // card text
  severity: 'critical'|'warning'|'info';
  category: string; // grouping key
}

type Group = {
  key: string;
  items: Alert[]; // newest first
  lastTs: number;
  highest: Alert['severity'];
  expanded: boolean;
  pinUntil?: number;
  ephemeral?: Alert | null; // currently showing as a single card (pre-stack)
  ephemeralUntil?: number;
  showJustNowBadgeUntil?: number;
  originalIndex?: number; // preserves slot during ephemeral
}

interface NotificationsPanelProps {
  groups: Group[]; // already ordered
  onToggle: (key:string)=>void;
  onDismissPin: (key:string)=>void;
  scrolling: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  virtualization?: { start:number; end:number } | null;
}

const DISPLAY_MS = 1200;
const JUST_NOW_MS = 3000;

function severityBorder(g:Group){
  if (g.highest==='critical') return 'border-red-500/70 shadow-[0_0_6px_1px_rgba(239,68,68,0.45)] border-2';
  if (g.highest==='warning') return 'border-yellow-400/40 border';
  return 'border-white/10 border';
}

const cardAnimClass = 'transition-[opacity,transform] duration-200 ease-out';

function NotificationsPanel({ groups, onToggle, onDismissPin, scrolling, viewportRef, virtualization }:NotificationsPanelProps){
  const slice = virtualization ? groups.slice(virtualization.start, virtualization.end) : groups;
  return (
    <section className="rounded-3xl border border-neutral-800/60 bg-neutral-950/60 p-6 w-full flex flex-col h-full relative overflow-hidden">
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight mb-1">Recent Notifications</h2>
        <p className="text-[12px] text-white/55 leading-snug">Critical events are pinned. Related alerts auto-stack. Scroll to see history.</p>
      </header>
      <div ref={viewportRef} className="notif-viewport flex-1 min-h-0" aria-live="polite" style={{scrollbarWidth:'thin'}}>
        <ul className="space-y-2 pb-2">
          {slice.map(g => {
            const border = severityBorder(g)
            const isPinned = g.highest==='critical' && g.pinUntil && Date.now() <= g.pinUntil
            const showEphemeral = !!g.ephemeral && Date.now() <= (g.ephemeralUntil||0)
            // Collapsed row (stack)
            if (!g.expanded && !showEphemeral) {
              const count = g.items.length>9 ? '9+' : g.items.length
              const latest = g.items[0]
              const showJustNow = g.showJustNowBadgeUntil && Date.now() <= g.showJustNowBadgeUntil
              return (
                <li key={g.key} className={`group rounded-md bg-black/30 px-3 py-[10px] flex items-center gap-3 ${border} ${cardAnimClass}`}>
                  <button onClick={()=>onToggle(g.key)} className="text-left flex-1 min-w-0 focus:outline-none">
                    <p className="text-[11px] text-white/60 font-medium truncate mb-[2px]">{g.key}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/85 truncate" title={latest.title}>{latest.title}</span>
                      <span className="text-[10px] text-white/40 whitespace-nowrap">{count}</span>
                      {showJustNow && <span className="text-[10px] text-emerald-300/80">+1 just now</span>}
                    </div>
                  </button>
                  {isPinned && <button onClick={()=>onDismissPin(g.key)} title="Unpin" className="text-[11px] text-white/50 hover:text-white/80 px-1">×</button>}
                </li>
              )
            }
            // Ephemeral single-card
            if (showEphemeral && g.ephemeral) {
              return (
                <li key={g.key+':ephemeral'} className={`group flex items-start gap-3 rounded-md bg-black/30 px-3 py-[9px] ${border} ${cardAnimClass}`} style={{opacity:0, transform:'translateY(8px)'}} data-animate>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[12px] font-medium text-white/85 leading-snug truncate" title={g.ephemeral.title}>{g.ephemeral.title}</p>
                  </div>
                  <span className="text-[10px] text-white/35 ml-2 whitespace-nowrap mt-0.5">now</span>
                </li>
              )
            }
            // Expanded view
            return (
              <li key={g.key} className={`rounded-md bg-black/20 ${cardAnimClass} overflow-hidden`}>
                <div className={`flex items-center px-3 py-[8px] cursor-pointer ${severityBorder(g)} bg-black/30`} onClick={()=>onToggle(g.key)}>
                  <p className="text-[12px] font-semibold text-white/85 flex-1 truncate" title={g.key}>{g.key}</p>
                  <span className="text-[10px] text-white/40 mr-2">{g.items.length}</span>
                  {g.highest==='critical' && g.pinUntil && Date.now()<=g.pinUntil && <span className="text-[10px] text-red-300/80 mr-2">PIN</span>}
                  <span className="text-[11px] text-white/50">{g.expanded? '−':'+'}</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {g.items.map(a => (
                    <li key={a.id} className="px-3 py-2 bg-black/20">
                      <p className="text-[12px] text-white/85 leading-snug" title={a.title}>{a.title}</p>
                      <span className="text-[10px] text-white/30">{timeAgo(a.ts)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
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
  // --- Grouped notifications state ---
  const PIN_SECONDS = 10;
  const groupsRef = useRef<Map<string,Group>>(new Map());
  const [ordered, setOrdered] = useState<Group[]>([]); // render order
  const [version, setVersion] = useState(0); // trigger renders when map mutates
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const scrollIdleTimer = useRef<number>();
  const pendingReorder = useRef(false);

  const recomputeOrder = useCallback(()=>{
    const list:Group[] = Array.from(groupsRef.current.values());
    const now = Date.now();
    const pinned = list.filter(g => g.highest==='critical' && g.pinUntil && now <= g.pinUntil);
    const others = list.filter(g => !(g.highest==='critical' && g.pinUntil && now <= g.pinUntil));
    pinned.sort((a,b)=> b.lastTs - a.lastTs);
    others.sort((a,b)=> b.lastTs - a.lastTs);
    setOrdered([...pinned, ...others]);
  },[]);

  const scheduleReorder = useCallback(()=>{
    if (scrolling) { pendingReorder.current = true; return }
    recomputeOrder();
  },[recomputeOrder, scrolling]);

  const markDirty = () => setVersion(v=>v+1);

  const toggleGroup = (key:string) => {
    const g = groupsRef.current.get(key); if (!g) return;
    g.expanded = !g.expanded;
    // cancel ephemeral if expanding
    if (g.expanded && g.ephemeral) { g.items.unshift(g.ephemeral); g.ephemeral = null; g.ephemeralUntil=undefined; }
    markDirty();
    scheduleReorder();
  };

  const dismissPin = (key:string) => {
    const g = groupsRef.current.get(key); if (!g) return;
    g.pinUntil = Date.now()-1;
    markDirty();
    scheduleReorder();
  };

  function classify(raw:string): { severity:Alert['severity']; category:string; title:string } {
    const title = raw.trim();
    let severity:Alert['severity'] = /critical|failure|gridlock|spike|blockage/i.test(raw)? 'critical' : /heavy|congestion|warning|delay/i.test(raw)? 'warning':'info';
    // naive category extraction
    const departments = ['Compliance','Logistics','Operations','Supply Chain','Customer Service','Finance','IT','Procurement','Legal','Security','Training','R&D','Analytics'];
    let category = departments.find(d => new RegExp(d,'i').test(raw)) || (severity==='critical' ? 'Critical' : 'General');
    return { severity, category, title };
  }

  const addAlert = useCallback((alert:Alert)=>{
    const map = groupsRef.current;
    let g = map.get(alert.category);
    const now = Date.now();
    if (!g) {
      g = { key: alert.category, items:[alert], lastTs: alert.ts, highest: alert.severity, expanded:false, pinUntil: alert.severity==='critical'? now + PIN_SECONDS*1000 : undefined, ephemeral:null };
      map.set(alert.category, g);
      markDirty();
      scheduleReorder();
      return;
    }
    // update highest severity
    if (alert.severity==='critical') {
      g.highest='critical'; g.pinUntil = now + PIN_SECONDS*1000;
    } else if (alert.severity==='warning' && g.highest==='info') g.highest='warning';
    g.lastTs = alert.ts;
    if (g.expanded) {
      g.items.unshift(alert);
      g.showJustNowBadgeUntil = now + JUST_NOW_MS; // show badge on header when expanded collapses? kept simple
    } else {
      // start ephemeral display
      g.ephemeral = alert;
      g.ephemeralUntil = now + DISPLAY_MS;
      g.showJustNowBadgeUntil = now + JUST_NOW_MS; // will show after collapse
      // don't push into items until collapse
    }
    markDirty();
    scheduleReorder();
  },[scheduleReorder]);

  // Simulation ingest -> convert NotificationEvent
  const pushNotification = useCallback((e:NotificationEvent)=>{
    const raw = e.message.replace(/^([\u{1F534}🔴⚠️🟢])\s*/u,'').trim();
    const { severity, category, title } = classify(raw);
    addAlert({ id: String(e.id), ts: Date.now(), title, severity, category });
  },[addAlert]);

  // Ephemeral collapse + badge expiry loop
  useEffect(()=>{
    const t = setInterval(()=>{
      let changed = false; const now=Date.now();
      groupsRef.current.forEach(g => {
        if (g.ephemeral && g.ephemeralUntil && now > g.ephemeralUntil) {
          // collapse
          g.items.unshift(g.ephemeral); g.ephemeral=null; g.ephemeralUntil=undefined; changed=true; scheduleReorder();
        }
        if (g.showJustNowBadgeUntil && now > g.showJustNowBadgeUntil) { g.showJustNowBadgeUntil=undefined; changed=true; }
      });
      if (changed) markDirty();
    }, 200);
    return ()=>clearInterval(t);
  },[scheduleReorder]);

  // Scroll handling (pause reorder while user scrolls)
  useEffect(()=>{
    const el = scrollContainerRef.current; if (!el) return;
    function onScroll(){
      setScrolling(true);
      if (scrollIdleTimer.current) window.clearTimeout(scrollIdleTimer.current);
      scrollIdleTimer.current = window.setTimeout(()=>{
        setScrolling(false);
        if (pendingReorder.current) { pendingReorder.current=false; recomputeOrder(); }
      }, 1000);
    }
    el.addEventListener('scroll', onScroll, { passive:true });
    return ()=> el.removeEventListener('scroll', onScroll);
  },[recomputeOrder]);

  // Initial order compute effect (in case of seeds later)
  useEffect(()=>{ recomputeOrder(); },[version, recomputeOrder]);

  // Simple mount animation for ephemeral cards
  useEffect(()=>{
    const el = scrollContainerRef.current; if (!el) return;
    const nodes = el.querySelectorAll('li[data-animate]');
    nodes.forEach(n => {
      requestAnimationFrame(()=>{
        (n as HTMLElement).style.opacity='1';
        (n as HTMLElement).style.transform='translateY(0)';
      });
    });
  });

  // Virtualization (basic) if more than 50 groups
  const virtualization = (()=>{
    const total = ordered.length; if (total <= 50) return null;
    const estRow = 56; // approx collapsed height
    const el = scrollContainerRef.current; if (!el) return null;
    const scrollTop = el.scrollTop; const h = el.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop/estRow)-5);
    const end = Math.min(total, Math.ceil((scrollTop+h)/estRow)+5);
    return { start, end };
  })();

  // Provide some seed alerts for initial visual (optional) - we keep prior seed minimal
  useEffect(()=>{
    if (ordered.length===0) {
      addAlert({ id:'seed-1', ts:Date.now(), title:'Signal Phase Shift Applied', severity:'info', category:'Operations' });
    }
  },[ordered.length, addAlert]);

  // No external dismiss of individual alerts now; pin dismissal handled on group
  const handleDismiss = (id:number)=>{} // placeholder to satisfy legacy references removed
  return (
    <Layout>
      {/* Secondary product navigation */}
      <ProductTabs />
      <section className="relative min-h-[70vh] bg-transparent px-6 pt-8" aria-labelledby="monitoring-heading">
        <DashboardShell>
          <style>{`.notif-viewport{overflow-y:auto;overscroll-behavior:contain;position:relative;-webkit-mask-image:linear-gradient(#0000 0,#000 20px,#000 calc(100% - 20px),#0000 100%);mask-image:linear-gradient(#0000 0,#000 20px,#000 calc(100% - 20px),#0000 100%);} .fb-viewport::-webkit-scrollbar{display:none;} .fb-viewport{scrollbar-width:none;}`}</style>
          <header className="mb-8">
            <h1 id="monitoring-heading" className="text-3xl font-semibold tracking-tight mb-3">Carbon Monitoring</h1>
            <p className="text-white/70 max-w-2xl text-sm leading-relaxed">Real‑time urban flow model: signal phases, vehicles & pedestrian activity visualization.</p>
          </header>
          <div className="cm-grid-stack grid gap-[60px]" style={{ gridTemplateColumns: '360px 1fr' }}>
            <div className="flex flex-col" style={{ width:360 }}>
              <NotificationsPanel
                  groups={ordered}
                  onToggle={toggleGroup}
                  onDismissPin={dismissPin}
                  scrolling={scrolling}
                  viewportRef={scrollContainerRef}
                  virtualization={virtualization}
              />
              <div className="h-[100px]" />
              <section className="rounded-3xl border border-neutral-800/60 bg-neutral-950/60 p-6 w-full relative overflow-hidden">
                <header className="mb-4">
                  <h2 className="text-[15px] font-semibold tracking-tight mb-1">Community Feedback</h2>
                  <p className="text-[12px] text-white/55 leading-snug">Realtime complaints (Thai) from departments.</p>
                </header>
                <div className="relative">
                  <CommunityFeedbackRow embedded initial={[
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
                  ]} />
                </div>
              </section>
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
          {/* Community Feedback moved inside notifications panel */}
        </DashboardShell>
      </section>
    </Layout>
  )
}
