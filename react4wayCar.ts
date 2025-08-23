import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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

// simple dark/green palette
const COLORS = ["#22c55e", "#10b981", "#2dd4bf", "#a3e635", "#67e8f9", "#86efac"]; // cars

// Directions
const DIRS = ["E", "W", "N", "S"] as const;
type Dir = typeof DIRS[number];

// Turn intents
const TURNS = ["straight", "left", "right"] as const;
type Turn = typeof TURNS[number];

// ===== Intersection quadrants =====
type Quad = "NW" | "NE" | "SW" | "SE";

// Path data
type Path = {
  id: string; // for lane grouping
  len: number; // approximate length in px
  stopT: number; // last t before entering intersection (with STOP_GAP)
  exitT: number; // first t after fully exiting intersection
  quads: Quad[]; // quadrants required while inside intersection
  eval: (t: number) => { x: number; y: number; angle: number }; // world coords + heading (deg)
};

type Car = {
  id: number;
  dir: Dir; // entry direction
  turn: Turn;
  t: number; // progress 0..1 along path
  v: number; // progress velocity (t per second)
  speed: number; // desired linear speed in px/s
  color: string;
  bornAt: number; // ms
  path: Path;
};

// === Thailand traffic light logic ===
function useTrafficCycle() {
  // Thailand sequence: NS G(8s) -> NS Y(3s) -> EW G(8s) -> EW Y(3s), repeat
  const [ms, setMs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMs((t) => t + 100), 100);
    return () => clearInterval(id);
  }, []);
  const { nsPhase, ewPhase } = computeThaiPhases(ms);
  return { nsPhase, ewPhase };
}

// Pure phase computer for Thai timings; safe to unit test
function computeThaiPhases(ms: number) {
  type Phase = "green" | "yellow" | "red";
  const G = GREEN_MS; // 8000
  const Y = YELLOW_MS; // 3000
  const FULL = 2 * (G + Y); // 22000
  const t = ((ms % FULL) + FULL) % FULL; // safe modulo
  let nsPhase: Phase, ewPhase: Phase;
  if (t < G) {
    nsPhase = "green"; ewPhase = "red";
  } else if (t < G + Y) {
    nsPhase = "yellow"; ewPhase = "red";
  } else if (t < G + Y + G) {
    nsPhase = "red"; ewPhase = "green";
  } else {
    nsPhase = "red"; ewPhase = "yellow";
  }
  return { nsPhase, ewPhase, t };
}

