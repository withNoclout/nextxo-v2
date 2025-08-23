import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* AdaptiveNetworkSim
   - Graph-based routing (4x4 grid of nodes) with Dijkstra shortest path
   - Dynamic congestion + blockage detection and re-routing
   - Notifications via onNotify callback
*/

export interface NotificationEvent {
  id: number
  type: 'warn' | 'block' | 'clear' | 'info'
  message: string
  ts: number
}

interface AdaptiveNetworkSimProps {
  onNotify?: (e: NotificationEvent) => void
  desiredHeight?: number
  frameless?: boolean
  blendBackground?: boolean // when true, no panel chrome or grid backdrop
  className?: string
}

// World & layout constants
// World dimensions scaled up modestly for 6x6 to preserve node spacing clarity inside 1000x600 viewport
const WORLD_W = 1800, WORLD_H = 1350
// Expanded grid dimension to accommodate more departments
const GRID_N = 6
const NODE_R = 14
const LINK_BASE_THICK = 2
const CAR_SIZE = 8
const PANEL_H_DEFAULT = 550

// Congestion thresholds
const CONGEST_THRESHOLD = 5
const BLOCK_THRESHOLD_SECONDS = 6 // time under congestion to escalate to blocked
const CLEAR_THRESHOLD = 3
const CLEAR_PERSIST_SECONDS = 4

// Spawning & temporal dynamics
const MAX_CARS_BASE = 260
// Simulation clock (minutes of day) speed (sim minutes per real second)
const SIM_MIN_PER_REAL_SEC = 2.5
// Peak hour definitions (24h clock)
const PEAK_WINDOWS = [ [8*60, 10*60], [17*60, 19*60] ] // 08:00-10:00 & 17:00-19:00
// Off-peak windows (optional explicit) can be inferred; we classify into off-peak, normal, peak
interface TimePhase { phase: 'off'|'normal'|'peak'; multiplier: number }
function classifyMinute(minOfDay:number): TimePhase {
  // Wrap into 0-1440
  const m = ((minOfDay % 1440) + 1440) % 1440
  const inPeak = PEAK_WINDOWS.some(([a,b]) => m >= a && m < b)
  if (inPeak) return { phase:'peak', multiplier: 2.6 }
  if (m < 6*60 || m >= 22*60) return { phase:'off', multiplier: 0.35 } // night
  return { phase:'normal', multiplier: 1.0 }
}

let gid = 1

interface Node {
  id: string
  label: string
  x: number
  y: number
  neighbors: string[]
}

interface EdgeState {
  count: number // weighted vehicle count
  status: 'normal' | 'congested' | 'blocked'
  congestSince?: number
  blockedSince?: number
  lastStatus?: 'normal' | 'congested' | 'blocked'
}

interface EdgeMetrics {
  weighted: number
  vehicles: number
  trucks: number
  buses: number
  evs: number
  bikes: number
  lastHeavyWarn?: number
  lastEVInfo?: number
  lastBusBlock?: number
}

type VehicleType = 'car' | 'truck' | 'bus' | 'ev' | 'bike'
interface Car {
  id: number
  type: VehicleType
  path: string[]
  segIndex: number
  progress: number
  speed: number
  start: string
  dest: string
  detourBias: number
  waiting: boolean
  lastRerouteAt: number
  bornAt: number
  weight: number
  emission: number
  length: number
  width: number
}

// Helper: canonical edge key (undirected)
function edgeKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

// Expanded department labels (mapped row-major). If more cells than labels, fallback to id
const NODE_LABELS = [
  // Row 1
  'Finance','Operations','Marketing','Sales','HR','Procurement',
  // Row 2
  'Legal','R&D','Engineering','Manufacturing','Quality Assurance','IT / Infrastructure',
  // Row 3
  'Product Development','Sustainability','Energy Management','Facilities','Waste & Recycling','Supply Chain',
  // Row 4
  'Compliance','Analytics / Data Science','Security','Training & Education','Communications','Strategy & Governance',
  // Row 5 (extra / future scaling or duplicates kept meaningful)
  'Carbon Insights','Emissions Modeling','Offset Validation','Renewables','Water Stewardship','Biodiversity',
  // Row 6 (extra/future)
  'Circular Economy','Risk Management','Audit','Vendor Assurance','Customer Success','Executive'
]

