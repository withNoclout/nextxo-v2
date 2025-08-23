import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ===== Constants & Scaling =====
const PANEL_H = 550 // height stays fixed; width becomes responsive
const WORLD_W = 1600, WORLD_H = 1200 // virtual canvas
const ROAD_W = 100 // shrunken road width
const CAR_SIZE = 8
const PED_SIZE = 6
const STOP_GAP = 5
const GREEN_MS = 8000, YELLOW_MS = 3000
const SPAWN_BUFFER = 40
const YEL_PROCEED_PX = CAR_SIZE * 1.2
const COLORS = ['#22c55e','#10b981','#2dd4bf','#a3e635','#67e8f9','#86efac']
const CITY_N = 4 // 4x4 intersections

// ===== Types =====
const DIRS = ['E','W','N','S'] as const
const TURNS = ['straight','left','right'] as const
type Dir = typeof DIRS[number]
type Turn = typeof TURNS[number]
type Quad = 'NW'|'NE'|'SW'|'SE'
type Pt = {x:number;y:number}
type Path = { id:string; len:number; stopT:number; exitT:number; quads:Quad[]; eval:(t:number)=>{x:number;y:number;angle:number} }
type Car = { id:number; dir:Dir; turn:Turn; t:number; v:number; speed:number; color:string; bornAt:number; path:Path; route:RouteStep[]; stepIdx:number; laneSide:-1|1 }
type RouteStep = { cx:number; cy:number; dirIn:Dir; turn:Turn }
type PedAxis = 'NS'|'EW'
type Ped = { id:number; cx:number; cy:number; axis:PedAxis; t:number; speed:number; state:'waiting'|'crossing'; bornAt:number }

let gid = 1

// ===== Utility Math =====
const lerp = (a:number,b:number,t:number)=>a+(b-a)*t
const lerpP = (p:Pt,q:Pt,t:number):Pt=>({x:lerp(p.x,q.x,t),y:lerp(p.y,q.y,t)})
const dist = (a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y)
function bezPoint(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const mt=1-t; return {x: mt*mt*mt*p0.x+3*mt*mt*t*p1.x+3*mt*t*t*p2.x+t*t*t*p3.x, y: mt*mt*mt*p0.y+3*mt*mt*t*p1.y+3*mt*t*t*p2.y+t*t*t*p3.y}}
function bezTan(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const mt=1-t; return {x:3*mt*mt*(p1.x-p0.x)+6*mt*t*(p2.x-p1.x)+3*t*t*(p3.x-p2.x), y:3*mt*mt*(p1.y-p0.y)+6*mt*t*(p2.y-p1.y)+3*t*t*(p3.y-p2.y)}}
function bezEval(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const p=bezPoint(t,p0,p1,p2,p3); const d=bezTan(t,p0,p1,p2,p3); return {x:p.x,y:p.y,angle:Math.atan2(d.y,d.x)*180/Math.PI}}
function bezLen(p0:Pt,p1:Pt,p2:Pt,p3:Pt){const STEPS=24; let L=0, prev=p0; for(let i=1;i<=STEPS;i++){const p=bezPoint(i/STEPS,p0,p1,p2,p3); L+=dist(prev,p); prev=p} return L }

// ===== Traffic Phases =====
function computePhases(ms:number){ const G=GREEN_MS,Y=YELLOW_MS,FULL=2*(G+Y); const t=((ms%FULL)+FULL)%FULL; if(t<G) return {ns:'green',ew:'red'} as const; if(t<G+Y) return {ns:'yellow',ew:'red'} as const; if(t<G+Y+G) return {ns:'red',ew:'green'} as const; return {ns:'red',ew:'yellow'} as const }
const proceedOnYellow=(distPx:number,wasStopped:boolean)=> distPx<=YEL_PROCEED_PX && !wasStopped
const rand = <T,>(a:T[])=> a[Math.floor(Math.random()*a.length)]