// Decide if an approaching car should proceed on yellow
function proceedOnYellow(distPx: number, wasStopped: boolean) {
  return distPx <= YEL_PROCEED_PX && !wasStopped;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let gid = 1;

export function IntersectionDemo() {
  const [cars, setCars] = useState<Car[]>([]);
  const { nsPhase, ewPhase } = useTrafficCycle();

  // spawn cars frequently (target ~22–30 cars) with random turn intents
  useEffect(() => {
    const iv = setInterval(() => {
      if (cars.length > 32) return;
      if (Math.random() < 0.9) {
        const dir: Dir = rand([...DIRS]);
        const turn: Turn = chooseTurn();
        const laneSide = Math.random() < 0.5 ? -1 : 1; // which lane within each approach
        const color = rand(COLORS);
        const now = performance.now();
        const path = makePath(dir, turn, laneSide);
        const speed = 120 + Math.random() * 65; // px/s
        const car: Car = {
          id: gid++,
          dir,
          turn,
          t: 0,
          v: 0,
          speed,
          color,
          bornAt: now,
          path,
        };
        setCars((c) => [...c, car]);
      }
    }, 420);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  // animation loop
  const loopRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastRef.current ?? ts;
      lastRef.current = ts;
      const dt = (ts - last) / 1000; // seconds
      setCars((prev) => {
        const ACCEL = 320; // px/s^2
        const BRAKE = 520; // px/s^2

        // Occupancy of intersection quadrants from cars already inside
        const occ = new Set<string>();
        const insideNow = (c: Car) => c.t > c.path.stopT && c.t < c.path.exitT;
        prev.forEach((c) => {
          if (insideNow(c)) c.path.quads.forEach((q) => occ.add(q));
        });

        // Order cars: ones already inside first, then nearest to stop line
        const order = [...prev].sort((a, b) => {
          const ia = insideNow(a) ? -1 : 1;
          const ib = insideNow(b) ? -1 : 1;
          if (ia !== ib) return ia - ib;
          const da = Math.max(0, a.path.stopT - a.t);
          const db = Math.max(0, b.path.stopT - b.t);
          return da - db;
        });

        const updated: (Car & { _prevT: number })[] = [];

        for (const car of order) {
          const desired_t_per_s = car.speed / Math.max(1, car.path.len);
          const axisPhase = car.dir === "N" || car.dir === "S" ? nsPhase : ewPhase;

          // Position phases relative to stop line
          const beforeStop = car.t < car.path.stopT;
          const inBox = car.t >= car.path.stopT && car.t < car.path.exitT;
          const distToStopPx = beforeStop ? (car.path.stopT - car.t) * Math.max(1, car.path.len) : 0;
          const startedFromStop = !inBox && car.v < 0.02 && Math.abs(car.t - car.path.stopT) < 1e-4;

          // Signal permission per Thai rules
          let allowSignal = false;
          if (axisPhase === "green") allowSignal = true;
          else if (axisPhase === "yellow") allowSignal = proceedOnYellow(distToStopPx, startedFromStop);
          else allowSignal = false; // red

          // Target velocity:
          // - Inside intersection: ALWAYS continue (no stopping in the middle)
          // - Before stop line: proceed only if signal allows
          // - After exit: continue
          let targetV: number;
          if (inBox) targetV = desired_t_per_s; else if (beforeStop) targetV = allowSignal ? desired_t_per_s : 0; else targetV = desired_t_per_s;

          // Acceleration: softer when starting from stop at the line
          const START_ACCEL = 220; // gentler human-like launch
          const effAccel = (targetV > car.v && startedFromStop) ? START_ACCEL : ACCEL;
          const a_t = (targetV > car.v ? effAccel : BRAKE) / Math.max(1, car.path.len);
          let v = car.v + Math.sign(targetV - car.v) * a_t * dt;
          if ((targetV - car.v) * (targetV - v) < 0) v = targetV;

          let tNext = car.t + Math.max(0, v) * dt;

          // Quadrant reservation gating at the entrance
          const wantsToEnter = car.t < car.path.stopT && tNext > car.path.stopT;
          const stillInside =
            tNext < car.path.exitT && (tNext > car.path.stopT || car.t > car.path.stopT);

          const quadsFree = () => car.path.quads.every((q) => !occ.has(q));

          // Movement policy per turn:
          // - left: free-turn on red if gap (quadrants free)
          // - straight: need light (green) AND gap
          // - right: go on green OR if gap is clear
          let canEnterNow = false;
          if (wantsToEnter) {
            const gapOK = quadsFree();
            if (car.turn === "straight") {
              canEnterNow = allowSignal && gapOK;
            } else if (car.turn === "left") {
              // left may go on green/yellow-near-stop with gap OR on red if gap is clear
              canEnterNow = (allowSignal && gapOK) || (axisPhase === "red" && gapOK);
            } else {
              // right may go on green/yellow-near-stop with gap OR on red if gap is clear
              canEnterNow = (allowSignal && gapOK) || (axisPhase === "red" && gapOK);
            }
          }

          if (wantsToEnter) {
            if (!canEnterNow) {
              // clamp to stop line and wait
              tNext = Math.min(tNext, car.path.stopT);
              v = 0;
            } else {
              // reserve quadrants for this tick (prevents same-frame double entry)
              car.path.quads.forEach((q) => occ.add(q));
            }
          } else if (stillInside) {
            // keep reservation while inside
            car.path.quads.forEach((q) => occ.add(q));
          }

          updated.push({ ...car, t: tNext, v, _prevT: car.t });
        }

        // Headway per path (no tailgating)
        const groups: Record<string, (Car & { _prevT: number })[]> = {};
        updated.forEach((c) => {
          (groups[c.path.id] ??= []).push(c);
        });
        const MIN_GAP_PX = CAR_SIZE + 10;
        for (const pid in groups) {
          const arr = groups[pid].sort((a, b) => b.t - a.t);
          for (let i = 1; i < arr.length; i++) {
            const leader = arr[i - 1],
              follower = arr[i];
            const gapT = MIN_GAP_PX / Math.max(1, follower.path.len);
            if (follower.t > leader.t - gapT) {
              follower.t = Math.max(0, leader.t - gapT);
              follower.v = Math.min(
                follower.v,
                (leader.t - gapT - follower._prevT) / Math.max(dt, 1e-6)
              );
              if (!isFinite(follower.v) || follower.v < 0) follower.v = 0;
            }
          }
        }

        // Remove cars that finished
        return updated
          .filter((c) => c.t <= 1.02)
          .map(({ _prevT, ...rest }) => rest as Car);
      });

      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      lastRef.current = null;
    };
  }, [nsPhase, ewPhase]);

  // traffic light lamps by direction
  const lamps = useMemo(() => {
    const base = {
      bg: "#0b0f10",
      housing: "#111827",
      on: "#22c55e",
      red: "#ef4444",
      yellow: "#f59e0b",
      text: "#a7f3d0",
    };
    return { base };
  }, []);

  // Run lightweight debug tests once in dev
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { runDebugTests(); } catch { /* noop */ }
  }, []);

  // Precompute far-side signal positions OUTSIDE JSX
  const c = SIZE / 2;
  const xL = c - ROAD_W / 2;
  const xR = c + ROAD_W / 2;
  const yT = c - ROAD_W / 2;
  const yB = c + ROAD_W / 2;

  return (
    <div className="w-full min-h-[720px] py-8 bg-black/95 text-emerald-200">
      <div className="mx-auto max-w-[900px] px-4">
        <h1 className="text-xl font-semibold mb-4 text-emerald-300">4-way Intersection — Top View</h1>
        <p className="text-sm opacity-80 mb-4">Dark/green theme · turning cars · non-overlapping · realistic signal cycle.</p>
      </div>
      <div className="mx-auto max-w-[900px] px-4">
        <div
          className="relative rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: SIZE,
            height: SIZE,
            // green grid on dark asphalt
            backgroundColor: "#07090b",
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
            backgroundSize: `${GRID}px ${GRID}px`,
          }}
        >
          {/* Roads */}
          <div className="absolute inset-0">
            {/* horizontal road */}
            <div
              className="absolute left-0 right-0 bg-slate-900"
              style={{ top: SIZE / 2 - ROAD_W / 2, height: ROAD_W }}
            />
            {/* vertical road */}
            <div
              className="absolute top-0 bottom-0 bg-slate-900"
              style={{ left: SIZE / 2 - ROAD_W / 2, width: ROAD_W }}
            />

            {/* Lane markings */}
            {/* horizontal center dashed lines */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: SIZE / 2 - 2,
                height: 4,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 10px, transparent 10px 24px)",
              }}
            />
            {/* vertical center dashed lines */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: SIZE / 2 - 2,
                width: 4,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 10px, transparent 10px 24px)",
              }}
            />

            {/* intersection box outline subtle */}
            <div
              className="absolute border border-emerald-500/20"
              style={{
                left: SIZE / 2 - ROAD_W / 2,
                top: SIZE / 2 - ROAD_W / 2,
                width: ROAD_W,
                height: ROAD_W,
                boxShadow: "0 0 0 1px rgba(16,185,129,0.08) inset",
              }}
            />

            {/* Stop lines */}
            <div
              className="absolute h-1 w-16 bg-white/80"
              style={{ top: SIZE / 2 - ROAD_W / 2 - 6, left: SIZE / 2 - 8 }}
            />
            <div
              className="absolute h-1 w-16 bg-white/80"
              style={{ bottom: SIZE / 2 - ROAD_W / 2 - 6, left: SIZE / 2 - 8 }}
            />
            <div
              className="absolute w-1 h-16 bg-white/80"
              style={{ left: SIZE / 2 - ROAD_W / 2 - 6, top: SIZE / 2 - 8 }}
            />
            <div
              className="absolute w-1 h-16 bg-white/80"
              style={{ right: SIZE / 2 - ROAD_W / 2 - 6, top: SIZE / 2 - 8 }}
            />
          </div>

          {/* Traffic lights (far-side heads per approach) */}
          {/* Southbound sees top (far side) */}
          <LightBox x={SIZE / 2 - 14} y={yT - 70} orient="S" phase={nsPhase} lamps={lamps} />
          {/* Northbound sees bottom (far side) */}
          <LightBox x={SIZE / 2 - 14} y={yB + 12} orient="N" phase={nsPhase} lamps={lamps} />
          {/* Eastbound sees right (far side) */}
          <LightBox x={xR + 12} y={SIZE / 2 - 14} orient="W" phase={ewPhase} lamps={lamps} />
          {/* Westbound sees left (far side) */}
          <LightBox x={xL - 70} y={SIZE / 2 - 14} orient="E" phase={ewPhase} lamps={lamps} />

          {/* Cars */}
          {cars.map((car) => {
            const { x, y, angle } = car.path.eval(car.t);
            // fade in within first 0.6s, fade out near the end
            const opacityIn = Math.min(1, (performance.now() - car.bornAt) / 600);
            const nearingEnd = car.t > 0.9 ? Math.max(0, 1 - (car.t - 0.9) / 0.1) : 1;
            const opacity = Math.min(opacityIn, nearingEnd);

            return (
              <motion.div
                key={car.id}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity, x, y, rotate: angle }}
                transition={{ type: "tween", duration: 0.12 }}
                style={{ left: -CAR_SIZE / 2, top: -CAR_SIZE / 2 }}
                title={`car ${car.id}`}
              >
                <CarSprite color={car.color} />
              </motion.div>
            );
          })}

          {/* HUD */}
          <div className="absolute right-3 top-3 text-xs bg-black/50 backdrop-blur rounded-lg px-3 py-2 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>NS: {nsPhase.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
              <span>EW: {ewPhase.toUpperCase()}</span>
            </div>
            <div className="opacity-70 mt-1">Cars: {cars.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightBox({
  x,
  y,
  orient,
  phase,
  lamps,
}: {
  x: number;
  y: number;
  orient: "N" | "S" | "E" | "W";
  phase: "red" | "yellow" | "green";
  lamps: any;
}) {
  // show one active lamp only
  return (
    <div
      className="absolute rounded-md border"
      style={{
        left: x,
        top: y,
        width: 28,
        height: 58,
        background: lamps.base.housing,
        borderColor: "#064e3b",
        boxShadow: "0 10px 18px rgba(0,0,0,0.45)",
      }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-1 py-1">
        <Lamp color={phase === "red" ? lamps.base.red : "#3f3f46"} dim={phase !== "red"} />
        <Lamp color={phase === "yellow" ? lamps.base.yellow : "#3f3f46"} dim={phase !== "yellow"} />
        <Lamp color={phase === "green" ? lamps.base.on : "#3f3f46"} dim={phase !== "green"} />
      </div>
      {/* tiny triangle to indicate orientation */}
      <div
        className="absolute"
        style={{
          left: orient === "E" ? "100%" : orient === "W" ? -8 : 10,
          top: orient === "S" ? "100%" : orient === "N" ? -8 : 22,
          width: 0,
          height: 0,
          borderLeft: orient === "E" || orient === "W" ? "8px solid transparent" : undefined,
          borderRight: orient === "E" || orient === "W" ? "8px solid transparent" : undefined,
          borderTop: orient === "S" ? "8px solid #111827" : orient === "N" ? undefined : undefined,
          borderBottom: orient === "N" ? "8px solid #111827" : undefined,
        }}
      />
    </div>
  );
}

function Lamp({ color, dim }: { color: string; dim?: boolean }) {
  return (
    <div
      className="rounded-full"
      style={{
        width: 14,
        height: 14,
        background: color,
        filter: dim ? "grayscale(0.35) brightness(0.8)" : "none",
        boxShadow: dim ? "none" : `0 0 12px ${color}`,
      }}
    />
  );
}

// ===== Car sprite (square) =====
function CarSprite({ color }: { color: string }) {
  return (
    <div
      className="relative"
      style={{
        width: CAR_SIZE,
        height: CAR_SIZE,
        background: color,
        borderRadius: 4,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.35) inset, 0 6px 14px rgba(0,0,0,0.45)",
      }}
    />
  );
}

// ===== Movement planning =====
function requiredQuads(dir: Dir, turn: Turn): Quad[] {
  // Conservative quadrant reservation to prevent conflicts
  if (dir === "E") {
    if (turn === "left") return ["NE"]; // to North
    if (turn === "right") return ["SE"]; // to South
    return ["NE", "SE"]; // straight across right half
  }
  if (dir === "W") {
    if (turn === "left") return ["SW"]; // to South
    if (turn === "right") return ["NW"]; // to North
    return ["NW", "SW"]; // straight across left half
  }
  if (dir === "N") {
    if (turn === "left") return ["NW"]; // to West
    if (turn === "right") return ["NE"]; // to East
    return ["NE", "NW"]; // straight across top half
  }
  // S
  if (turn === "left") return ["SE"]; // to East
  if (turn === "right") return ["SW"]; // to West
  return ["SE", "SW"]; // straight across bottom half
}

function chooseTurn(): Turn {
  const r = Math.random();
  if (r < 0.25) return "left";
  if (r < 0.5) return "right";
  return "straight";
}

function makePath(dir: Dir, turn: Turn, laneSide: -1 | 1): Path {
  const c = SIZE / 2;
  const xL = c - ROAD_W / 2;
  const xR = c + ROAD_W / 2;
  const yT = c - ROAD_W / 2;
  const yB = c + ROAD_W / 2;

  // inbound lane centers
  const yE = c - ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // eastbound
  const yW = c + ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // westbound
  const xN = c - ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // northbound
  const xS = c + ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // southbound

  const quads = requiredQuads(dir, turn);

  // helpers
  const line = (p0: Pt, p3: Pt): Path => {
    const p1 = lerpP(p0, p3, 0.33);
    const p2 = lerpP(p0, p3, 0.66);
    const len = dist(p0, p3);
    const { stopT, exitT } = scanEntryExit([p0, p1, p2, p3]);
    return {
      id: `${dir}-straight-${laneSide}`,
      len,
      stopT,
      exitT,
      quads,
      eval: (t) => bezEvalWithAngle(t, p0, p1, p2, p3),
    };
  };

  const curve = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, id: string): Path => {
    const len = bezLen(p0, p1, p2, p3);
    const { stopT, exitT } = scanEntryExit([p0, p1, p2, p3]);
    return { id, len, stopT, exitT, quads, eval: (t) => bezEvalWithAngle(t, p0, p1, p2, p3) };
  };

  // Build by cases
  if (dir === "E") {
    const p0: Pt = { x: -SPAWN_BUFFER, y: yE };
    if (turn === "straight") {
      const p3: Pt = { x: SIZE + SPAWN_BUFFER, y: yE };
      return line(p0, p3);
    }
    if (turn === "left") {
      // E -> N (left)
      const p3: Pt = { x: xN, y: -SPAWN_BUFFER };
      const p1: Pt = { x: xL + ROAD_W * 0.15, y: yE };
      const p2: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
      return curve(p0, p1, p2, p3, `E-left-${laneSide}`);
    }
    // right: E -> S
    const p3: Pt = { x: xS, y: SIZE + SPAWN_BUFFER };
    const p1: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    const p2: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
    return curve(p0, p1, p2, p3, `E-right-${laneSide}`);
  }

  if (dir === "W") {
    const p0: Pt = { x: SIZE + SPAWN_BUFFER, y: yW };
    if (turn === "straight") {
      const p3: Pt = { x: -SPAWN_BUFFER, y: yW };
      return line(p0, p3);
    }
    if (turn === "left") {
      // W -> S
      const p3: Pt = { x: xS, y: SIZE + SPAWN_BUFFER };
      const p1: Pt = { x: xR - ROAD_W * 0.15, y: yW };
      const p2: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
      return curve(p0, p1, p2, p3, `W-left-${laneSide}`);
    }
    // right: W -> N
    const p3: Pt = { x: xN, y: -SPAWN_BUFFER };
    const p1: Pt = { x: xL + ROAD_W * 0.15, y: yW };
    const p2: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
    return curve(p0, p1, p2, p3, `W-right-${laneSide}`);
  }

  if (dir === "N") {
    const p0: Pt = { x: xN, y: SIZE + SPAWN_BUFFER };
    if (turn === "straight") {
      const p3: Pt = { x: xN, y: -SPAWN_BUFFER };
      return line(p0, p3);
    }
    if (turn === "left") {
      // N -> W
      const p3: Pt = { x: -SPAWN_BUFFER, y: yW };
      const p1: Pt = { x: xN, y: yB - ROAD_W * 0.15 };
      const p2: Pt = { x: xL + ROAD_W * 0.15, y: yW };
      return curve(p0, p1, p2, p3, `N-left-${laneSide}`);
    }
    // right: N -> E
    const p3: Pt = { x: SIZE + SPAWN_BUFFER, y: yE };
    const p1: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
    const p2: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    return curve(p0, p1, p2, p3, `N-right-${laneSide}`);
  }

  // dir === "S"
  const p0: Pt = { x: xS, y: -SPAWN_BUFFER };
  if (turn === "straight") {
    const p3: Pt = { x: xS, y: SIZE + SPAWN_BUFFER };
    return line(p0, p3);
  }
  if (turn === "left") {
    // S -> E
    const p3: Pt = { x: SIZE + SPAWN_BUFFER, y: yE };
    const p1: Pt = { x: xS, y: yT + ROAD_W * 0.15 };
    const p2: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    return curve(p0, p1, p2, p3, `S-left-${laneSide}`);
  }
  // right: S -> W
  const p3: Pt = { x: -SPAWN_BUFFER, y: yW };
  const p1: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
  const p2: Pt = { x: xL + ROAD_W * 0.15, y: yW };
  return curve(p0, p1, p2, p3, `S-right-${laneSide}`);
}