function buildGridNodes(): Node[] {
  const xs: number[] = [], ys: number[] = []
  for (let i = 0; i < GRID_N; i++) {
    xs.push(Math.round(((i + 1) / (GRID_N + 1)) * WORLD_W))
    ys.push(Math.round(((i + 1) / (GRID_N + 1)) * WORLD_H))
  }
  const nodes: Node[] = []
  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      const id = `n_${r}_${c}`
      const x = xs[c]
      const y = ys[r]
      const neighbors: string[] = []
      if (c > 0) neighbors.push(`n_${r}_${c - 1}`)
      if (c < GRID_N - 1) neighbors.push(`n_${r}_${c + 1}`)
      if (r > 0) neighbors.push(`n_${r - 1}_${c}`)
      if (r < GRID_N - 1) neighbors.push(`n_${r + 1}_${c}`)
      const labelIndex = r * GRID_N + c
      nodes.push({ id, label: NODE_LABELS[labelIndex] ?? id, x, y, neighbors })
    }
  }
  return nodes
}

interface GraphIndex {
  byId: Record<string, Node>
  nodes: Node[]
}

function indexNodes(nodes: Node[]): GraphIndex {
  const byId: Record<string, Node> = {}
  nodes.forEach(n => { byId[n.id] = n })
  return { byId, nodes }
}

// Dijkstra with dynamic penalties
function shortestPath(start: string, dest: string, graph: GraphIndex, edgePenalty: (a: string, b: string) => number, bias: number): string[] | null {
  if (start === dest) return [start]
  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const unvisited = new Set(graph.nodes.map(n => n.id))
  graph.nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[start] = 0
  while (unvisited.size) {
    let u: string | null = null
    let best = Infinity
    for (const id of unvisited) {
      const d = dist[id]
      if (d < best) { best = d; u = id }
    }
    if (u == null) break
    if (u === dest) break
    unvisited.delete(u)
    const node = graph.byId[u]
    for (const v of node.neighbors) {
      if (!unvisited.has(v)) continue
      const p = edgePenalty(u, v)
      if (p === Infinity) continue
      // Slight random detour bias: add bias * small factor * random
      const w = p * (1 + bias * 0.15)
      const alt = dist[u] + w
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u }
    }
  }
  if (dist[dest] === Infinity) return null
  const path: string[] = []
  let cur: string | null = dest
  while (cur) { path.push(cur); cur = prev[cur] }
  path.reverse()
  return path
}

function segmentLength(a: Node, b: Node) { return Math.hypot(a.x - b.x, a.y - b.y) }