// ===== Geometry Helpers =====
function requiredQuads(dir:Dir,turn:Turn):Quad[]{ if(dir==='E'){ if(turn==='left') return ['NE']; if(turn==='right') return ['SE']; return ['NE','SE']} if(dir==='W'){ if(turn==='left') return ['SW']; if(turn==='right') return ['NW']; return ['NW','SW']} if(dir==='N'){ if(turn==='left') return ['NW']; if(turn==='right') return ['NE']; return ['NE','NW']} if(turn==='left') return ['SE']; if(turn==='right') return ['SW']; return ['SE','SW'] }
function scanEntryExit(cx:number,cy:number,pts:[Pt,Pt,Pt,Pt]){ const [p0,p1,p2,p3]=pts; const xL=cx-ROAD_W/2+STOP_GAP,xR=cx+ROAD_W/2-STOP_GAP,yT=cy-ROAD_W/2+STOP_GAP,yB=cy+ROAD_W/2-STOP_GAP; const STEPS=90; let stopT=0, exitT=1, inside=false; for(let i=0;i<=STEPS;i++){ const t=i/STEPS; const p=bezPoint(t,p0,p1,p2,p3); const inBox=p.x>=xL&&p.x<=xR&&p.y>=yT&&p.y<=yB; if(!inside && inBox){ stopT=(i-1)/STEPS; inside=true } if(inside && !inBox){ exitT=t; break } } return { stopT, exitT } }
function makePathAt(cx:number,cy:number,dir:Dir,turn:Turn,laneSide:-1|1):Path { const xL=cx-ROAD_W/2,xR=cx+ROAD_W/2,yT=cy-ROAD_W/2,yB=cy+ROAD_W/2; const yE=cy-ROAD_W*0.25+laneSide*ROAD_W*0.14,yW=cy+ROAD_W*0.25+laneSide*ROAD_W*0.14,xN=cx-ROAD_W*0.25+laneSide*ROAD_W*0.14,xS=cx+ROAD_W*0.25+laneSide*ROAD_W*0.14; const quads=requiredQuads(dir,turn); const span=ROAD_W+2*SPAWN_BUFFER; const line=(p0:Pt,p3:Pt,id:string):Path=>{const p1=lerpP(p0,p3,0.33),p2=lerpP(p0,p3,0.66); const len=dist(p0,p3); const {stopT,exitT}=scanEntryExit(cx,cy,[p0,p1,p2,p3]); return {id,len,stopT,exitT,quads,eval:t=>bezEval(t,p0,p1,p2,p3)}}; const curve=(p0:Pt,p1:Pt,p2:Pt,p3:Pt,id:string):Path=>{const len=bezLen(p0,p1,p2,p3); const {stopT,exitT}=scanEntryExit(cx,cy,[p0,p1,p2,p3]); return {id,len,stopT,exitT,quads,eval:t=>bezEval(t,p0,p1,p2,p3)}}; if(dir==='E'){const p0:Pt={x:cx-span,y:yE}; if(turn==='straight') return line(p0,{x:cx+span,y:yE},`E-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){ const p3:Pt={x:xN,y:cy-span}; const p1:Pt={x:xL+ROAD_W*0.2,y:yE}; const p2:Pt={x:xN,y:yT+ROAD_W*0.2}; return curve(p0,p1,p2,p3,`E-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:xS,y:cy+span}; const p1:Pt={x:xR-ROAD_W*0.2,y:yE}; const p2:Pt={x:xS,y:yB-ROAD_W*0.2}; return curve(p0,p1,p2,p3,`E-right@${cx},${cy}-${laneSide}`)} if(dir==='W'){const p0:Pt={x:cx+span,y:yW}; if(turn==='straight') return line(p0,{x:cx-span,y:yW},`W-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){ const p3:Pt={x:xS,y:cy+span}; const p1:Pt={x:xR-ROAD_W*0.2,y:yW}; const p2:Pt={x:xS,y:yB-ROAD_W*0.2}; return curve(p0,p1,p2,p3,`W-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:xN,y:cy-span}; const p1:Pt={x:xL+ROAD_W*0.2,y:yW}; const p2:Pt={x:xN,y:yT+ROAD_W*0.2}; return curve(p0,p1,p2,p3,`W-right@${cx},${cy}-${laneSide}`)} if(dir==='N'){const p0:Pt={x:xN,y:cy+span}; if(turn==='straight') return line(p0,{x:xN,y:cy-span},`N-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){ const p3:Pt={x:cx-span,y:yW}; const p1:Pt={x:xN,y:yB-ROAD_W*0.2}; const p2:Pt={x:xL+ROAD_W*0.2,y:yW}; return curve(p0,p1,p2,p3,`N-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:cx+span,y:yE}; const p1:Pt={x:xN,y:yT+ROAD_W*0.2}; const p2:Pt={x:xR-ROAD_W*0.2,y:yE}; return curve(p0,p1,p2,p3,`N-right@${cx},${cy}-${laneSide}`)} const p0:Pt={x:xS,y:cy-span}; if(turn==='straight') return line(p0,{x:xS,y:cy+span},`S-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){ const p3:Pt={x:cx+span,y:yE}; const p1:Pt={x:xS,y:yT+ROAD_W*0.2}; const p2:Pt={x:xR-ROAD_W*0.2,y:yE}; return curve(p0,p1,p2,p3,`S-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:cx-span,y:yW}; const p1:Pt={x:xS,y:yB-ROAD_W*0.2}; const p2:Pt={x:xL+ROAD_W*0.2,y:yW}; return curve(p0,p1,p2,p3,`S-right@${cx},${cy}-${laneSide}`) }

