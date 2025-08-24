import React, { useCallback, useEffect, useRef, useState } from 'react'

// ---------- Types ----------
export type Feedback = {
  id: string
  bold: string
  text: string
  user: string
  dept: string
  ts: number
  severity?: 'normal' | 'warning' | 'critical'
}

interface Props {
  initial?: Feedback[]
  width?: number
  height?: number
  gap?: number
  cardW?: number
  cardH?: number
  maxItems?: number
  animationMs?: number
  embedded?: boolean
}

// ---------- Dummy seed ----------
const DEFAULT_SEED: Feedback[] = [
  {
    id: 's1',
    bold: 'โรงงานควันดำ ',
    text: 'ปล่อยกลิ่นแรงมากช่วงเช้า รบกวนตรวจสอบ',
    user: 'Ananda',
    dept: 'Resident',
    ts: Date.now(),
    severity: 'warning'
  },
  {
    id: 's2',
    bold: 'เสียงดัง ',
    text: 'ช่วงกลางคืนรบกวนพักผ่อน',
    user: 'Bow',
    dept: 'Resident',
    ts: Date.now() - 1000 * 60 * 3
  }
]

// Relative time label (placeholder)
function timeLabel(_ts: number) { return 'ตอนนี้' }

// ---------- Component ----------
export default function CommunityFeedbackRow({
  initial = DEFAULT_SEED,
  width = 1360,
  height = 280,
  gap = 20,
  cardW = 340,
  cardH = 260,
  maxItems = 200,
  animationMs = 260,
  embedded = false
}: Props) {
  const [items, setItems] = useState<Feedback[]>(() => [...initial])
  const [pendingCount, setPendingCount] = useState(0)

  // Refs
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const queueRef = useRef<Feedback[]>([])
  const animatingRef = useRef(false)
  const draggingRef = useRef(false)
  const overshootRef = useRef(0)
  const startXRef = useRef(0)
  const startSLRef = useRef(0)

  const RESIST = 0.35

  // ---------- Wheel vertical -> horizontal ----------
  const horizontalize = useCallback((e: React.WheelEvent) => {
    const vp = viewportRef.current; if (!vp) return
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      vp.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }, [])

  // Clamp negative scroll (elastic done via transform)
  const onScrollClamp = () => {
    const vp = viewportRef.current; if (!vp) return
    if (vp.scrollLeft < 0) vp.scrollLeft = 0
  }

  // ---------- Drag for left-edge rubber band ----------
  const onDragStart = (e: React.PointerEvent) => {
    const vp = viewportRef.current; const tr = trackRef.current; if (!vp || !tr) return
    draggingRef.current = true
    startXRef.current = e.clientX
    startSLRef.current = vp.scrollLeft
    overshootRef.current = 0
    tr.style.transition = 'none'
    vp.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const vp = viewportRef.current; const tr = trackRef.current; if (!vp || !tr) return
    const dx = startXRef.current - e.clientX
    const target = startSLRef.current + dx
    if (target <= 0) {
      vp.scrollLeft = 0
      overshootRef.current = -target
      tr.style.transform = `translateX(${overshootRef.current * RESIST}px)`
    } else {
      overshootRef.current = 0
      vp.scrollLeft = target
      tr.style.transform = 'translateX(0)'
    }
  }
  const onDragEnd = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const tr = trackRef.current; const vp = viewportRef.current; if (!tr || !vp) return
    vp.releasePointerCapture?.(e.pointerId)
    if (overshootRef.current > 0) {
      tr.style.transition = 'transform 260ms cubic-bezier(.22,.61,.36,1)'
      tr.style.transform = 'translateX(0)'
      overshootRef.current = 0
    }
  }

  // ---------- Queue + FLIP insertion ----------
  const processNext = useCallback(() => {
    const vp = viewportRef.current; const tr = trackRef.current; if (!vp || !tr) return
    if (!queueRef.current.length) { animatingRef.current = false; setPendingCount(0); return }
    if (draggingRef.current || vp.scrollLeft > 4) { // user is browsing
      setPendingCount(queueRef.current.length)
      animatingRef.current = false
      return
    }
    animatingRef.current = true
    const next = queueRef.current.shift()!
    setPendingCount(queueRef.current.length)
    setItems(prev => { const up = [next, ...prev]; return up.slice(0, maxItems) })
    requestAnimationFrame(() => {
      const firstW = (tr.firstElementChild as HTMLElement)?.offsetWidth || cardW
      const full = firstW + gap
      tr.style.transition = 'none'
      tr.style.transform = `translateX(${-full}px)`
      tr.getBoundingClientRect() // force reflow
      requestAnimationFrame(() => {
        tr.style.transition = `transform ${animationMs}ms cubic-bezier(.22,.61,.36,1)`
        tr.style.transform = 'translateX(0)'
        const done = (ev: TransitionEvent) => {
          if (ev.propertyName === 'transform') {
            tr.removeEventListener('transitionend', done)
            animatingRef.current = false
            processNext()
          }
        }
        tr.addEventListener('transitionend', done)
      })
    })
  }, [gap, cardW, maxItems, animationMs])

  const ingest = useCallback((fb: Feedback) => {
    queueRef.current.push(fb)
    setPendingCount(queueRef.current.length)
    if (!animatingRef.current) processNext()
  }, [processNext])

  // Public custom event API
  useEffect(() => {
    function h(ev: CustomEvent<Feedback>) { ingest(ev.detail) }
    window.addEventListener('feedback:new', h as EventListener)
    return () => window.removeEventListener('feedback:new', h as EventListener)
  }, [ingest])

  // Flush queue when user returns to left edge
  useEffect(() => {
    function onScroll() {
      const vp = viewportRef.current; if (!vp) return
      if (vp.scrollLeft <= 2 && !animatingRef.current) processNext()
    }
    const el = viewportRef.current
    if (el) el.addEventListener('scroll', onScroll, { passive: true })
    return () => { if (el) el.removeEventListener('scroll', onScroll) }
  }, [processNext])

  const handleShowNew = () => {
    const vp = viewportRef.current; if (!vp) return
    vp.scrollTo({ left: 0, behavior: 'smooth' })
    const check = () => { if (vp.scrollLeft <= 2) { processNext() } else requestAnimationFrame(check) }
    check()
  }

  // ---------- Card renderer ----------
  const renderCard = (f: Feedback) => {
    const sevBorder = f.severity === 'critical'
      ? 'border-red-500/50'
      : f.severity === 'warning'
        ? 'border-yellow-500/30'
        : 'border-neutral-800'
    return (
      <div
        key={f.id}
        className={`fb-card relative shrink-0 rounded-2xl bg-neutral-900/60 ${sevBorder} border p-5`}
        style={{ width: cardW, height: cardH, fontSize: 12, lineHeight: '17px' }}
        aria-label={`feedback ${f.id}`}
      >
        <p className="text-white/80 whitespace-pre-wrap break-words">
          <strong className="font-semibold text-white">{f.bold}</strong>{f.text}
        </p>
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

  // ---------- Render ----------
  return (
    <div className={embedded ? 'relative w-full' : 'mx-auto mt-12'} style={embedded ? undefined : { maxWidth: width, width: '100%' }}>
      {!embedded && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[15px] font-semibold tracking-tight">Community Feedback</h3>
          <div className="text-[11px] text-white/50">Realtime complaints (Thai)</div>
        </div>
      )}
      <div
        ref={viewportRef}
        className="fb-viewport relative overflow-x-auto overflow-y-hidden"
        style={{
          width: '100%',
          height,
          WebkitMaskImage: 'linear-gradient(90deg,#0000 0,#000 40px,#000 calc(100% - 40px),#0000 100%)',
          maskImage: 'linear-gradient(90deg,#0000 0,#000 40px,#000 calc(100% - 40px),#0000 100%)',
          overscrollBehaviorX: 'contain'
        }}
        aria-live="polite"
        onWheel={horizontalize}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onScroll={onScrollClamp}
      >
        <div ref={trackRef} className="fb-track flex will-change-transform" style={{ gap }}>
          {items.map(renderCard)}
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleShowNew}
            className="absolute top-2 left-3 z-10 text-[11px] bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
          >
            +{pendingCount} new
          </button>
        )}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[70px]" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0))' }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[70px]" style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.9), rgba(0,0,0,0))' }} />
      </div>
    </div>
  )
}
