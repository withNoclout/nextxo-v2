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
const WORLD_W = 1600, WORLD_H = 1200
const GRID_N = 4
const NODE_R = 14
const LINK_BASE_THICK = 2
const CAR_SIZE = 8
const PANEL_H_DEFAULT = 550

// Congestion thresholds
const CONGEST_THRESHOLD = 5
const BLOCK_THRESHOLD_SECONDS = 6 // time under congestion to escalate to blocked
const CLEAR_THRESHOLD = 3
const CLEAR_PERSIST_SECONDS = 4

// Spawning
const MAX_CARS = 140
const SPAWN_INTERVAL_MS = 520

let gid = 1

interface Node {
  id: string
  label: string
  x: number
  y: number
  neighbors: string[]
}

interface EdgeState {
  count: number
  status: 'normal' | 'congested' | 'blocked'
  congestSince?: number
  blockedSince?: number
  lastStatus?: 'normal' | 'congested' | 'blocked'
}

interface Car {
  id: number
  path: string[] // node ids sequence
  segIndex: number // current segment start node index in path
  progress: number // 0..1 along current segment
  speed: number // world units / s
  start: string
  dest: string
  detourBias: number // random bias factor to encourage alternate routes
  waiting: boolean
  lastRerouteAt: number
  bornAt: number
}

// Helper: canonical edge key (undirected)
function edgeKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

const NODE_LABELS = [
  'Finance','Sales','Marketing','R&D',
  'Operations','Procurement','Compliance','Quality',
  'Logistics','Sustainability','Analytics','Growth',
  'Platform','Data','Energy','Carbon'
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

  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelW, setPanelW] = useState(750)
  useEffect(() => {
    function measure() { if (panelRef.current) setPanelW(panelRef.current.clientWidth) }
    measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure)
  }, [])
  const panelH = desiredHeight ?? PANEL_H_DEFAULT
  const scale = Math.min(panelW / WORLD_W, panelH / WORLD_H)

  // Spawner
  // Helper: edge node ids
  const edgeNodeIds = useMemo(()=> nodes.filter(n=>{
    const [ , r, c ] = n.id.split('_')
    const ri = parseInt(r,10), ci = parseInt(c,10)
    return ri===0 || ci===0 || ri===GRID_N-1 || ci===GRID_N-1
  }).map(n=>n.id), [nodes])

  useEffect(() => {
    const iv = setInterval(() => {
      setCars(prev => {
        if (prev.length >= MAX_CARS) return prev
        const start = edgeNodeIds[Math.floor(Math.random() * edgeNodeIds.length)]
        let dest = start
        while (dest === start) dest = edgeNodeIds[Math.floor(Math.random() * edgeNodeIds.length)]
        const bias = Math.random() < 0.15 ? (0.5 + Math.random()) : 0 // some cars take longer path
        const path = shortestPath(start, dest, graph, () => 1, bias) || [start, dest]
        const speed = 90 + Math.random() * 50
        const car: Car = { id: gid++, path, segIndex: 0, progress: 0, speed, start, dest, detourBias: bias, waiting: false, lastRerouteAt: performance.now(), bornAt: performance.now() }
        return [...prev, car]
      })
    }, SPAWN_INTERVAL_MS)
    return () => clearInterval(iv)
  }, [graph, nodes, edgeNodeIds])

  // Simulation loop
  useEffect(() => {
    let last: number | null = null
    const frame = (ts: number) => {
      if (last == null) last = ts
      const dt = (ts - last) / 1000
      last = ts
      advance(dt)
      requestAnimationFrame(frame)
    }
    const id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  // Advance simulation
  function advance(dt: number) {
    // Recompute edge counts
    const edgeStates = edgeStatesRef.current
    edgeStates.forEach(es => es.count = 0)

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
        es.count++

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
            const gapNeeded = MIN_GAP / len
          if (foll.progress > lead.progress - gapNeeded) {
            foll.progress = Math.max(0, lead.progress - gapNeeded)
          }
        }
      }

      // Update edge status transitions & notifications
      updateEdgeStatuses(edgeStates, onNotify)
      setTick(t => t + 1) // refresh lines colors occasionally
      return nextCars
    })
  }

  function updateEdgeStatuses(edgeStates: Map<string, EdgeState>, notify?: (e: NotificationEvent) => void) {
    const now = performance.now()
    edgeStates.forEach((es, key) => {
      const prevStatus = es.status
      if (es.count >= CONGEST_THRESHOLD) {
        if (es.status === 'normal') {
          es.status = 'congested'
          es.congestSince = now
          if (notify) notify({ id: gid++, type: 'warn', message: `⚠️ Congestion rising on ${prettyEdge(key)} path`, ts: Date.now() })
        } else if (es.status === 'congested') {
          if (es.congestSince && now - es.congestSince > BLOCK_THRESHOLD_SECONDS * 1000) {
            es.status = 'blocked'
            es.blockedSince = now
            if (notify) notify({ id: gid++, type: 'block', message: `🔴 Blockage: ${prettyEdge(key)} link closed`, ts: Date.now() })
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
              if (notify) notify({ id: gid++, type: 'clear', message: `🟢 Traffic cleared: ${prettyEdge(key)} restored`, ts: Date.now() })
            }
          } else {
            es.congestSince = now // reset low counter since it's still moderate
          }
        }
      }
      es.lastStatus = prevStatus
    })
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

  // Car rendering
  function renderCars() {
    return (
      <AnimatePresence>
        {cars.map(car => {
          if (car.segIndex >= car.path.length - 1) return null
          const a = graph.byId[car.path[car.segIndex]]
          const b = graph.byId[car.path[car.segIndex + 1]]
          const x = a.x + (b.x - a.x) * car.progress
          const y = a.y + (b.y - a.y) * car.progress
          const life = (performance.now() - car.bornAt) / 1000
          const isExiting = car.segIndex === car.path.length - 2 && car.progress > 0.92
          return (
            <motion.div
              key={car.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: isExiting? 0.2:1, scale: isExiting?0.7:1, x, y }}
              exit={{ opacity: 0, scale: 0.3, transition:{ duration:0.4 } }}
              transition={{ type:'tween', duration:0.25 }}
              style={{ width: CAR_SIZE, height: CAR_SIZE, marginLeft: -CAR_SIZE/2, marginTop: -CAR_SIZE/2, borderRadius:2, background:'#10b981', boxShadow:'0 0 6px rgba(16,185,129,0.9),0 0 2px 1px rgba(16,185,129,0.5)' }}
            />
          )
        })}
      </AnimatePresence>
    )
  }

  const outerClasses = frameless ? 'relative w-full h-full overflow-hidden' : 'relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black/50'
  return (
    <div ref={panelRef} className={`${outerClasses} ${className||''}`}>
      <div style={{ width: WORLD_W, height: WORLD_H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative' }}>
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
                <span style={{ position:'absolute', top:'calc(100% + 4px)', left:'50%', transform:'translateX(-50%)', fontSize:9, color:'rgba(255,255,255,0.55)', whiteSpace:'nowrap' }}>{n.label}</span>
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