// Main Component
export default function AdaptiveNetworkSim({ onNotify, desiredHeight, frameless, blendBackground, className }: AdaptiveNetworkSimProps) {
  const nodes = useMemo(() => buildGridNodes(), [])
  const graph = useMemo(() => indexNodes(nodes), [nodes])

  const [cars, setCars] = useState<Car[]>([])
  const edgeStatesRef = useRef<Map<string, EdgeState>>(new Map())
  const [tick, setTick] = useState(0) // force re-render for link status changes
  const [timePhase, setTimePhase] = useState<TimePhase>({ phase:'normal', multiplier:1 } as TimePhase)
  const lastPhaseRef = useRef<'off'|'normal'|'peak'>('normal')
  // workaround: store boolean flag indicating last was peak for TS simplicity
  const wasPeakRef = useRef(false)
  const simMinuteRef = useRef(0) // running simulation minute of day (0-1440)
  const startTimeRef = useRef<number | null>(null)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelW, setPanelW] = useState(750)
  useEffect(() => {
    function measure() { if (panelRef.current) setPanelW(panelRef.current.clientWidth) }
    measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure)
  }, [])
  const panelH = desiredHeight ?? PANEL_H_DEFAULT
  const scale = Math.min(panelW / WORLD_W, panelH / WORLD_H)

  // Helper: edge node ids
  const edgeNodeIds = useMemo(() => nodes.filter(n => {
    const [ , r, c ] = n.id.split('_')
    const ri = parseInt(r,10), ci = parseInt(c,10)
    return ri===0 || ci===0 || ri===GRID_N-1 || ci===GRID_N-1
  }).map(n=>n.id), [nodes])
  // Spawn accumulator (cars per second variable)
  const spawnAccRef = useRef(0)
  const edgeMetricsRef = useRef<Map<string, EdgeMetrics>>(new Map())

  // Simulation loop
  useEffect(() => {
    let last: number | null = null
    const frame = (ts: number) => {
      if (last == null) last = ts
      const dt = (ts - last) / 1000
      last = ts
      // Advance simulation clock
      if (startTimeRef.current == null) startTimeRef.current = ts
      simMinuteRef.current += SIM_MIN_PER_REAL_SEC * dt
      if (simMinuteRef.current >= 1440) simMinuteRef.current -= 1440
      const phaseInfo = classifyMinute(simMinuteRef.current)
      if (phaseInfo.phase !== timePhase.phase) {
  const prevPhase = lastPhaseRef.current
        setTimePhase(phaseInfo)
        // Notifications on phase transitions
        if (onNotify) {
          if (phaseInfo.phase === 'peak') {
            const rndEdge = randomEdgeLabel()
            onNotify({ id: gid++, type:'warn', message:`⚠️ Peak-hour surge: ${rndEdge} path`, ts: Date.now() })
          }
        }
        lastPhaseRef.current = phaseInfo.phase
        wasPeakRef.current = phaseInfo.phase === 'peak'
      }
      dynamicSpawn(dt, phaseInfo)
      advance(dt)
      requestAnimationFrame(frame)
    }
    const id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  // Advance simulation
  function advance(dt: number) {
  // Recompute edge counts & reset metrics
  const edgeStates = edgeStatesRef.current
  edgeStates.forEach(es => es.count = 0)
  edgeMetricsRef.current.clear()

    // Update car movement
    setCars(prev => {
      const now = performance.now()
      const nextCars: Car[] = []
      for (const car of prev) {
        let c = { ...car }
  if (c.segIndex >= c.path.length - 1) continue // safety
        const a = graph.byId[c.path[c.segIndex]]
        const b = graph.byId[c.path[c.segIndex + 1]]
        const len = segmentLength(a, b)
        // Edge status
        const eKey = edgeKey(a.id, b.id)
  let es = edgeStates.get(eKey)
  if (!es) { es = { count: 0, status: 'normal' }; edgeStates.set(eKey, es) }
  es.count += c.weight
  let em = edgeMetricsRef.current.get(eKey)
  if (!em) { em = { weighted:0, vehicles:0, trucks:0, buses:0, evs:0, bikes:0 }; edgeMetricsRef.current.set(eKey, em) }
  em.weighted += c.weight; em.vehicles++
  if (c.type==='truck') em.trucks++; else if(c.type==='bus') em.buses++; else if(c.type==='ev') em.evs++; else if(c.type==='bike') em.bikes++

        // Reroute if upcoming edge blocked OR congested and chance OR waiting
        if (c.progress === 0) {
          if (es.status === 'blocked' || (es.status === 'congested' && Math.random() < 0.35)) {
            const newPath = shortestPath(a.id, c.dest, graph, (x, y) => {
              const key = edgeKey(x, y)
              const st = edgeStates.get(key)
              if (st?.status === 'blocked') return Infinity
              if (st?.status === 'congested') return 3 // penalty
              return 1
            }, c.detourBias)
            if (newPath && newPath.length > 1) {
              c.path = newPath
              c.segIndex = 0
              c.progress = 0
              c.lastRerouteAt = now
            } else {
              c.waiting = true
            }
          }
        }

        // Movement
        if (!c.waiting) {
          c.progress += (c.speed * dt) / len
        }
        if (c.progress >= 1) {
          c.segIndex++
          c.progress = 0
          c.waiting = false
          if (c.segIndex >= c.path.length - 1) continue
        }
        nextCars.push(c)
      }

      // Spacing per edge
      const edgeBuckets: Record<string, Car[]> = {}
      for (const c of nextCars) {
        if (c.segIndex >= c.path.length - 1) continue
        const na = c.path[c.segIndex]
        const nb = c.path[c.segIndex + 1]
        const key = edgeKey(na, nb)
        ;(edgeBuckets[key] ||= []).push(c)
      }
    const MIN_GAP = 18
      for (const key in edgeBuckets) {
        const list = edgeBuckets[key]
        // sort by progress descending (leader first closer to end)
        list.sort((a, b) => b.progress - a.progress)
        // Need segment length
        const [aId, bId] = key.split('|')
        const len = segmentLength(graph.byId[aId], graph.byId[bId])
        for (let i = 1; i < list.length; i++) {
          const lead = list[i - 1]
          const foll = list[i]
      let gapNeeded = MIN_GAP / len
      if (foll.type==='bike') gapNeeded *= 0.4
      else if (foll.type==='truck' || foll.type==='bus') gapNeeded *= 1.35
          if (foll.progress > lead.progress - gapNeeded) {
            foll.progress = Math.max(0, lead.progress - gapNeeded)
          }
        }
      }

      // Update edge status transitions & notifications
  updateEdgeStatuses(edgeStates, onNotify, timePhase.phase === 'peak')
  emitVehicleMixNotifications(onNotify, timePhase.phase === 'peak')
      setTick(t => t + 1) // refresh lines colors occasionally
      return nextCars
    })
  }

  function updateEdgeStatuses(edgeStates: Map<string, EdgeState>, notify: ((e: NotificationEvent) => void) | undefined, isPeak:boolean) {
    const now = performance.now()
    edgeStates.forEach((es, key) => {
      const prevStatus = es.status
      if (es.count >= CONGEST_THRESHOLD) {
        if (es.status === 'normal') {
          es.status = 'congested'
          es.congestSince = now
          if (notify) notify({ id: gid++, type: 'warn', message: `⚠️ ${isPeak? 'Peak-hour':''} Congestion rising on ${prettyEdge(key)} path`, ts: Date.now() })
        } else if (es.status === 'congested') {
          if (es.congestSince && now - es.congestSince > BLOCK_THRESHOLD_SECONDS * 1000) {
            es.status = 'blocked'
            es.blockedSince = now
            if (notify) notify({ id: gid++, type: 'block', message: `🔴 ${isPeak? 'Critical congestion during rush hour:':'Blockage:'} ${prettyEdge(key)} link closed`, ts: Date.now() })
          }
        }
      } else {
        // below congestion threshold
        if (es.status === 'blocked') {
          if (es.count <= CLEAR_THRESHOLD) {
            es.status = 'congested' // step down first
            es.congestSince = now
          }
        } else if (es.status === 'congested') {
          if (es.count <= CLEAR_THRESHOLD) {
            // if sustained low -> clear
            if (!es.congestSince) es.congestSince = now
            else if (now - es.congestSince > CLEAR_PERSIST_SECONDS * 1000) {
              es.status = 'normal'
              es.congestSince = undefined
              if (notify) notify({ id: gid++, type: 'clear', message: `🟢 ${isPeak? 'Temporary relief':'Traffic cleared'}: ${prettyEdge(key)} restored`, ts: Date.now() })
            }
          } else {
            es.congestSince = now // reset low counter since it's still moderate
          }
        }
      }
      es.lastStatus = prevStatus
    })
  }

  function emitVehicleMixNotifications(notify: ((e:NotificationEvent)=>void)|undefined, isPeak:boolean){
    if (!notify) return
    const now = performance.now()
    edgeMetricsRef.current.forEach((m, key) => {
      if (m.trucks >= 4 && m.weighted >= CONGEST_THRESHOLD*0.9) {
        if (!m.lastHeavyWarn || now - m.lastHeavyWarn > 15000) {
          m.lastHeavyWarn = now
          notify({ id: gid++, type:'warn', message:`⚠️ Heavy congestion: ${m.trucks} trucks on ${prettyEdge(key)} path`, ts: Date.now() })
        }
      }
      const evRatio = m.vehicles>0 ? m.evs / m.vehicles : 0
      if (m.evs >=3 && evRatio >=0.6) {
        if (!m.lastEVInfo || now - m.lastEVInfo > 20000) {
          m.lastEVInfo = now
          notify({ id: gid++, type:'clear', message:`🟢 High EV adoption on ${prettyEdge(key)} route`, ts: Date.now() })
        }
      }
      if (isPeak && m.buses >=3 && m.weighted > CONGEST_THRESHOLD*1.3) {
        if (!m.lastBusBlock || now - m.lastBusBlock > 16000) {
          m.lastBusBlock = now
          notify({ id: gid++, type:'block', message:`🔴 Critical delay: bus cluster on ${prettyEdge(key)}`, ts: Date.now() })
        }
      }
    })
  }

  // Dynamic spawning with phase multipliers & clustering
  function dynamicSpawn(dt:number, phaseInfo:TimePhase){
    const targetMax = phaseInfo.phase==='peak'? 40 : 36
    const targetMin = 30
    let rate = 0
    if (cars.length < targetMin) rate = 3.0
    else if (cars.length < targetMax) rate = 1.25 * (phaseInfo.phase==='peak'?1.5:1)
    else rate = 0.15
    spawnAccRef.current += rate * dt
    while (spawnAccRef.current >= 1 && cars.length < targetMax) {
      spawnAccRef.current -= 1
      spawnCar(phaseInfo.phase === 'peak')
    }
  }

  function spawnCar(isPeak:boolean){
    setCars(prev => {
      if (prev.length > 50) return prev
      const start = edgeNodeIds[Math.floor(Math.random() * edgeNodeIds.length)]
      let dest = start
      while (dest === start) dest = edgeNodeIds[Math.floor(Math.random() * edgeNodeIds.length)]
      const bias = Math.random() < 0.22 ? (0.5 + Math.random()) : 0
      const vType = pickVehicleType(isPeak)
      const attr = vehicleAttributes(vType)
      const path = shortestPath(start, dest, graph, () => 1, bias) || [start, dest]
      const speed = (attr.baseSpeed + Math.random()*attr.speedJitter) * (isPeak && vType==='car'?0.95:1)
      const car: Car = { id: gid++, type:vType, path, segIndex: 0, progress: 0, speed, start, dest, detourBias: bias, waiting: false, lastRerouteAt: performance.now(), bornAt: performance.now(), weight: attr.weight, emission: attr.emission, length: attr.length, width: attr.width }
      const next = [...prev, car]
      if (isPeak && (vType==='truck'||vType==='bus') && Math.random()<0.25 && next.length < 48) {
        const attr2 = vehicleAttributes(vType)
        const sibling: Car = { ...car, id: gid++, speed: (attr2.baseSpeed+Math.random()*attr2.speedJitter)*0.9, bornAt: performance.now(), progress: Math.random()*0.2 }
        next.push(sibling)
      }
      return next
    })
  }

  function pickVehicleType(isPeak:boolean): VehicleType {
    const r = Math.random()
    if (isPeak) {
      if (r < 0.40) return 'car'
      if (r < 0.55) return 'ev'
      if (r < 0.75) return 'truck'
      if (r < 0.90) return 'bus'
      return 'bike'
    } else {
      if (r < 0.45) return 'car'
      if (r < 0.70) return 'ev'
      if (r < 0.78) return 'truck'
      if (r < 0.86) return 'bus'
      return 'bike'
    }
  }

  function vehicleAttributes(t:VehicleType){
    switch(t){
      case 'truck': return { length:18, width:10, baseSpeed:55, speedJitter:18, weight:1.6, emission:3.0 }
      case 'bus': return { length:20, width:11, baseSpeed:65, speedJitter:16, weight:1.4, emission:2.2 }
      case 'ev': return { length:8, width:8, baseSpeed:95, speedJitter:55, weight:1.0, emission:0.15 }
      case 'bike': return { length:5, width:5, baseSpeed:110, speedJitter:60, weight:0.35, emission:0.25 }
      default: return { length:8, width:8, baseSpeed:85, speedJitter:45, weight:1.0, emission:1.0 }
    }
  }

  function randomEdgeLabel(){
    const a = nodes[Math.floor(Math.random()*nodes.length)]
    if (!a.neighbors.length) return a.label
    const bId = a.neighbors[Math.floor(Math.random()*a.neighbors.length)]
    return `${a.label} → ${graph.byId[bId].label}`
  }
  function randomNodeLabel(){
    return nodes[Math.floor(Math.random()*nodes.length)].label
  }

  function prettyEdge(key: string) {
    const [a, b] = key.split('|')
    const na = graph.byId[a]
    const nb = graph.byId[b]
    return `${na.label} → ${nb.label}`
  }

  // Link drawing helper
  function renderLinks() {
    const elements: React.ReactNode[] = []
    const edgeSeen = new Set<string>()
    const edgeStates = edgeStatesRef.current
    for (const n of nodes) {
      for (const nb of n.neighbors) {
        const ek = edgeKey(n.id, nb)
        if (edgeSeen.has(ek)) continue
        edgeSeen.add(ek)
        const other = graph.byId[nb]
        const es = edgeStates.get(ek)
        let color = 'rgba(16,185,129,0.55)' // emerald glow
        if (es?.status === 'congested') color = 'rgba(234,179,8,0.9)' // yellow
        if (es?.status === 'blocked') color = 'rgba(239,68,68,0.95)' // red
        const dx = other.x - n.x
        const dy = other.y - n.y
        const len = Math.hypot(dx, dy)
        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        elements.push(
          <div key={ek} className="absolute" style={{ left: n.x, top: n.y, width: len, height: LINK_BASE_THICK, transform: `rotate(${angle}deg) translateY(-50%)`, transformOrigin: '0 0', background: color, boxShadow: `0 0 8px ${color}` }} />
        )
      }
    }
    return elements
  }

  // Car rendering (multi-vehicle)
  function renderCars() {
    return (
      <AnimatePresence>
        {cars.map(car => {
          if (car.segIndex >= car.path.length - 1) return null
          const a = graph.byId[car.path[car.segIndex]]
          const b = graph.byId[car.path[car.segIndex + 1]]
          const x = a.x + (b.x - a.x) * car.progress
          const y = a.y + (b.y - a.y) * car.progress
          const dx = b.x - a.x
          const dy = b.y - a.y
          const angle = Math.atan2(dy, dx) * 180/Math.PI
          const isExiting = car.segIndex === car.path.length - 2 && car.progress > 0.92
          let bg = '#10b981'
          let shadow = '0 0 6px rgba(16,185,129,0.9),0 0 2px 1px rgba(16,185,129,0.5)'
          if (car.type==='truck') { bg='#059669'; shadow='0 0 8px rgba(6,95,70,0.9),0 0 3px 1px rgba(6,95,70,0.6)' }
          else if (car.type==='bus') { bg='#047857'; shadow='0 0 8px rgba(4,120,87,0.95),0 0 3px 1px rgba(4,120,87,0.6)' }
          else if (car.type==='ev') { bg='#06b6d4'; shadow='0 0 8px rgba(6,182,212,0.95),0 0 3px 1px rgba(6,182,212,0.55)' }
          else if (car.type==='bike') { bg='#34d399'; shadow='0 0 5px rgba(52,211,153,0.9),0 0 2px 1px rgba(52,211,153,0.55)' }
          return (
            <motion.div
              key={car.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: isExiting? 0.2:1, scale: isExiting?0.7:1, x, y, rotate:angle }}
              exit={{ opacity: 0, scale: 0.3, transition:{ duration:0.4 } }}
              transition={{ type:'tween', duration:0.25 }}
              style={{ width: car.length, height: car.width, marginLeft: -car.length/2, marginTop: -car.width/2, borderRadius: car.type==='bike'? '50%':2, background:bg, boxShadow:shadow }}
            />
          )
        })}
      </AnimatePresence>
    )
  }

  const outerClasses = frameless ? 'relative w-full h-full overflow-hidden' : 'relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black/50'
  // compute centered offset after scale to keep world centered in panel
  const scaledW = WORLD_W * scale
  const scaledH = WORLD_H * scale
  const offsetX = (panelW - scaledW) / 2
  const offsetY = (panelH - scaledH) / 2
  // Dynamic label sizing to maintain readable 14-15px screen size after scale
  const desiredLabelScreenPx = 10
  const labelFont = Math.min(Math.round(desiredLabelScreenPx / Math.max(scale, 0.0001)), 46)
  return (
    <div ref={panelRef} className={`${outerClasses} ${className||''}`}>
      <div style={{ width: WORLD_W, height: WORLD_H, transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`, transformOrigin: 'top left', position: 'relative' }}>
        {!blendBackground && (
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px),linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)', backgroundSize: '38px 38px', opacity: 0.9 }} />
        )}
        {/* Links */}
        {renderLinks()}
        {/* Nodes with spawn/despawn animation */}
        <AnimatePresence>
          {nodes.map(n => (
            <motion.div
              key={n.id}
              className="absolute"
              initial={{ opacity:0, scale:0.3 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.25, transition:{ duration:0.45 } }}
              transition={{ duration:0.5, type:'spring', stiffness:140, damping:18 }}
              style={{ left:n.x, top:n.y, transform:'translate(-50%,-50%)' }}
            >
              <div style={{ width: NODE_R*2, height: NODE_R*2, background:'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.9), rgba(16,185,129,0.15))', borderRadius:'50%', boxShadow:'0 0 10px rgba(16,185,129,0.7),0 0 2px 1px rgba(16,185,129,0.4)', position:'relative' }}>
                <span style={{ position:'absolute', top:'calc(100% + 4px)', left:'50%', transform:'translateX(-50%)', fontSize:labelFont, lineHeight:(labelFont+2)+'px', color:'#f5f7fa', whiteSpace:'nowrap', textShadow:'0 0 3px rgba(0,0,0,0.7)' }}>{n.label}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Cars */}
        {renderCars()}
      </div>
      {!frameless && (
        <div className="absolute right-2 top-2 text-[10px] bg-black/60 backdrop-blur rounded-md px-2 py-1 border border-emerald-500/20 text-emerald-200 leading-tight">
          <div>Cars {cars.length}</div>
        </div>
      )}
    </div>
  )
}