// ===== Grid =====
function buildCityGrid(n:number){ const xs:number[]=[], ys:number[]=[]; for(let i=0;i<n;i++){ xs.push(Math.round(((i+1)/(n+1))*WORLD_W)); ys.push(Math.round(((i+1)/(n+1))*WORLD_H)) } return { xs, ys } }
function routeForSpawn(side:Dir,target:Dir,laneSide:-1|1,grid:{xs:number[];ys:number[]}):RouteStep[]{ const row=rand(grid.ys), col=rand(grid.xs); const steps:RouteStep[]=[]; if(side==='E'){ for(const cx of grid.xs) steps.push({cx,cy:row,dirIn:'E',turn:'straight'}) } else if(side==='W'){ for(const cx of [...grid.xs].reverse()) steps.push({cx,cy:row,dirIn:'W',turn:'straight'}) } else if(side==='N'){ for(const cy of grid.ys) steps.push({cx:col,cy,dirIn:'N',turn:'straight'}) } else { for(const cy of [...grid.ys].reverse()) steps.push({cx:col,cy,dirIn:'S',turn:'straight'}) } const idx=Math.floor(Math.random()*steps.length); const s=steps[idx]; if((side==='E'||side==='W')&&(target==='N'||target==='S')) s.turn = target==='N' ? (side==='E'?'left':'right') : (side==='E'?'right':'left'); else if((side==='N'||side==='S')&&(target==='E'||target==='W')) s.turn = target==='E' ? (side==='N'?'right':'left') : (side==='N'?'left':'right'); return steps }
const pedPhase=(axis:PedAxis,ns:string,ew:string)=> (axis==='NS'?ns:ew)==='red' ? 'walk':'wait'
const junctionHasPed=(cx:number,cy:number,peds:Ped[])=> peds.some(p=>p.cx===cx && p.cy===cy && p.state==='crossing' && p.t<0.92)

// ===== Simulation Component =====
interface CitySimProps { desiredHeight?: number }

