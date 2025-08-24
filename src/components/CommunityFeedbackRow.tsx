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
  gap?: number
  cardW?: number
  cardH?: number
  maxItems?: number
  animationMs?: number
  embedded?: boolean // when true, omit header & outer margins
}

// Utility format time relative (simple Thai stub)
function timeLabel(ts:number){
  return 'ตอนนี้' // placeholder for real relative formatting
}

const DEFAULT_SEED: Feedback[] = []

export default function CommunityFeedbackRow({
  initial = DEFAULT_SEED,
  gap = 20,
  cardW = 340,
  cardH = 260,
  maxItems = 200,
  animationMs = 260,
  embedded = false,
}: CommunityFeedbackRowProps){
  const [items, setItems] = useState<Feedback[]>(() => [...initial])
  // Queue for incoming items during animation or when user scrolled away
  const queueRef = useRef<Feedback[]>([])
  const isAnimatingRef = useRef(false)
  const viewportRef = useRef<HTMLDivElement|null>(null)
  const trackRef = useRef<HTMLDivElement|null>(null)
  const userAwayRef = useRef(false)
  const [pendingCount,setPendingCount] = useState(0)
  const FULL_W = cardW + gap

  function atLeftEdge(){
    const vp = viewportRef.current
    if (!vp) return true
    return vp.scrollLeft < 6 // near left
  }

  // Observe scroll to set userAway
  useEffect(()=>{
    const el = viewportRef.current
    if (!el) return
    function onScroll(){
      const away = !atLeftEdge()
      userAwayRef.current = away
      if (!away) {
        // If returned to left, process queued
        if (!isAnimatingRef.current) processNext()
      }
    }
    el.addEventListener('scroll', onScroll, { passive:true })
    return ()=> el.removeEventListener('scroll', onScroll)
  },[])

  // FLIP slide-in executor
  const slideIn = (done:()=>void) => {
    const track = trackRef.current
    if (!track) { done(); return }
    // Pre-position
    track.style.transition = 'none'
    track.style.transform = `translateX(-${FULL_W}px)`
    // Force reflow
    track.getBoundingClientRect()
    requestAnimationFrame(()=>{
      track.style.transition = `transform ${animationMs}ms cubic-bezier(.22,.61,.36,1)`
      track.style.transform = 'translateX(0)'
      const handler = (e:TransitionEvent) => {
        if (e.propertyName === 'transform') {
          track.style.transition = 'none'
          track.removeEventListener('transitionend', handler)
          done()
        }
      }
      track.addEventListener('transitionend', handler)
    })
  }

  const processNext = () => {
    if (isAnimatingRef.current) return
    if (userAwayRef.current) { setPendingCount(queueRef.current.length); return }
    const next = queueRef.current.shift()
    setPendingCount(queueRef.current.length)
    if (!next) return
    isAnimatingRef.current = true
    setItems(prev => {
      const updated = [next, ...prev]
      return updated.slice(0, maxItems)
    })
    // Wait a frame so new DOM node present then animate
    requestAnimationFrame(()=>{
      slideIn(()=>{ isAnimatingRef.current = false; processNext() })
    })
  }

  const ingest = useCallback((fb:Feedback)=>{
    queueRef.current.push(fb)
    setPendingCount(queueRef.current.length)
    processNext()
  },[])

  // Expose ingest via custom event (optional future use)
  useEffect(()=>{
    function handler(ev:CustomEvent<Feedback>){ ingest(ev.detail) }
    window.addEventListener('feedback:new', handler as EventListener)
    return ()=> window.removeEventListener('feedback:new', handler as EventListener)
  },[ingest])

  // Pill click to show pending
  const showPending = () => {
    const vp = viewportRef.current
    if (vp) vp.scrollTo({ left:0, behavior:'smooth' })
    // Poll until at left then process
    const check = () => { if (atLeftEdge()) { processNext() } else requestAnimationFrame(check) }
    check()
  }

  // Card component
  const card = (f:Feedback) => {
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
    <div className={`relative w-full ${embedded ? '' : 'mt-12'}`}>
      {!embedded && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[15px] font-semibold tracking-tight">Community Feedback</h3>
          <div className="text-[11px] text-white/50">Realtime complaints (Thai)</div>
        </div>
      )}
      <div ref={viewportRef} className="fb-viewport relative overflow-x-auto overflow-y-hidden snap-x snap-mandatory" style={{WebkitMaskImage:'linear-gradient(90deg, #0000 0, #000 40px, #000 calc(100% - 40px), #0000 100%)', maskImage:'linear-gradient(90deg, #0000 0, #000 40px, #000 calc(100% - 40px), #0000 100%)'}} aria-live="polite">
        <div ref={trackRef} className="flex" style={{ gap }}>
          {items.map(card)}
        </div>
        {pendingCount>0 && userAwayRef.current && (
          <button onClick={showPending} className="absolute top-2 left-3 z-10 text-[11px] bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-400/70">
            +{pendingCount} new
          </button>
        )}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[70px]" style={{background:'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0))'}} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[70px]" style={{background:'linear-gradient(270deg, rgba(0,0,0,0.9), rgba(0,0,0,0))'}} />
      </div>
    </div>
  )
}