// ===== Math utils =====
type Pt = { x: number; y: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpP(p: Pt, q: Pt, t: number): Pt {
  return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) };
}

function bezierPoint(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  const x =
    mt * mt * mt * p0.x +
    3 * mt * mt * t * p1.x +
    3 * mt * t * t * p2.x +
    t * t * t * p3.x;
  const y =
    mt * mt * mt * p0.y +
    3 * mt * mt * t * p1.y +
    3 * mt * t * t * p2.y +
    t * t * t * p3.y;
  return { x, y };
}

function bezierTangent(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  const x =
    3 * mt * mt * (p1.x - p0.x) +
    6 * mt * t * (p2.x - p1.x) +
    3 * t * t * (p3.x - p2.x);
  const y =
    3 * mt * mt * (p1.y - p0.y) +
    6 * mt * t * (p2.y - p1.y) +
    3 * t * t * (p3.y - p2.y);
  return { x, y };
}

function bezEvalWithAngle(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  const p = bezierPoint(t, p0, p1, p2, p3);
  const d = bezierTangent(t, p0, p1, p2, p3);
  const angle = (Math.atan2(d.y, d.x) * 180) / Math.PI; // deg
  return { x: p.x, y: p.y, angle };
}

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x,
    dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function bezLen(p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  // numeric approximation
  const STEPS = 28;
  let L = 0;
  let prev = p0;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const p = bezierPoint(t, p0, p1, p2, p3);
    L += dist(prev, p);
    prev = p;
  }
  return L;
}

