import React, { useEffect, useRef, useState, useCallback } from 'react'

export type Feedback = {
  id: string
  bold: string
  text: string
  user: string
  dept: string
  ts: number
  severity?: 'normal' | 'warning' | 'critical'
}

interface CommunityFeedbackRowProps {
  initial?: Feedback[]
  width?: number
  height?: number
  speedPxPerSec?: number
  gap?: number
  cardW?: number
  cardH?: number
  maxItems?: number
}

// Utility format time relative (simple Thai stub)
function timeLabel(ts:number){
  return 'ตอนนี้' // placeholder for real relative formatting
}

const DEFAULT_SEED: Feedback[] = []

export default function CommunityFeedbackRow({
  initial = DEFAULT_SEED,
  width = 1360,
  height = 280,
  speedPxPerSec = 28,
  gap = 20,
  cardW = 340,
  cardH = 260,
  maxItems = 200,
}: CommunityFeedbackRowProps){
  const [items, setItems] = useState<Feedback[]>(() => [...initial])
  const [paused,setPaused] = useState(false)
  const [lastInteract,setLastInteract] = useState<number>(0)
  const shiftRef = useRef(0) // positive shift pushes cards visually to the right
  const trackRef = useRef<HTMLDivElement|null>(null)
  const rafRef = useRef<number>()
  const fadeOutIdRef = useRef<string | null>(null)
  const idleResumeMs = 3000

  // Auto resume after idle
  useEffect(()=>{
    if (!paused) return
    const t = setTimeout(()=>{
      if (Date.now() - lastInteract >= idleResumeMs) setPaused(false)
    }, idleResumeMs+50)
    return ()=> clearTimeout(t)
  },[paused,lastInteract])

  // Autoplay frame loop
  useEffect(()=>{
    let last = performance.now()
    function frame(now:number){
      const dt = (now - last)/1000; last = now
      if (!paused && items.length){
        shiftRef.current += speedPxPerSec * dt
        const w = cardW + gap
        if (shiftRef.current >= w){
          // mark the rightmost card for fade OUT just before cycling? Actually we cycle the last card -> front
          shiftRef.current -= w
          setItems(prev => {
            if (prev.length<2) return prev
            const lastItem = prev[prev.length-1]
            const rest = prev.slice(0, prev.length-1)
            return [lastItem, ...rest]
          })
        }
        if (trackRef.current){
          trackRef.current.style.transform = `translateX(${shiftRef.current}px)`
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return ()=> { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  },[paused, items.length, speedPxPerSec, gap, cardW])

  // Manual wheel scroll (horizontal) & pause
  const viewportRef = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    function onWheel(e:WheelEvent){
      if (!viewportRef.current) return
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)){
        // horizontal intent
        shiftRef.current += e.deltaX * 0.6
      } else if (e.deltaY){
        shiftRef.current += e.deltaY * 0.6
      } else return
      if (trackRef.current) trackRef.current.style.transform = `translateX(${shiftRef.current}px)`
      setPaused(true); setLastInteract(Date.now())
      e.preventDefault()
    }
    const el = viewportRef.current
    if (el) el.addEventListener('wheel', onWheel, { passive:false })
    return ()=> { if (el) el.removeEventListener('wheel', onWheel) }
  },[])

  // Pointer drag
  useEffect(()=>{
    let dragging = false; let startX = 0; let startShift = 0
    function down(e:PointerEvent){ dragging=true; startX=e.clientX; startShift=shiftRef.current; setPaused(true); setLastInteract(Date.now()) }
    function move(e:PointerEvent){ if(!dragging) return; const dx = e.clientX - startX; shiftRef.current = startShift + dx; if(trackRef.current) trackRef.current.style.transform = `translateX(${shiftRef.current}px)` }
    function up(){ if(dragging){ dragging=false; setLastInteract(Date.now()) } }
    const el = viewportRef.current
    if (el){ el.addEventListener('pointerdown',down); window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); }
    return ()=>{ if (el){ el.removeEventListener('pointerdown',down) }; window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up) }
  },[])

  // Public ingest function (placeholder hook usage) could be exposed via ref later
  const ingest = useCallback((fb:Feedback)=>{
    setItems(prev => {
      const next = [fb, ...prev]
      if (next.length > maxItems) next.pop()
      return next
    })
    setPaused(true); setLastInteract(Date.now())
  },[maxItems])

  // Card component
  const card = (f:Feedback, idx:number) => {
    const sevBorder = f.severity==='critical' ? 'border-red-500/50' : f.severity==='warning' ? 'border-yellow-500/30' : 'border-neutral-800'
    return (
      <div key={f.id} className={`fb-card relative shrink-0 rounded-2xl bg-neutral-900/60 ${sevBorder} border p-5`} style={{ width:cardW, height:cardH, fontSize:12, lineHeight:'17px'}} aria-label={`feedback ${f.id}`}>        
        <p className="text-white/80 whitespace-pre-wrap break-words"><strong className="font-semibold text-white">{f.bold}</strong>{f.text}</p>
        <div className="absolute bottom-5 left-5 flex items-center gap-3">
          <div className="w-[35px] h-[35px] rounded-full bg-neutral-700 flex items-center justify-center text-[11px] text-white/60 select-none">👤</div>
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="text-white/85">{f.user}</span>
            <span className="text-white/40">{f.dept} • {timeLabel(f.ts)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-12" style={{ maxWidth:width, width:'100%' }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[15px] font-semibold tracking-tight">Community Feedback</h3>
        <div className="text-[11px] text-white/50">Realtime complaints (Thai)</div>
      </div>
      <div ref={viewportRef} className="fb-viewport relative" style={{ width:'100%', height, overflow:'hidden', position:'relative', WebkitMaskImage:'linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,1) 40px, rgba(0,0,0,1) calc(100% - 40px), rgba(0,0,0,0) 100%)', maskImage:'linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,1) 40px, rgba(0,0,0,1) calc(100% - 40px), rgba(0,0,0,0) 100%)' }} aria-live="polite">
        <div ref={trackRef} className="flex" style={{ gap, transform:`translateX(${shiftRef.current}px)` }}>
          {items.map(card)}
        </div>
        {/* Fallback edge gradients for non-mask browsers */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[70px]" style={{background:'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0))'}} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[70px]" style={{background:'linear-gradient(270deg, rgba(0,0,0,0.9), rgba(0,0,0,0))'}} />
      </div>
    </div>
  )
}
