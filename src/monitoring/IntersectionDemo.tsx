import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// === Config ===
const SIZE = 680; // canvas size (square)
const ROAD_W = 220; // road width in px
const GRID = 24; // grid cell size
const CAR_SIZE = 18; // square car size (px)
const SPAWN_BUFFER = 90; // how far off-canvas cars are born/removed
const STOP_GAP = 10; // offset before the intersection to stop
const GREEN_MS = 8000; // Thailand demo timing
const YELLOW_MS = 3000; // Thailand demo timing
const YEL_PROCEED_PX = CAR_SIZE * 1.2; // ~1 car length threshold to proceed on yellow if approaching
const COLORS = ['#22c55e', '#10b981', '#2dd4bf', '#a3e635', '#67e8f9', '#86efac'];

const DIRS = ['E', 'W', 'N', 'S'] as const
type Dir = typeof DIRS[number]
const TURNS = ['straight', 'left', 'right'] as const
type Turn = typeof TURNS[number]
type Quad = 'NW' | 'NE' | 'SW' | 'SE'

type Path = {
  id: string
  len: number
  stopT: number
  exitT: number
  quads: Quad[]
  eval: (t: number) => { x: number; y: number; angle: number }
}

type Car = {
  id: number
  dir: Dir
  turn: Turn
  t: number
  v: number
  speed: number
  color: string
  bornAt: number
  path: Path
}

let gid = 1

function useTrafficCycle() {
  const [ms, setMs] = useState(0)
  useEffect(() => { const id = setInterval(() => setMs(t => t + 100), 100); return () => clearInterval(id) }, [])
  return computeThaiPhases(ms)
}

function computeThaiPhases(ms: number) {
  type Phase = 'green' | 'yellow' | 'red'
  const G = GREEN_MS, Y = YELLOW_MS, FULL = 2 * (G + Y)
  const t = ((ms % FULL) + FULL) % FULL
  let nsPhase: Phase, ewPhase: Phase
  if (t < G) { nsPhase = 'green'; ewPhase = 'red' } else if (t < G + Y) { nsPhase = 'yellow'; ewPhase = 'red' } else if (t < G + Y + G) { nsPhase = 'red'; ewPhase = 'green' } else { nsPhase = 'red'; ewPhase = 'yellow' }
  return { nsPhase, ewPhase }
}