function scanEntryExit(ctrls: [Pt, Pt, Pt, Pt]) {
  const [p0, p1, p2, p3] = ctrls;
  const c = SIZE / 2;
  const xL = c - ROAD_W / 2 + STOP_GAP;
  const xR = c + ROAD_W / 2 - STOP_GAP;
  const yT = c - ROAD_W / 2 + STOP_GAP;
  const yB = c + ROAD_W / 2 - STOP_GAP;
  const STEPS = 120;
  let stopT = 0,
    exitT = 1;
  let inside = false;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const p = bezierPoint(t, p0, p1, p2, p3);
    const inBox = p.x >= xL && p.x <= xR && p.y >= yT && p.y <= yB;
    if (!inside && inBox) {
      stopT = (i - 1) / STEPS; // last outside step
      inside = true;
    }
    if (inside && !inBox) {
      exitT = t;
      break;
    }
  }
  return { stopT, exitT };
}

function insideIntersection(x: number, y: number) {
  const c = SIZE / 2;
  const xL = c - ROAD_W / 2;
  const xR = c + ROAD_W / 2;
  const yT = c - ROAD_W / 2;
  const yB = c + ROAD_W / 2;
  return x >= xL && x <= xR && y >= yT && y <= yB;
}

// ===== Lightweight Debug Tests =====
function runDebugTests() {
  const check = (name: string, ok: boolean) => {
    if (!ok) console.warn(`[Intersection QA] Test failed: ${name}`);
  };

  // 1) requiredQuads sanity
  check("E-left uses NE", requiredQuads("E", "left").includes("NE"));
  check("S-straight reserves SE+SW",
    (() => {
      const q = requiredQuads("S", "straight");
      return q.includes("SE") && q.includes("SW");
    })()
  );

  // 2) scanEntryExit returns valid window
  const p0: Pt = { x: -SPAWN_BUFFER, y: SIZE / 2 - ROAD_W * 0.25 };
  const p3: Pt = { x: SIZE + SPAWN_BUFFER, y: p0.y };
  const { stopT, exitT } = scanEntryExit([p0, lerpP(p0, p3, 0.33), lerpP(p0, p3, 0.66), p3]);
  check("stopT < exitT", stopT < exitT);
  check("0<=stopT<1", stopT >= 0 && stopT < 1);

  // 3) insideIntersection sanity
  check("center is inside", insideIntersection(SIZE / 2, SIZE / 2) === true);
  check("origin is outside", insideIntersection(0, 0) === false);

  // 4) Thai cycle exclusivity & boundaries
  const at = (x: number) => computeThaiPhases(x);
  check('t=0 NS green/EW red', at(0).nsPhase === 'green' && at(0).ewPhase === 'red');
  check('t=7999 NS green', at(7999).nsPhase === 'green');
  check('t=8000 NS yellow', at(8000).nsPhase === 'yellow' && at(8000).ewPhase === 'red');
  check('t=10999 NS yellow', at(10999).nsPhase === 'yellow');
  check('t=11000 EW green', at(11000).ewPhase === 'green' && at(11000).nsPhase === 'red');
  check('t=18999 EW green', at(18999).ewPhase === 'green');
  check('t=19000 EW yellow', at(19000).ewPhase === 'yellow' && at(19000).nsPhase === 'red');
  check('t=21999 EW yellow', at(21999).ewPhase === 'yellow');
  const sample = [0, 2000, 8000, 12000, 16000, 21000];
  for (const k of sample) {
    const p = at(k);
    const active = (p.nsPhase !== 'red' ? 1 : 0) + (p.ewPhase !== 'red' ? 1 : 0);
    check(`exclusive active at t=${k}`, active === 1);
  }

  // 5) Periodicity: phases repeat every FULL
  const FULL = 2 * (GREEN_MS + YELLOW_MS);
  const pA = at(12345), pB = at(12345 + FULL);
  check('periodicity', pA.nsPhase === pB.nsPhase && pA.ewPhase === pB.ewPhase);

  // 6) Yellow decision helper tests
  check('yellow: near & moving proceeds', proceedOnYellow(YEL_PROCEED_PX * 0.8, false) === true);
  check('yellow: near but stopped waits', proceedOnYellow(YEL_PROCEED_PX * 0.5, true) === false);
  check('yellow: far waits', proceedOnYellow(YEL_PROCEED_PX * 1.5, false) === false);
}