export default function CitySim({ desiredHeight }: CitySimProps){
  const grid = useMemo(()=>buildCityGrid(CITY_N),[])
  const [ms,setMs] = useState(0)
  const phases = computePhases(ms)
  useEffect(()=>{ const id=setInterval(()=>setMs(t=>t+100),100); return ()=>clearInterval(id) },[])
  const [cars,setCars] = useState<Car[]>([])
  const [peds,setPeds] = useState<Ped[]>([])
  const pedsRef = useRef<Ped[]>([])
  useEffect(()=>{ pedsRef.current = peds },[peds])

  // Spawners (use functional updates to avoid length deps)
  useEffect(()=>{ const iv=setInterval(()=>{ setCars(prev=>{ if(prev.length>140 || Math.random()>=0.8) return prev; const side:Dir=rand([...DIRS]); const target:Dir=rand([...DIRS]); const laneSide: -1|1 = Math.random()<0.5? -1:1; const route=routeForSpawn(side,target,laneSide,grid); const first=route[0]; const path=makePathAt(first.cx,first.cy,first.dirIn,first.turn,laneSide); const speed=90+Math.random()*55; return [...prev,{ id:gid++, dir:first.dirIn, turn:first.turn, t:0,v:0,speed,color:rand(COLORS),bornAt:performance.now(), path, route, stepIdx:0, laneSide }] }) }, 420); return ()=>clearInterval(iv) },[grid])
  useEffect(()=>{ const iv=setInterval(()=>{ setPeds(prev=>{ if(prev.length>80 || Math.random()>=0.6) return prev; const ped:Ped={ id:gid++, cx:rand(grid.xs), cy:rand(grid.ys), axis: Math.random()<0.5?'NS':'EW', t:0, speed:25+Math.random()*20, state:'waiting', bornAt:performance.now() }; return [...prev,ped] }) }, 750); return ()=>clearInterval(iv)},[grid])

  // Tick loop (phases change via ms; peds via ref)
  const lastRef = useRef<number|undefined>()
  const phasesRef = useRef(phases)
  useEffect(()=>{ phasesRef.current = phases },[phases])
  useEffect(()=>{ const frame=(ts:number)=>{ const last=lastRef.current??ts; lastRef.current=ts; const dt=(ts-last)/1000; // pedestrians update
    setPeds(prev=>prev.map(p=>{ const phase=pedPhase(p.axis,phasesRef.current.ns,phasesRef.current.ew); if(p.state==='waiting'){ if(phase==='walk') return {...p,state:'crossing' as const}; return p } const tNext=p.t + (p.speed/ROAD_W)*dt; return {...p,t:tNext} }).filter(p=> p.state!=='crossing' || p.t<=1.02));
    setCars(prev=>advanceCars(prev,dt,phasesRef.current.ns,phasesRef.current.ew,pedsRef.current));
    requestAnimationFrame(frame)
  }; const id=requestAnimationFrame(frame); return ()=>cancelAnimationFrame(id) },[])

  // ===== Rendering prep =====
  const containerRef = useRef<HTMLDivElement|null>(null)
  const [panelW,setPanelW] = useState(750)
  // measure width
  useEffect(()=>{ function measure(){ if(containerRef.current){ setPanelW(containerRef.current.clientWidth) } } measure(); window.addEventListener('resize',measure); return ()=>window.removeEventListener('resize',measure) },[])
  const panelHeight = desiredHeight ?? PANEL_H
  const scale = Math.min(panelW/WORLD_W, panelHeight/WORLD_H)
  const worldStyle: React.CSSProperties = { width: WORLD_W, height: WORLD_H, transform:`scale(${scale})`, transformOrigin:'top left', position:'relative' }
  const gridBG: React.CSSProperties = { backgroundColor:'#07090b', backgroundImage:'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)', backgroundSize:'30px 30px' }

  return (
    <div ref={containerRef} className="relative rounded-xl border border-white/10 bg-black/50 overflow-hidden" style={{ width:'100%', height:panelHeight }}>
      <div style={worldStyle}>
        <div className="absolute inset-0" style={gridBG} />
        {/* Roads */}
  {grid.ys.map((y:number)=> <div key={`h-${y}`} className="absolute left-0 right-0 bg-slate-900" style={{ top:y-ROAD_W/2, height:ROAD_W }} />)}
  {grid.xs.map((x:number)=> <div key={`v-${x}`} className="absolute top-0 bottom-0 bg-slate-900" style={{ left:x-ROAD_W/2, width:ROAD_W }} />)}
        {/* Sidewalk strips */}
  {grid.ys.map((y:number)=> <React.Fragment key={`sy-${y}`}><div className="absolute left-0 right-0 bg-zinc-800/70" style={{ top:y-ROAD_W/2-5, height:5 }} /><div className="absolute left-0 right-0 bg-zinc-800/70" style={{ top:y+ROAD_W/2, height:5 }} /></React.Fragment>)}
  {grid.xs.map((x:number)=> <React.Fragment key={`sx-${x}`}><div className="absolute top-0 bottom-0 bg-zinc-800/70" style={{ left:x-ROAD_W/2-5, width:5 }} /><div className="absolute top-0 bottom-0 bg-zinc-800/70" style={{ left:x+ROAD_W/2, width:5 }} /></React.Fragment>)}
        {/* Buildings (blocks) */}
        {(() => { const nodes:React.ReactNode[]=[]; for(let xi=0; xi<=grid.xs.length; xi++){ const xPrev= xi===0?0: grid.xs[xi-1]+ROAD_W/2; const xNext= xi===grid.xs.length? WORLD_W: grid.xs[xi]-ROAD_W/2; if(xNext-xPrev < 30) continue; for(let yi=0; yi<=grid.ys.length; yi++){ const yPrev= yi===0?0: grid.ys[yi-1]+ROAD_W/2; const yNext= yi===grid.ys.length? WORLD_H: grid.ys[yi]-ROAD_W/2; if(yNext-yPrev < 30) continue; const pad=12; nodes.push(<div key={`b-${xi}-${yi}`} className="absolute bg-zinc-900/80 border border-emerald-500/10" style={{ left:xPrev+pad, top:yPrev+pad, width:Math.max(0,xNext-xPrev-pad*2), height:Math.max(0,yNext-yPrev-pad*2) }} />) } } return nodes })()}
        {/* Intersections + Crosswalks */}
  {grid.xs.map((x:number)=> grid.ys.map((y:number)=> <React.Fragment key={`ix-${x}-${y}`}>
          <div className="absolute border border-emerald-500/15" style={{ left:x-ROAD_W/2, top:y-ROAD_W/2, width:ROAD_W, height:ROAD_W, boxShadow:'0 0 0 1px rgba(16,185,129,0.04) inset' }} />
          <div className="absolute" style={{ left:x-ROAD_W/2, top:y-ROAD_W/2-4, width:ROAD_W, height:3, backgroundImage:'repeating-linear-gradient(90deg,#ffffffcc 0 8px,transparent 8px 16px)' }} />
          <div className="absolute" style={{ left:x-ROAD_W/2, top:y+ROAD_W/2+1, width:ROAD_W, height:3, backgroundImage:'repeating-linear-gradient(90deg,#ffffffcc 0 8px,transparent 8px 16px)' }} />
          <div className="absolute" style={{ top:y-ROAD_W/2, left:x-ROAD_W/2-4, height:ROAD_W, width:3, backgroundImage:'repeating-linear-gradient(0deg,#ffffffcc 0 8px,transparent 8px 16px)' }} />
          <div className="absolute" style={{ top:y-ROAD_W/2, left:x+ROAD_W/2+1, height:ROAD_W, width:3, backgroundImage:'repeating-linear-gradient(0deg,#ffffffcc 0 8px,transparent 8px 16px)' }} />
        </React.Fragment>))}
        {/* Cars */}
  {cars.map(car=>{ const {x,y,angle}=car.path.eval(car.t); const fadeIn=Math.min(1,(performance.now()-car.bornAt)/500); const fadeOut = car.t>0.95 ? Math.max(0,1-(car.t-0.95)/0.05):1; const opacity=Math.min(fadeIn,fadeOut); return <motion.div key={`car-${car.id}-${car.stepIdx}`} className="absolute" initial={{opacity:0}} animate={{opacity,x,y,rotate:angle}} transition={{type:'tween',duration:0.1}} style={{ left:-CAR_SIZE/2, top:-CAR_SIZE/2 }}><div style={{ width:CAR_SIZE,height:CAR_SIZE,background:car.color,borderRadius:2,boxShadow:'0 0 4px rgba(0,0,0,0.6),0 0 6px 1px rgba(16,185,129,0.25)' }} /></motion.div> })}
        {/* Pedestrians */}
  {peds.map(p=>{ const prog=Math.min(1,p.t); let x=p.cx,y=p.cy; if(p.axis==='NS'){ x = p.cx-ROAD_W/2 + prog*ROAD_W; y = p.cy-ROAD_W/2-8 } else { y = p.cy-ROAD_W/2 + prog*ROAD_W; x = p.cx-ROAD_W/2-8 } const color='#67e8f9'; return <motion.div key={`ped-${p.id}`} className="absolute" style={{ left:-PED_SIZE/2, top:-PED_SIZE/2 }} initial={{opacity:0}} animate={{opacity:1,x,y}} transition={{type:'tween',duration:0.15}}><div style={{ width:PED_SIZE,height:PED_SIZE,background:color,borderRadius:'50%',boxShadow:`0 0 6px ${color}` }} /></motion.div> })}
      </div>
      {/* HUD Overlay */}
      <div className="absolute right-2 top-2 text-[10px] bg-black/60 backdrop-blur rounded-md px-2 py-1 border border-emerald-500/20 text-emerald-200 leading-tight">
        <div className="flex gap-1"><span className="text-emerald-400">NS</span><span>{phases.ns.toUpperCase()}</span></div>
        <div className="flex gap-1"><span className="text-cyan-400">EW</span><span>{phases.ew.toUpperCase()}</span></div>
        <div className="mt-0.5">Ped NS: {pedPhase('NS',phases.ns,phases.ew)==='walk'?'WALK':'WAIT'}</div>
        <div>Ped EW: {pedPhase('EW',phases.ns,phases.ew)==='walk'?'WALK':'WAIT'}</div>
        <div className="mt-0.5 opacity-70">Cars {cars.length} · Peds {peds.length}</div>
      </div>
    </div>
  )
}