function proceedOnYellow(distPx: number, wasStopped: boolean) { return distPx <= YEL_PROCEED_PX && !wasStopped }
function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function IntersectionDemo() {
  const [cars, setCars] = useState<Car[]>([])
  const { nsPhase, ewPhase } = useTrafficCycle()

  // spawn cars
  useEffect(() => {
    const iv = setInterval(() => {
      if (cars.length > 28) return
      if (Math.random() < 0.9) {
        const dir: Dir = rand([...DIRS])
        const turn: Turn = chooseTurn()
        const laneSide = Math.random() < 0.5 ? -1 : 1
        const color = rand(COLORS)
        const path = makePath(dir, turn, laneSide)
        const car: Car = { id: gid++, dir, turn, t: 0, v: 0, speed: 120 + Math.random() * 65, color, bornAt: performance.now(), path }
        setCars(c => [...c, car])
      }
    }, 420)
    return () => clearInterval(iv)
  }, [cars.length])

  const loopRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastRef.current ?? ts; lastRef.current = ts; const dt = (ts - last) / 1000
      setCars(prev => advanceCars(prev, dt, nsPhase, ewPhase))
      loopRef.current = requestAnimationFrame(tick)
    }
    loopRef.current = requestAnimationFrame(tick)
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); lastRef.current = null }
  }, [nsPhase, ewPhase])

  const lamps = useMemo(() => ({ base: { housing: '#111827', red: '#ef4444', yellow: '#f59e0b', on: '#22c55e' } }), [])
  const c = SIZE / 2, xL = c - ROAD_W / 2, xR = c + ROAD_W / 2, yT = c - ROAD_W / 2, yB = c + ROAD_W / 2

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <div className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#07090b', backgroundImage: 'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)', backgroundSize: `${GRID}px ${GRID}px` }}>
          {/* roads */}
          <div className="absolute left-0 right-0 bg-slate-900" style={{ top: c - ROAD_W / 2, height: ROAD_W }} />
          <div className="absolute top-0 bottom-0 bg-slate-900" style={{ left: c - ROAD_W / 2, width: ROAD_W }} />
          {/* dashed center lines */}
          <div className="absolute left-0 right-0" style={{ top: c - 2, height: 4, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 10px, transparent 10px 24px)' }} />
          <div className="absolute top-0 bottom-0" style={{ left: c - 2, width: 4, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 10px, transparent 10px 24px)' }} />
          {/* box outline */}
            <div className="absolute border border-emerald-500/20" style={{ left: c - ROAD_W/2, top: c - ROAD_W/2, width: ROAD_W, height: ROAD_W, boxShadow: '0 0 0 1px rgba(16,185,129,0.08) inset' }} />
          {/* stop lines */}
          <div className="absolute h-1 w-16 bg-white/80" style={{ top: c - ROAD_W/2 - 6, left: c - 8 }} />
          <div className="absolute h-1 w-16 bg-white/80" style={{ bottom: c - ROAD_W/2 - 6, left: c - 8 }} />
          <div className="absolute w-1 h-16 bg-white/80" style={{ left: c - ROAD_W/2 - 6, top: c - 8 }} />
          <div className="absolute w-1 h-16 bg-white/80" style={{ right: c - ROAD_W/2 - 6, top: c - 8 }} />
          {/* lights */}
          <LightBox x={c-14} y={yT-70} orient="S" phase={nsPhase} lamps={lamps} />
          <LightBox x={c-14} y={yB+12} orient="N" phase={nsPhase} lamps={lamps} />
          <LightBox x={xR+12} y={c-14} orient="W" phase={ewPhase} lamps={lamps} />
          <LightBox x={xL-70} y={c-14} orient="E" phase={ewPhase} lamps={lamps} />
          {/* cars */}
          {cars.map(car => {
            const { x, y, angle } = car.path.eval(car.t)
            const opacityIn = Math.min(1, (performance.now() - car.bornAt) / 600)
            const nearingEnd = car.t > 0.9 ? Math.max(0, 1 - (car.t - 0.9) / 0.1) : 1
            const opacity = Math.min(opacityIn, nearingEnd)
            return (
              <motion.div key={car.id} className="absolute" initial={{ opacity: 0 }} animate={{ opacity, x, y, rotate: angle }} transition={{ type: 'tween', duration: 0.12 }} style={{ left: -CAR_SIZE/2, top: -CAR_SIZE/2 }}>
                <CarSprite color={car.color} />
              </motion.div>
            )
          })}
          {/* HUD */}
          <div className="absolute right-3 top-3 text-xs bg-black/50 backdrop-blur rounded-lg px-3 py-2 border border-emerald-500/20 text-emerald-200">
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> <span>NS: {nsPhase.toUpperCase()}</span></div>
            <div className="flex items-center gap-2 mt-1"><span className="inline-block w-2 h-2 rounded-full bg-cyan-400" /> <span>EW: {ewPhase.toUpperCase()}</span></div>
            <div className="opacity-70 mt-1">Cars: {cars.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- simulation internals ---------- */
function advanceCars(prev: Car[], dt: number, nsPhase: string, ewPhase: string): Car[] {
  const ACCEL = 320, BRAKE = 520
  const insideNow = (c: Car) => c.t > c.path.stopT && c.t < c.path.exitT
  const occ = new Set<string>()
  prev.forEach(c => { if (insideNow(c)) c.path.quads.forEach(q => occ.add(q)) })
  const order = [...prev].sort((a,b) => { const ia = insideNow(a)?-1:1, ib=insideNow(b)?-1:1; if (ia!==ib) return ia-ib; const da=Math.max(0,a.path.stopT-a.t), db=Math.max(0,b.path.stopT-b.t); return da-db })
  const updated: (Car & { _prevT: number })[] = []
  for (const car of order) {
    const desired = car.speed / Math.max(1, car.path.len)
    const axisPhase = (car.dir === 'N' || car.dir === 'S') ? nsPhase : ewPhase
    const beforeStop = car.t < car.path.stopT
    const inBox = car.t >= car.path.stopT && car.t < car.path.exitT
    const distToStopPx = beforeStop ? (car.path.stopT - car.t) * Math.max(1, car.path.len) : 0
    const startedFromStop = !inBox && car.v < 0.02 && Math.abs(car.t - car.path.stopT) < 1e-4
    let allowSignal = false
    if (axisPhase === 'green') allowSignal = true
    else if (axisPhase === 'yellow') allowSignal = proceedOnYellow(distToStopPx, startedFromStop)
    else allowSignal = false
    let targetV: number
    if (inBox) targetV = desired; else if (beforeStop) targetV = allowSignal ? desired : 0; else targetV = desired
    const START_ACCEL = 220
    const effAccel = (targetV > car.v && startedFromStop) ? START_ACCEL : ACCEL
    const a_t = (targetV > car.v ? effAccel : BRAKE) / Math.max(1, car.path.len)
    let v = car.v + Math.sign(targetV - car.v) * a_t * dt
    if ((targetV - car.v) * (targetV - v) < 0) v = targetV
    let tNext = car.t + Math.max(0, v) * dt
    const wantsToEnter = car.t < car.path.stopT && tNext > car.path.stopT
    const quadsFree = () => car.path.quads.every(q => !occ.has(q))
    let canEnterNow = false
    if (wantsToEnter) {
      const gapOK = quadsFree()
      if (car.turn === 'straight') canEnterNow = allowSignal && gapOK
      else canEnterNow = (allowSignal && gapOK) || (axisPhase === 'red' && gapOK)
    }
    if (wantsToEnter && !canEnterNow) { tNext = Math.min(tNext, car.path.stopT); v = 0 }
    else if (wantsToEnter && canEnterNow) { car.path.quads.forEach(q => occ.add(q)) }
    else if (inBox) { car.path.quads.forEach(q => occ.add(q)) }
    updated.push({ ...car, t: tNext, v, _prevT: car.t })
  }
  // headway
  const groups: Record<string,(Car & { _prevT: number })[]> = {}
  updated.forEach(c => { (groups[c.path.id] ??= []).push(c) })
  const MIN_GAP_PX = CAR_SIZE + 10
  for (const pid in groups) {
    const arr = groups[pid].sort((a,b)=>b.t - a.t)
    for (let i=1;i<arr.length;i++) { const leader=arr[i-1], follower=arr[i]; const gapT = MIN_GAP_PX / Math.max(1, follower.path.len); if (follower.t > leader.t - gapT) { follower.t = Math.max(0, leader.t - gapT); follower.v = Math.min(follower.v, (leader.t - gapT - follower._prevT)/Math.max(1e-6, dt)); if (!isFinite(follower.v) || follower.v < 0) follower.v = 0 } }
  }
  return updated.filter(c => c.t <= 1.02).map(({ _prevT, ...rest }) => rest as Car)
}

/* ---------- geometry & path helpers ---------- */
type Pt = { x: number; y: number }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpP = (p: Pt, q: Pt, t: number): Pt => ({ x: lerp(p.x,q.x,t), y: lerp(p.y,q.y,t) })
const dist = (a: Pt, b: Pt) => Math.hypot(a.x-b.x, a.y-b.y)
function bezierPoint(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt { const mt=1-t; return { x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x, y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y } }
function bezierTangent(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt { const mt=1-t; return { x: 3*mt*mt*(p1.x-p0.x)+6*mt*t*(p2.x-p1.x)+3*t*t*(p3.x-p2.x), y: 3*mt*mt*(p1.y-p0.y)+6*mt*t*(p2.y-p1.y)+3*t*t*(p3.y-p2.y) } }
function bezEvalWithAngle(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt) { const p = bezierPoint(t,p0,p1,p2,p3); const d=bezierTangent(t,p0,p1,p2,p3); const angle = Math.atan2(d.y,d.x)*180/Math.PI; return { x: p.x, y: p.y, angle } }
function bezLen(p0: Pt, p1: Pt, p2: Pt, p3: Pt) { const STEPS=28; let L=0, prev=p0; for(let i=1;i<=STEPS;i++){ const t=i/STEPS; const p=bezierPoint(t,p0,p1,p2,p3); L+=dist(prev,p); prev=p } return L }

function scanEntryExit(ctrls: [Pt, Pt, Pt, Pt]) {
  const [p0,p1,p2,p3] = ctrls
  const c = SIZE/2; const xL=c-ROAD_W/2+STOP_GAP; const xR=c+ROAD_W/2-STOP_GAP; const yT=c-ROAD_W/2+STOP_GAP; const yB=c+ROAD_W/2-STOP_GAP
  const STEPS=120; let stopT=0, exitT=1, inside=false
  for (let i=0;i<=STEPS;i++){ const t=i/STEPS; const p=bezierPoint(t,p0,p1,p2,p3); const inBox = p.x>=xL&&p.x<=xR&&p.y>=yT&&p.y<=yB; if(!inside && inBox){ stopT=(i-1)/STEPS; inside=true } if(inside && !inBox){ exitT=t; break } }
  return { stopT, exitT }
}

function requiredQuads(dir: Dir, turn: Turn): Quad[] {
  if (dir === 'E') { if (turn === 'left') return ['NE']; if (turn === 'right') return ['SE']; return ['NE','SE'] }
  if (dir === 'W') { if (turn === 'left') return ['SW']; if (turn === 'right') return ['NW']; return ['NW','SW'] }
  if (dir === 'N') { if (turn === 'left') return ['NW']; if (turn === 'right') return ['NE']; return ['NE','NW'] }
  // S
  if (turn === 'left') return ['SE']; if (turn === 'right') return ['SW']; return ['SE','SW']
}

function chooseTurn(): Turn { const r = Math.random(); if (r < 0.25) return 'left'; if (r < 0.5) return 'right'; return 'straight' }

function makePath(dir: Dir, turn: Turn, laneSide: -1 | 1): Path {
  const c = SIZE/2; const xL=c-ROAD_W/2, xR=c+ROAD_W/2, yT=c-ROAD_W/2, yB=c+ROAD_W/2
  const yE = c - ROAD_W*0.25 + laneSide * ROAD_W * 0.14
  const yW = c + ROAD_W*0.25 + laneSide * ROAD_W * 0.14
  const xN = c - ROAD_W*0.25 + laneSide * ROAD_W * 0.14
  const xS = c + ROAD_W*0.25 + laneSide * ROAD_W * 0.14
  const quads = requiredQuads(dir, turn)
  const line = (p0: Pt, p3: Pt): Path => { const p1=lerpP(p0,p3,0.33); const p2=lerpP(p0,p3,0.66); const len=dist(p0,p3); const { stopT, exitT } = scanEntryExit([p0,p1,p2,p3]); return { id: `${dir}-straight-${laneSide}`, len, stopT, exitT, quads, eval: t => bezEvalWithAngle(t,p0,p1,p2,p3) } }
  const curve = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, id: string): Path => { const len=bezLen(p0,p1,p2,p3); const { stopT, exitT }=scanEntryExit([p0,p1,p2,p3]); return { id, len, stopT, exitT, quads, eval: t => bezEvalWithAngle(t,p0,p1,p2,p3) } }
  if (dir === 'E') { const p0: Pt = { x: -SPAWN_BUFFER, y: yE }; if (turn==='straight') return line(p0,{ x: SIZE+SPAWN_BUFFER, y: yE }); if (turn==='left'){ const p3: Pt={ x: xN, y: -SPAWN_BUFFER }; const p1: Pt={ x: xL + ROAD_W*0.15, y: yE }; const p2: Pt={ x: xN, y: yT + ROAD_W*0.15 }; return curve(p0,p1,p2,p3,`E-left-${laneSide}`) } const p3: Pt={ x: xS, y: SIZE+SPAWN_BUFFER }; const p1: Pt={ x: xR - ROAD_W*0.15, y: yE }; const p2: Pt={ x: xS, y: yB - ROAD_W*0.15 }; return curve(p0,p1,p2,p3,`E-right-${laneSide}`) }
  if (dir === 'W') { const p0: Pt = { x: SIZE+SPAWN_BUFFER, y: yW }; if (turn==='straight') return line(p0,{ x: -SPAWN_BUFFER, y: yW }); if (turn==='left'){ const p3: Pt={ x: xS, y: SIZE+SPAWN_BUFFER }; const p1: Pt={ x: xR - ROAD_W*0.15, y: yW }; const p2: Pt={ x: xS, y: yB - ROAD_W*0.15 }; return curve(p0,p1,p2,p3,`W-left-${laneSide}`) } const p3: Pt={ x: xN, y: -SPAWN_BUFFER }; const p1: Pt={ x: xL + ROAD_W*0.15, y: yW }; const p2: Pt={ x: xN, y: yT + ROAD_W*0.15 }; return curve(p0,p1,p2,p3,`W-right-${laneSide}`) }
  if (dir === 'N') { const p0: Pt = { x: xN, y: SIZE+SPAWN_BUFFER }; if (turn==='straight') return line(p0,{ x: xN, y: -SPAWN_BUFFER }); if (turn==='left'){ const p3: Pt={ x: -SPAWN_BUFFER, y: yW }; const p1: Pt={ x: xN, y: yB - ROAD_W*0.15 }; const p2: Pt={ x: xL + ROAD_W*0.15, y: yW }; return curve(p0,p1,p2,p3,`N-left-${laneSide}`) } const p3: Pt={ x: SIZE+SPAWN_BUFFER, y: yE }; const p1: Pt={ x: xN, y: yT + ROAD_W*0.15 }; const p2: Pt={ x: xR - ROAD_W*0.15, y: yE }; return curve(p0,p1,p2,p3,`N-right-${laneSide}`) }
  const p0: Pt = { x: xS, y: -SPAWN_BUFFER }; if (turn==='straight') return line(p0,{ x: xS, y: SIZE+SPAWN_BUFFER }); if (turn==='left'){ const p3: Pt={ x: SIZE+SPAWN_BUFFER, y: yE }; const p1: Pt={ x: xS, y: yT + ROAD_W*0.15 }; const p2: Pt={ x: xR - ROAD_W*0.15, y: yE }; return curve(p0,p1,p2,p3,`S-left-${laneSide}`) } const p3: Pt={ x: -SPAWN_BUFFER, y: yW }; const p1: Pt={ x: xS, y: yB - ROAD_W*0.15 }; const p2: Pt={ x: xL + ROAD_W*0.15, y: yW }; return curve(p0,p1,p2,p3,`S-right-${laneSide}`)
}

/* ---------- presentational bits ---------- */
function LightBox({ x, y, orient, phase, lamps }: { x: number; y: number; orient: 'N'|'S'|'E'|'W'; phase: string; lamps: any }) {
  return (
    <div className="absolute rounded-md border" style={{ left: x, top: y, width: 28, height: 58, background: lamps.base.housing, borderColor: '#064e3b', boxShadow: '0 10px 18px rgba(0,0,0,0.45)' }}>
      <div className="flex flex-col items-center justify-center h-full gap-1 py-1">
        <Lamp color={phase==='red'? lamps.base.red : '#3f3f46'} dim={phase!=='red'} />
        <Lamp color={phase==='yellow'? lamps.base.yellow : '#3f3f46'} dim={phase!=='yellow'} />
        <Lamp color={phase==='green'? lamps.base.on : '#3f3f46'} dim={phase!=='green'} />
      </div>
      <div className="absolute" style={{ left: orient==='E'? '100%': orient==='W'? -8: 10, top: orient==='S'? '100%': orient==='N'? -8: 22, width:0, height:0, borderLeft: (orient==='E'||orient==='W')? '8px solid transparent': undefined, borderRight: (orient==='E'||orient==='W')? '8px solid transparent': undefined, borderTop: orient==='S'? '8px solid #111827': undefined, borderBottom: orient==='N'? '8px solid #111827': undefined }} />
    </div>
  )
}
function Lamp({ color, dim }: { color: string; dim?: boolean }) { return <div className="rounded-full" style={{ width:14, height:14, background:color, filter: dim? 'grayscale(0.35) brightness(0.8)': 'none', boxShadow: dim? 'none': `0 0 12px ${color}` }} /> }
function CarSprite({ color }: { color: string }) { return <div className="relative" style={{ width: CAR_SIZE, height: CAR_SIZE, background: color, borderRadius:4, boxShadow: '0 0 0 1px rgba(0,0,0,0.35) inset, 0 6px 14px rgba(0,0,0,0.45)' }} /> }

export default IntersectionDemo