// ========================= CITY SIM =========================
// A modular living city with multiple intersections, cars & pedestrians

// --- City Types ---
type RouteStep = { cx: number; cy: number; dirIn: Dir; turn: Turn };
type CityCar = Car & { route: RouteStep[]; stepIdx: number; laneSide: -1 | 1 };

type PedAxis = 'NS' | 'EW'; // which *car* axis this crosswalk controls

type Ped = {
  id: number;
  cx: number; cy: number;
  axis: PedAxis; // when cars on this axis are RED => WALK
  t: number;     // 0..1 progress across
  speed: number; // px/s equivalent on ROAD_W length
  state: 'waiting' | 'crossing';
  bornAt: number;
};

// --- City Grid ---
const CITY_N = 2; // intersections per axis (adjustable)
function buildCityGrid(n: number) {
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < n; i++) {
    xs.push(Math.round(((i + 1) / (n + 1)) * SIZE));
    ys.push(Math.round(((i + 1) / (n + 1)) * SIZE));
  }
  return { xs, ys };
}

// Scan entry/exit for an intersection at (cx, cy)
function scanEntryExitAt(cx: number, cy: number, ctrls: [Pt, Pt, Pt, Pt]) {
  const [p0, p1, p2, p3] = ctrls;
  const xL = cx - ROAD_W / 2 + STOP_GAP;
  const xR = cx + ROAD_W / 2 - STOP_GAP;
  const yT = cy - ROAD_W / 2 + STOP_GAP;
  const yB = cy + ROAD_W / 2 - STOP_GAP;
  const STEPS = 120;
  let stopT = 0, exitT = 1, inside = false;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const p = bezierPoint(t, p0, p1, p2, p3);
    const inBox = p.x >= xL && p.x <= xR && p.y >= yT && p.y <= yB;
    if (!inside && inBox) { stopT = (i - 1) / STEPS; inside = true; }
    if (inside && !inBox) { exitT = t; break; }
  }
  return { stopT, exitT };
}

// Build a Bezier path at a specific intersection center
function makePathAt(cx: number, cy: number, dir: Dir, turn: Turn, laneSide: -1 | 1): Path {
  const xL = cx - ROAD_W / 2;
  const xR = cx + ROAD_W / 2;
  const yT = cy - ROAD_W / 2;
  const yB = cy + ROAD_W / 2;

  // inbound lane centers relative to (cx,cy)
  const yE = cy - ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // from West -> East
  const yW = cy + ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // from East -> West
  const xN = cx - ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // from South -> North
  const xS = cx + ROAD_W * 0.25 + laneSide * ROAD_W * 0.14; // from North -> South

  const quads = requiredQuads(dir, turn);

  const line = (p0: Pt, p3: Pt, id: string): Path => {
    const p1 = lerpP(p0, p3, 0.33);
    const p2 = lerpP(p0, p3, 0.66);
    const len = dist(p0, p3);
    const { stopT, exitT } = scanEntryExitAt(cx, cy, [p0, p1, p2, p3]);
    return { id, len, stopT, exitT, quads, eval: (t) => bezEvalWithAngle(t, p0, p1, p2, p3) };
  };
  const curve = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, id: string): Path => {
    const len = bezLen(p0, p1, p2, p3);
    const { stopT, exitT } = scanEntryExitAt(cx, cy, [p0, p1, p2, p3]);
    return { id, len, stopT, exitT, quads, eval: (t) => bezEvalWithAngle(t, p0, p1, p2, p3) };
  };

  // path ends start/end beyond the box to next block
  const span = ROAD_W + 2 * SPAWN_BUFFER;

  if (dir === 'E') {
    const p0: Pt = { x: cx - span, y: yE };
    if (turn === 'straight') return line(p0, { x: cx + span, y: yE }, `E-straight@${cx},${cy}-${laneSide}`);
    if (turn === 'left') {
      const p3: Pt = { x: xN, y: cy - span };
      const p1: Pt = { x: xL + ROAD_W * 0.15, y: yE };
      const p2: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
      return curve(p0, p1, p2, p3, `E-left@${cx},${cy}-${laneSide}`);
    }
    const p3: Pt = { x: xS, y: cy + span };
    const p1: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    const p2: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
    return curve(p0, p1, p2, p3, `E-right@${cx},${cy}-${laneSide}`);
  }

  if (dir === 'W') {
    const p0: Pt = { x: cx + span, y: yW };
    if (turn === 'straight') return line(p0, { x: cx - span, y: yW }, `W-straight@${cx},${cy}-${laneSide}`);
    if (turn === 'left') {
      const p3: Pt = { x: xS, y: cy + span };
      const p1: Pt = { x: xR - ROAD_W * 0.15, y: yW };
      const p2: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
      return curve(p0, p1, p2, p3, `W-left@${cx},${cy}-${laneSide}`);
    }
    const p3: Pt = { x: xN, y: cy - span };
    const p1: Pt = { x: xL + ROAD_W * 0.15, y: yW };
    const p2: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
    return curve(p0, p1, p2, p3, `W-right@${cx},${cy}-${laneSide}`);
  }

  if (dir === 'N') {
    const p0: Pt = { x: xN, y: cy + span };
    if (turn === 'straight') return line(p0, { x: xN, y: cy - span }, `N-straight@${cx},${cy}-${laneSide}`);
    if (turn === 'left') {
      const p3: Pt = { x: cx - span, y: yW };
      const p1: Pt = { x: xN, y: yB - ROAD_W * 0.15 };
      const p2: Pt = { x: xL + ROAD_W * 0.15, y: yW };
      return curve(p0, p1, p2, p3, `N-left@${cx},${cy}-${laneSide}`);
    }
    const p3: Pt = { x: cx + span, y: yE };
    const p1: Pt = { x: xN, y: yT + ROAD_W * 0.15 };
    const p2: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    return curve(p0, p1, p2, p3, `N-right@${cx},${cy}-${laneSide}`);
  }

  // dir === 'S'
  const p0: Pt = { x: xS, y: cy - span };
  if (turn === 'straight') return line(p0, { x: xS, y: cy + span }, `S-straight@${cx},${cy}-${laneSide}`);
  if (turn === 'left') {
    const p3: Pt = { x: cx + span, y: yE };
    const p1: Pt = { x: xS, y: yT + ROAD_W * 0.15 };
    const p2: Pt = { x: xR - ROAD_W * 0.15, y: yE };
    return curve(p0, p1, p2, p3, `S-left@${cx},${cy}-${laneSide}`);
  }
  const p3: Pt = { x: cx - span, y: yW };
  const p1: Pt = { x: xS, y: yB - ROAD_W * 0.15 };
  const p2: Pt = { x: xL + ROAD_W * 0.15, y: yW };
  return curve(p0, p1, p2, p3, `S-right@${cx},${cy}-${laneSide}`);
}