// ===== Car Advancement =====
function advanceCars(prev:Car[],dt:number,nsPhase:string,ewPhase:string,peds:Ped[]):Car[]{
  const ACC=240, BRAKE=420
  const inside=(c:Car)=>c.t>c.path.stopT && c.t<c.path.exitT
  const occ=new Set<string>()
  prev.forEach(c=>{ if(inside(c)) c.path.quads.forEach(q=>occ.add(`${c.path.id.split('@')[1]}:${q}`)) })
  const order=[...prev].sort((a,b)=>{ const ia=inside(a)?-1:1, ib=inside(b)?-1:1; if(ia!==ib) return ia-ib; const da=Math.max(0,a.path.stopT-a.t), db=Math.max(0,b.path.stopT-b.t); return da-db })
  const upd:(Car & {_prevT:number})[]=[]
  for(const car of order){
    const desired=car.speed/Math.max(1,car.path.len)
    const before=car.t<car.path.stopT
    const inBox=car.t>=car.path.stopT && car.t<car.path.exitT
    const axisPhase=(car.dir==='N'||car.dir==='S')?nsPhase:ewPhase
    const distToStop=before?(car.path.stopT-car.t)*car.path.len:0
    const startedStop=!inBox && car.v<0.02 && Math.abs(car.t-car.path.stopT)<1e-4
    let allow=false
    if(axisPhase==='green') allow=true; else if(axisPhase==='yellow') allow=proceedOnYellow(distToStop,startedStop)
    const junctionKey=car.path.id.split('@')[1]
    const [cxStr,cyStr]=junctionKey.split('-')[0].split(',')
    const pedBlock=junctionHasPed(parseFloat(cxStr),parseFloat(cyStr),peds)
    let targetV:number
    if(inBox) targetV=desired; else if(before) targetV=(allow && !pedBlock)?desired:0; else targetV=desired
    const effAcc=(targetV>car.v && startedStop)?(ACC*0.6):ACC
    const a_t=(targetV>car.v?effAcc:BRAKE)/Math.max(1,car.path.len)
    let v=car.v + Math.sign(targetV-car.v)*a_t*dt
    if((targetV-car.v)*(targetV-v)<0) v=targetV
    let tNext=car.t + Math.max(0,v)*dt
    const wantsEnter=car.t<car.path.stopT && tNext>car.path.stopT
    const quadsFree=()=>car.path.quads.every(q=>!occ.has(`${junctionKey}:${q}`))
    if(wantsEnter){
      const gapOK=quadsFree() && !pedBlock
      let can=false
      if(car.turn==='straight') can=allow && gapOK; else can=gapOK && (allow || true)
      if(!can){ tNext=Math.min(tNext,car.path.stopT); v=0 } else car.path.quads.forEach(q=>occ.add(`${junctionKey}:${q}`))
    } else if(inBox){
      car.path.quads.forEach(q=>occ.add(`${junctionKey}:${q}`))
    }
    upd.push({...car,t:tNext,v,_prevT:car.t})
  }
  // headway
  const groups:Record<string,(Car & {_prevT:number})[]>={}
  upd.forEach(c=>{ (groups[c.path.id]??=[]).push(c) })
  const MIN_GAP=CAR_SIZE+6
  for(const pid in groups){
    const arr=groups[pid].sort((a,b)=>b.t-a.t)
    for(let i=1;i<arr.length;i++){
      const lead=arr[i-1], foll=arr[i]
      const gapT=MIN_GAP/Math.max(1,foll.path.len)
      if(foll.t>lead.t-gapT){
        foll.t=Math.max(0,lead.t-gapT)
        foll.v=Math.min(foll.v,(lead.t-gapT-foll._prevT)/Math.max(1e-5,dt))
        if(!isFinite(foll.v)||foll.v<0) foll.v=0
      }
    }
  }
  // advance / despawn
  const next:Car[]=[]
  for(const c of upd){
    if(c.t<=1.01){ const {_prevT,...rest}=c; next.push(rest) ; continue }
    if(c.stepIdx < c.route.length-1){
      const step=c.route[c.stepIdx+1]
      const path=makePathAt(step.cx,step.cy,step.dirIn,step.turn,c.laneSide)
      const {_prevT,...rest}=c
      next.push({...rest,path,dir:step.dirIn,turn:step.turn,t:0,v:0,stepIdx:c.stepIdx+1})
    }
  }
  return next
}

// (sprite already inline in render for simplicity)