// Route builder for a 2x2 grid (simple Manhattan routing)
function routeForSpawn(side: Dir, targetSide: Dir, laneSide: -1 | 1, grid: { xs: number[]; ys: number[] }): RouteStep[] {
  // choose row/col index based on side
  const row = rand(grid.ys);
  const col = rand(grid.xs);
  // Basic: if coming from W (E direction), pass intersections left -> right
  const steps: RouteStep[] = [];
  if (side === 'E') {
    // entering from the west edge going east across each column
    for (const cx of grid.xs) steps.push({ cx, cy: row, dirIn: 'E', turn: 'straight' });
  } else if (side === 'W') {
    for (const cx of [...grid.xs].reverse()) steps.push({ cx, cy: row, dirIn: 'W', turn: 'straight' });
  } else if (side === 'N') {
    for (const cy of grid.ys) steps.push({ cx: col, cy, dirIn: 'N', turn: 'straight' });
  } else {
    for (const cy of [...grid.ys].reverse()) steps.push({ cx: col, cy, dirIn: 'S', turn: 'straight' });
  }
  // Optionally add one turn towards targetSide at a random intersection
  const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(Math.random() * steps.length)));
  const s = steps[idx];
  if ((side === 'E' || side === 'W') && (targetSide === 'N' || targetSide === 'S')) {
    s.turn = targetSide === 'N' ? (side === 'E' ? 'left' : 'right') : (side === 'E' ? 'right' : 'left');
  } else if ((side === 'N' || side === 'S') && (targetSide === 'E' || targetSide === 'W')) {
    s.turn = targetSide === 'E' ? (side === 'N' ? 'right' : 'left') : (side === 'N' ? 'left' : 'right');
  }
  return steps;
}

function pedPhase(axis: PedAxis, ns: 'green'|'yellow'|'red', ew: 'green'|'yellow'|'red') {
  // WALK only when cars on that axis are RED
  const carPhase = axis === 'NS' ? ns : ew;
  return carPhase === 'red' ? 'walk' : 'dont';
}

// Simple conflict check: if any ped is crossing at this junction, cars yield
function junctionHasPed(cx: number, cy: number, peds: Ped[]) {
  return peds.some(p => p.cx === cx && p.cy === cy && p.state === 'crossing' && p.t < 0.92);
}

export function CitySim() {
  const grid = useMemo(() => buildCityGrid(CITY_N), []);
  const { nsPhase, ewPhase } = useTrafficCycle();

  const [cars, setCars] = useState<CityCar[]>([]);
  const [peds, setPeds] = useState<Ped[]>([]);

  // Car spawner (edges)
  useEffect(() => {
    const iv = setInterval(() => {
      if (cars.length > 60) return;
      if (Math.random() < 0.8) {
        const side: Dir = rand(['E','W','N','S'] as const as Dir[]);
        const target: Dir = rand(['E','W','N','S'] as const as Dir[]);
        const laneSide: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
        const route = routeForSpawn(side, target, laneSide, grid);
        const first = route[0];
        const path = makePathAt(first.cx, first.cy, first.dirIn, first.turn, laneSide);
        const speed = 120 + Math.random() * 70;
        const color = rand(COLORS);
        const car: CityCar = {
          id: gid++,
          dir: first.dirIn,
          turn: first.turn,
          t: 0,
          v: 0,
          speed,
          color,
          bornAt: performance.now(),
          path,
          route,
          stepIdx: 0,
          laneSide,
        };
        setCars(c => [...c, car]);
      }
    }, 420 + Math.random()*80);
    return () => clearInterval(iv);
  }, [cars.length, grid]);

  // Ped spawner (corners)
  useEffect(() => {
    const iv = setInterval(() => {
      if (peds.length > 30) return;
      if (Math.random() < 0.65) {
        const cx = rand(grid.xs); const cy = rand(grid.ys);
        const axis: PedAxis = Math.random() < 0.5 ? 'NS' : 'EW';
        const speed = 40 + Math.random() * 20; // slower than cars
        const ped: Ped = { id: gid++, cx, cy, axis, t: 0, speed, state: 'waiting', bornAt: performance.now() };
        setPeds(p => [...p, ped]);
      }
    }, 700 + Math.random()*150);
    return () => clearInterval(iv);
  }, [peds.length, grid]);

  // Simulation loop
  const loopRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastRef.current ?? ts; lastRef.current = ts;
      const dt = (ts - last) / 1000;

      // --- update pedestrians ---
      setPeds(prev => prev.map(p => {
        const phase = pedPhase(p.axis, nsPhase as any, ewPhase as any);
        const canGo = phase === 'walk';
        const length = ROAD_W; // crosswalk approx
        if (p.state === 'waiting') {
          if (canGo) return { ...p, state: 'crossing' };
          return p;
        } else {
          // crossing
          const tNext = p.t + (p.speed / Math.max(1, length)) * dt;
          return { ...p, t: tNext };
        }
      }).filter(p => p.state !== 'crossing' || p.t <= 1.02));

      // --- update cars ---
      setCars(prev => {
        const ACCEL = 320, BRAKE = 520;
        // Occupancy per junction
        const occ = new Set<string>();
        const insideNow = (c: CityCar) => c.t > c.path.stopT && c.t < c.path.exitT;
        prev.forEach(c => { if (insideNow(c)) c.path.quads.forEach(q => occ.add(`${c.path.id.split('@')[1]}:${q}`)); });

        // Order: inside first, then nearest to stop line
        const order = [...prev].sort((a,b)=>{
          const ia = insideNow(a)?-1:1, ib = insideNow(b)?-1:1; if (ia!==ib) return ia-ib;
          const da = Math.max(0, a.path.stopT - a.t), db = Math.max(0, b.path.stopT - b.t);
          return da-db;
        });
        const updated: (CityCar & { _prevT: number })[] = [];

        for (const car of order) {
          const desired_t_per_s = car.speed / Math.max(1, car.path.len);
          const beforeStop = car.t < car.path.stopT;
          const inBox = car.t >= car.path.stopT && car.t < car.path.exitT;

          // derive axis phase based on current entry dir
          const axisPhase = (car.dir === 'N' || car.dir === 'S') ? nsPhase : ewPhase;
          const distToStopPx = beforeStop ? (car.path.stopT - car.t) * Math.max(1, car.path.len) : 0;
          const startedFromStop = !inBox && car.v < 0.02 && Math.abs(car.t - car.path.stopT) < 1e-4;

          // signal permission (with yellow rule)
          let allowSignal = false;
          if (axisPhase === 'green') allowSignal = true;
          else if (axisPhase === 'yellow') allowSignal = proceedOnYellow(distToStopPx, startedFromStop);
          else allowSignal = false;

          // yield to pedestrians currently crossing at this junction
          const junctionKey = car.path.id.split('@')[1];
          const [cxStr, cyStr] = junctionKey.split('-')[0].split(',');
          const cx = parseFloat(cxStr), cy = parseFloat(cyStr);
          const pedBlock = junctionHasPed(cx, cy, peds);

          let targetV: number;
          if (inBox) targetV = desired_t_per_s; // never stop inside
          else if (beforeStop) targetV = (allowSignal && !pedBlock) ? desired_t_per_s : 0;
          else targetV = desired_t_per_s;

          const START_ACCEL = 220;
          const effAccel = (targetV > car.v && startedFromStop) ? START_ACCEL : ACCEL;
          const a_t = (targetV > car.v ? effAccel : BRAKE) / Math.max(1, car.path.len);
          let v = car.v + Math.sign(targetV - car.v) * a_t * dt;
          if ((targetV - car.v) * (targetV - v) < 0) v = targetV;
          let tNext = car.t + Math.max(0, v) * dt;

          const wantsToEnter = car.t < car.path.stopT && tNext > car.path.stopT;
          const quadsFree = () => car.path.quads.every(q => !occ.has(`${junctionKey}:${q}`));
          let canEnterNow = false;
          if (wantsToEnter) {
            const gapOK = quadsFree() && !pedBlock;
            if (car.turn === 'straight') canEnterNow = allowSignal && gapOK;
            else canEnterNow = (allowSignal && gapOK) || gapOK; // allow turn on red if gap
          }

          if (wantsToEnter && !canEnterNow) { tNext = Math.min(tNext, car.path.stopT); v = 0; }
          else if (wantsToEnter && canEnterNow) { car.path.quads.forEach(q => occ.add(`${junctionKey}:${q}`)); }
          else if (inBox) { car.path.quads.forEach(q => occ.add(`${junctionKey}:${q}`)); }

          updated.push({ ...car, t: tNext, v, _prevT: car.t });
        }

        // Headway per path
        const groups: Record<string, (CityCar & { _prevT: number })[]> = {};
        updated.forEach(c => { (groups[c.path.id] ??= []).push(c); });
        const MIN_GAP_PX = CAR_SIZE + 10;
        for (const pid in groups) {
          const arr = groups[pid].sort((a,b)=>b.t - a.t);
          for (let i=1;i<arr.length;i++) {
            const leader = arr[i-1], follower = arr[i];
            const gapT = MIN_GAP_PX / Math.max(1, follower.path.len);
            if (follower.t > leader.t - gapT) {
              follower.t = Math.max(0, leader.t - gapT);
              follower.v = Math.min(follower.v, (leader.t - gapT - follower._prevT)/Math.max(dt,1e-6));
              if (!isFinite(follower.v) || follower.v < 0) follower.v = 0;
            }
          }
        }

        // Advance to next route step or remove
        const out: CityCar[] = [];
        for (const c of updated) {
          if (c.t <= 1.02) { out.push({ ...c }); continue; }
          // finished this step
          if (c.stepIdx < c.route.length - 1) {
            const nextIdx = c.stepIdx + 1; const step = c.route[nextIdx];
            const path = makePathAt(step.cx, step.cy, step.dirIn, step.turn, c.laneSide);
            out.push({ ...c, path, dir: step.dirIn, turn: step.turn, t: 0, v: 0, stepIdx: nextIdx });
          } else {
            // exit the city (despawn)
          }
        }
        return out;
      });

      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); lastRef.current = null; };
  }, [nsPhase, ewPhase, peds]);

  // --- Render ---
  const gridBG = {
    backgroundColor: '#07090b',
    backgroundImage: 'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
    backgroundSize: `${GRID}px ${GRID}px`,
  } as React.CSSProperties;

  return (
    <div className="w-full min-h-[720px] py-8 bg-black/95 text-emerald-200">
      <div className="mx-auto max-w-[900px] px-4">
        <h1 className="text-xl font-semibold mb-4 text-emerald-300">Living City — Grid Simulation</h1>
        <p className="text-sm opacity-80 mb-4">Cars, pedestrians, lights · Thai cycle · Supabase dark theme.</p>
      </div>
      <div className="mx-auto max-w-[900px] px-4">
        <div className="relative rounded-2xl shadow-2xl overflow-hidden" style={{ width: SIZE, height: SIZE, ...gridBG }}>
          {/* Roads */}
          {/* horizontal roads */}
          {grid.ys.map((y) => (
            <div key={`h-${y}`} className="absolute left-0 right-0 bg-slate-900" style={{ top: y - ROAD_W/2, height: ROAD_W }} />
          ))}
          {/* vertical roads */}
          {grid.xs.map((x) => (
            <div key={`v-${x}`} className="absolute top-0 bottom-0 bg-slate-900" style={{ left: x - ROAD_W/2, width: ROAD_W }} />
          ))}

          {/* Buildings (blocks between roads) */}
          {grid.xs.map((x, xi) => grid.ys.map((y, yi) => {
            // draw 4 blocks around each intersection corner if within canvas bounds
            const cells: { left:number; top:number; width:number; height:number }[] = [];
            const xPrev = xi===0 ? 0 : (grid.xs[xi-1] + ROAD_W/2);
            const xNext = xi===grid.xs.length-1 ? SIZE : (grid.xs[xi] + ROAD_W/2);
            const yPrev = yi===0 ? 0 : (grid.ys[yi-1] + ROAD_W/2);
            const yNext = yi===grid.ys.length-1 ? SIZE : (grid.ys[yi] + ROAD_W/2);
            // top-left block area relative to this junction (between previous roads and current roads)
            cells.push({ left: xPrev, top: yPrev, width: (x - ROAD_W/2) - xPrev, height: (y - ROAD_W/2) - yPrev });
            return (
              <React.Fragment key={`b-${x}-${y}`}>
                {cells.map((r, idx) => (
                  <div key={idx} className="absolute bg-zinc-900/80 border border-emerald-500/10" style={{ left: r.left+6, top: r.top+6, width: Math.max(0, r.width-12), height: Math.max(0, r.height-12) }} />
                ))}
              </React.Fragment>
            );
          }))}

          {/* Intersection outlines + crosswalks + lights */}
          {grid.xs.map((x) => grid.ys.map((y) => (
            <React.Fragment key={`j-${x}-${y}`}>
              {/* box */}
              <div className="absolute border border-emerald-500/20" style={{ left: x-ROAD_W/2, top: y-ROAD_W/2, width: ROAD_W, height: ROAD_W, boxShadow: '0 0 0 1px rgba(16,185,129,0.08) inset' }} />
              {/* crosswalks (simple stripes) */}
              <div className="absolute" style={{ left: x-ROAD_W/2, top: y-ROAD_W/2-10, width: ROAD_W, height: 8, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
              <div className="absolute" style={{ left: x-ROAD_W/2, top: y+ROAD_W/2+2, width: ROAD_W, height: 8, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
              <div className="absolute" style={{ top: y-ROAD_W/2, left: x-ROAD_W/2-10, height: ROAD_W, width: 8, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
              <div className="absolute" style={{ top: y-ROAD_W/2, left: x+ROAD_W/2+2, height: ROAD_W, width: 8, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
              {/* small far-side signal heads */}
              <LightBox x={x-14} y={y-ROAD_W/2-70} orient="S" phase={nsPhase} lamps={{base:{housing:'#111827',red:'#ef4444',yellow:'#f59e0b',on:'#22c55e'}}} />
              <LightBox x={x-14} y={y+ROAD_W/2+12} orient="N" phase={nsPhase} lamps={{base:{housing:'#111827',red:'#ef4444',yellow:'#f59e0b',on:'#22c55e'}}} />
              <LightBox x={x+ROAD_W/2+12} y={y-14} orient="W" phase={ewPhase} lamps={{base:{housing:'#111827',red:'#ef4444',yellow:'#f59e0b',on:'#22c55e'}}} />
              <LightBox x={x-ROAD_W/2-70} y={y-14} orient="E" phase={ewPhase} lamps={{base:{housing:'#111827',red:'#ef4444',yellow:'#f59e0b',on:'#22c55e'}}} />
            </React.Fragment>
          ))}

          {/* Cars */}
          {cars.map((car) => {
            const { x, y, angle } = car.path.eval(car.t);
            const opacityIn = Math.min(1, (performance.now() - car.bornAt) / 600);
            const nearingEnd = car.t > 0.9 ? Math.max(0, 1 - (car.t - 0.9) / 0.1) : 1;
            const opacity = Math.min(opacityIn, nearingEnd);
            return (
              <motion.div key={`cc-${car.id}-${car.stepIdx}`} className="absolute" initial={{ opacity: 0 }} animate={{ opacity, x, y, rotate: angle }} transition={{ type: 'tween', duration: 0.12 }} style={{ left: -CAR_SIZE/2, top: -CAR_SIZE/2 }}>
                <CarSprite color={car.color} />
              </motion.div>
            );
          })}

          {/* Pedestrians */}
          {peds.map((p) => {
            // compute ped position along crosswalk
            const len = ROAD_W; const prog = Math.min(1, p.t);
            let x = p.cx, y = p.cy;
            if (p.axis === 'NS') { // crossing NS roadway => walk E-W
              x = p.cx - ROAD_W/2 + prog * ROAD_W; y = p.cy - ROAD_W/2 - 14; // slight offset
            } else { // EW roadway => walk N-S
              y = p.cy - ROAD_W/2 + prog * ROAD_W; x = p.cx - ROAD_W/2 - 14;
            }
            const color = '#67e8f9';
            return (
              <motion.div key={`pd-${p.id}`} className="absolute" style={{ left: -4, top: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1, x, y }} transition={{ type: 'tween', duration: 0.15 }}>
                <div className="rounded-full" style={{ width: 8, height: 8, background: color, boxShadow: `0 0 10px ${color}` }} />
              </motion.div>
            );
          })}

          {/* HUD */}
          <div className="absolute right-3 top-3 text-xs bg-black/50 backdrop-blur rounded-lg px-3 py-2 border border-emerald-500/20">
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> <span>NS: {nsPhase.toUpperCase()}</span></div>
            <div className="flex items-center gap-2 mt-1"><span className="inline-block w-2 h-2 rounded-full bg-cyan-400" /> <span>EW: {ewPhase.toUpperCase()}</span></div>
            <div className="opacity-70 mt-1">Cars: {cars.length} · Peds: {peds.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { IntersectionDemo };
export default CitySim;
