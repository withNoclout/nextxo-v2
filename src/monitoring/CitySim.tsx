import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Extracted from large prototype file, trimmed and adapted.
// Living city grid simulation with cars + pedestrians + signals.

const SIZE = 680
const ROAD_W = 220
const GRID = 24
const CAR_SIZE = 18
const SPAWN_BUFFER = 90
const STOP_GAP = 10
const GREEN_MS = 8000
const YELLOW_MS = 3000
const YEL_PROCEED_PX = CAR_SIZE * 1.2
const COLORS = ['#22c55e', '#10b981', '#2dd4bf', '#a3e635', '#67e8f9', '#86efac']

const DIRS = ['E','W','N','S'] as const
const TURNS = ['straight','left','right'] as const

type Dir = typeof DIRS[number]
type Turn = typeof TURNS[number]

type Quad = 'NW'|'NE'|'SW'|'SE'

type Path = { id:string; len:number; stopT:number; exitT:number; quads:Quad[]; eval:(t:number)=>{x:number;y:number;angle:number} }

type Car = { id:number; dir:Dir; turn:Turn; t:number; v:number; speed:number; color:string; bornAt:number; path:Path }

type RouteStep = { cx:number; cy:number; dirIn:Dir; turn:Turn }

type CityCar = Car & { route:RouteStep[]; stepIdx:number; laneSide:-1|1 }

type PedAxis = 'NS'|'EW'

type Ped = { id:number; cx:number; cy:number; axis:PedAxis; t:number; speed:number; state:'waiting'|'crossing'; bornAt:number }

let gid = 10000

function useTrafficCycle(){ const [ms,setMs]=useState(0); useEffect(()=>{const id=setInterval(()=>setMs(t=>t+100),100); return ()=>clearInterval(id)},[]); return computeThaiPhases(ms) }
function computeThaiPhases(ms:number){ type Phase='green'|'yellow'|'red'; const G=GREEN_MS,Y=YELLOW_MS,FULL=2*(G+Y); const t=((ms%FULL)+FULL)%FULL; let nsPhase:Phase, ewPhase:Phase; if(t<G){nsPhase='green';ewPhase='red'} else if(t<G+Y){nsPhase='yellow';ewPhase='red'} else if(t<G+Y+G){nsPhase='red';ewPhase='green'} else {nsPhase='red';ewPhase='yellow'}; return { nsPhase, ewPhase } }
const proceedOnYellow=(distPx:number,wasStopped:boolean)=> distPx<=YEL_PROCEED_PX && !wasStopped
const rand = <T,>(a:T[])=> a[Math.floor(Math.random()*a.length)]

function requiredQuads(dir:Dir, turn:Turn):Quad[]{ if(dir==='E'){ if(turn==='left') return ['NE']; if(turn==='right') return ['SE']; return ['NE','SE']} if(dir==='W'){ if(turn==='left') return ['SW']; if(turn==='right') return ['NW']; return ['NW','SW']} if(dir==='N'){ if(turn==='left') return ['NW']; if(turn==='right') return ['NE']; return ['NE','NW']} if(turn==='left') return ['SE']; if(turn==='right') return ['SW']; return ['SE','SW'] }

// math helpers
interface Pt {x:number;y:number}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
const lerpP=(p:Pt,q:Pt,t:number):Pt=>({x:lerp(p.x,q.x,t),y:lerp(p.y,q.y,t)})
const dist=(a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y)
function bezPoint(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const mt=1-t; return {x: mt*mt*mt*p0.x+3*mt*mt*t*p1.x+3*mt*t*t*p2.x+t*t*t*p3.x, y: mt*mt*mt*p0.y+3*mt*mt*t*p1.y+3*mt*t*t*p2.y+t*t*t*p3.y}}
function bezTan(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const mt=1-t; return {x:3*mt*mt*(p1.x-p0.x)+6*mt*t*(p2.x-p1.x)+3*t*t*(p3.x-p2.x), y:3*mt*mt*(p1.y-p0.y)+6*mt*t*(p2.y-p1.y)+3*t*t*(p3.y-p2.y)}}
function bezEval(t:number,p0:Pt,p1:Pt,p2:Pt,p3:Pt){const p=bezPoint(t,p0,p1,p2,p3); const d=bezTan(t,p0,p1,p2,p3); const angle=Math.atan2(d.y,d.x)*180/Math.PI; return {x:p.x,y:p.y,angle}}
function bezLen(p0:Pt,p1:Pt,p2:Pt,p3:Pt){const STEPS=28; let L=0, prev=p0; for(let i=1;i<=STEPS;i++){const t=i/STEPS; const p=bezPoint(t,p0,p1,p2,p3); L+=dist(prev,p); prev=p} return L }

function scanEntryExitAt(cx:number,cy:number,[p0,p1,p2,p3]:[Pt,Pt,Pt,Pt]){ const xL=cx-ROAD_W/2+STOP_GAP, xR=cx+ROAD_W/2-STOP_GAP, yT=cy-ROAD_W/2+STOP_GAP, yB=cy+ROAD_W/2-STOP_GAP; const STEPS=120; let stopT=0, exitT=1, inside=false; for(let i=0;i<=STEPS;i++){const t=i/STEPS; const p=bezPoint(t,p0,p1,p2,p3); const inBox=p.x>=xL&&p.x<=xR&&p.y>=yT&&p.y<=yB; if(!inside&&inBox){stopT=(i-1)/STEPS; inside=true} if(inside&&!inBox){exitT=t; break}} return { stopT, exitT } }

function makePathAt(cx:number,cy:number,dir:Dir,turn:Turn,laneSide:-1|1):Path{ const xL=cx-ROAD_W/2,xR=cx+ROAD_W/2,yT=cy-ROAD_W/2,yB=cy+ROAD_W/2; const yE=cy-ROAD_W*0.25+laneSide*ROAD_W*0.14, yW=cy+ROAD_W*0.25+laneSide*ROAD_W*0.14, xN=cx-ROAD_W*0.25+laneSide*ROAD_W*0.14, xS=cx+ROAD_W*0.25+laneSide*ROAD_W*0.14; const quads=requiredQuads(dir,turn); const line=(p0:Pt,p3:Pt,id:string):Path=>{const p1=lerpP(p0,p3,0.33),p2=lerpP(p0,p3,0.66); const len=dist(p0,p3); const {stopT,exitT}=scanEntryExitAt(cx,cy,[p0,p1,p2,p3]); return {id,len,stopT,exitT,quads, eval:t=>bezEval(t,p0,p1,p2,p3)}}; const curve=(p0:Pt,p1:Pt,p2:Pt,p3:Pt,id:string):Path=>{const len=bezLen(p0,p1,p2,p3); const {stopT,exitT}=scanEntryExitAt(cx,cy,[p0,p1,p2,p3]); return {id,len,stopT,exitT,quads,eval:t=>bezEval(t,p0,p1,p2,p3)}}; const span=ROAD_W+2*SPAWN_BUFFER; if(dir==='E'){const p0:Pt={x:cx-span,y:yE}; if(turn==='straight') return line(p0,{x:cx+span,y:yE},`E-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){const p3:Pt={x:xN,y:cy-span}; const p1:Pt={x:xL+ROAD_W*0.15,y:yE}; const p2:Pt={x:xN,y:yT+ROAD_W*0.15}; return curve(p0,p1,p2,p3,`E-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:xS,y:cy+span}; const p1:Pt={x:xR-ROAD_W*0.15,y:yE}; const p2:Pt={x:xS,y:yB-ROAD_W*0.15}; return curve(p0,p1,p2,p3,`E-right@${cx},${cy}-${laneSide}`)} if(dir==='W'){const p0:Pt={x:cx+span,y:yW}; if(turn==='straight') return line(p0,{x:cx-span,y:yW},`W-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){const p3:Pt={x:xS,y:cy+span}; const p1:Pt={x:xR-ROAD_W*0.15,y:yW}; const p2:Pt={x:xS,y:yB-ROAD_W*0.15}; return curve(p0,p1,p2,p3,`W-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:xN,y:cy-span}; const p1:Pt={x:xL+ROAD_W*0.15,y:yW}; const p2:Pt={x:xN,y:yT+ROAD_W*0.15}; return curve(p0,p1,p2,p3,`W-right@${cx},${cy}-${laneSide}`)} if(dir==='N'){const p0:Pt={x:xN,y:cy+span}; if(turn==='straight') return line(p0,{x:xN,y:cy-span},`N-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){const p3:Pt={x:cx-span,y:yW}; const p1:Pt={x:xN,y:yB-ROAD_W*0.15}; const p2:Pt={x:xL+ROAD_W*0.15,y:yW}; return curve(p0,p1,p2,p3,`N-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:cx+span,y:yE}; const p1:Pt={x:xN,y:yT+ROAD_W*0.15}; const p2:Pt={x:xR-ROAD_W*0.15,y:yE}; return curve(p0,p1,p2,p3,`N-right@${cx},${cy}-${laneSide}`)} const p0:Pt={x:xS,y:cy-span}; if(turn==='straight') return line(p0,{x:xS,y:cy+span},`S-straight@${cx},${cy}-${laneSide}`); if(turn==='left'){const p3:Pt={x:cx+span,y:yE}; const p1:Pt={x:xS,y:yT+ROAD_W*0.15}; const p2:Pt={x:xR-ROAD_W*0.15,y:yE}; return curve(p0,p1,p2,p3,`S-left@${cx},${cy}-${laneSide}`)} const p3:Pt={x:cx-span,y:yW}; const p1:Pt={x:xS,y:yB-ROAD_W*0.15}; const p2:Pt={x:xL+ROAD_W*0.15,y:yW}; return curve(p0,p1,p2,p3,`S-right@${cx},${cy}-${laneSide}`) }

const CITY_N = 2
function buildCityGrid(n:number){ const xs:number[]=[], ys:number[]=[]; for(let i=0;i<n;i++){ xs.push(Math.round(((i+1)/(n+1))*SIZE)); ys.push(Math.round(((i+1)/(n+1))*SIZE)) } return { xs, ys } }
function routeForSpawn(side:Dir,target:Dir,laneSide:-1|1,grid:{xs:number[];ys:number[]}):RouteStep[]{ const row=rand(grid.ys), col=rand(grid.xs); const steps:RouteStep[]=[]; if(side==='E'){ for(const cx of grid.xs) steps.push({cx,cy:row,dirIn:'E',turn:'straight'}) } else if(side==='W'){ for(const cx of [...grid.xs].reverse()) steps.push({cx,cy:row,dirIn:'W',turn:'straight'}) } else if(side==='N'){ for(const cy of grid.ys) steps.push({cx:col,cy,dirIn:'N',turn:'straight'}) } else { for(const cy of [...grid.ys].reverse()) steps.push({cx:col,cy,dirIn:'S',turn:'straight'}) } const idx=Math.min(steps.length-1,Math.max(0,Math.floor(Math.random()*steps.length))); const s=steps[idx]; if((side==='E'||side==='W')&&(target==='N'||target==='S')){ s.turn= target==='N' ? (side==='E'?'left':'right') : (side==='E'?'right':'left') } else if((side==='N'||side==='S')&&(target==='E'||target==='W')){ s.turn = target==='E' ? (side==='N'?'right':'left') : (side==='N'?'left':'right') } return steps }
const pedPhase=(axis:PedAxis,ns:string,ew:string)=> (axis==='NS'?ns:ew)==='red' ? 'walk':'dont'
const junctionHasPed=(cx:number,cy:number,peds:Ped[])=> peds.some(p=>p.cx===cx && p.cy===cy && p.state==='crossing' && p.t<0.92)

export default function CitySim(){
  const grid=useMemo(()=>buildCityGrid(CITY_N),[])
  const { nsPhase, ewPhase } = useTrafficCycle()
  const [cars,setCars]=useState<CityCar[]>([])
  const [peds,setPeds]=useState<Ped[]>([])

  // car spawner
  useEffect(()=>{ const iv=setInterval(()=>{ if(cars.length>60) return; if(Math.random()<0.8){ const side:Dir=rand([...DIRS]); const target:Dir=rand([...DIRS]); const laneSide = Math.random()<0.5 ? -1:1; const route=routeForSpawn(side,target,laneSide,grid); const first=route[0]; const path=makePathAt(first.cx,first.cy,first.dirIn,first.turn,laneSide); const car:CityCar={ id:gid++, dir:first.dirIn, turn:first.turn, t:0,v:0, speed:120+Math.random()*70, color:rand(COLORS), bornAt:performance.now(), path, route, stepIdx:0, laneSide }; setCars(c=>[...c,car]) } }, 420+Math.random()*80); return ()=>clearInterval(iv) }, [cars.length,grid])
  // pedestrian spawner
  useEffect(()=>{ const iv=setInterval(()=>{ if(peds.length>30) return; if(Math.random()<0.65){ const ped:Ped={ id:gid++, cx:rand(grid.xs), cy:rand(grid.ys), axis: Math.random()<0.5? 'NS':'EW', t:0, speed:40+Math.random()*20, state:'waiting', bornAt:performance.now() }; setPeds(p=>[...p,ped]) } }, 700+Math.random()*150); return ()=>clearInterval(iv)}, [peds.length,grid])

  const loopRef=useRef<number|null>(null); const lastRef=useRef<number|null>(null)
  useEffect(()=>{ const tick=(ts:number)=>{ const last=lastRef.current??ts; lastRef.current=ts; const dt=(ts-last)/1000
  setPeds(prev=>prev.map(p=>{ const phase=pedPhase(p.axis,nsPhase,ewPhase); if(p.state==='waiting'){ if(phase==='walk') return {...p,state:'crossing' as const}; return p } const tNext=p.t + (p.speed/Math.max(1,ROAD_W))*dt; return {...p,t:tNext} }).filter(p=> p.state!=='crossing' || p.t<=1.02))
    setCars(prev=>updateCars(prev,dt,nsPhase,ewPhase,peds))
    loopRef.current=requestAnimationFrame(tick)
  }; loopRef.current=requestAnimationFrame(tick); return ()=>{ if(loopRef.current) cancelAnimationFrame(loopRef.current); lastRef.current=null } }, [nsPhase,ewPhase,peds])

  const gridBG:React.CSSProperties={ backgroundColor:'#07090b', backgroundImage:'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)', backgroundSize:`${GRID}px ${GRID}px` }

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <div className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden" style={gridBG}>
          {/* roads */}
          {grid.ys.map(y=> <div key={`h-${y}`} className="absolute left-0 right-0 bg-slate-900" style={{ top: y-ROAD_W/2, height: ROAD_W }} />)}
          {grid.xs.map(x=> <div key={`v-${x}`} className="absolute top-0 bottom-0 bg-slate-900" style={{ left: x-ROAD_W/2, width: ROAD_W }} />)}
          {/* intersection + crosswalks + lights */}
          {grid.xs.map(x=> grid.ys.map(y=> <React.Fragment key={`j-${x}-${y}`}>
            <div className="absolute border border-emerald-500/20" style={{ left:x-ROAD_W/2, top:y-ROAD_W/2, width:ROAD_W, height:ROAD_W, boxShadow:'0 0 0 1px rgba(16,185,129,0.08) inset' }} />
            <div className="absolute" style={{ left:x-ROAD_W/2, top:y-ROAD_W/2-10, width:ROAD_W, height:8, backgroundImage:'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
            <div className="absolute" style={{ left:x-ROAD_W/2, top:y+ROAD_W/2+2, width:ROAD_W, height:8, backgroundImage:'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
            <div className="absolute" style={{ top:y-ROAD_W/2, left:x-ROAD_W/2-10, height:ROAD_W, width:8, backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
            <div className="absolute" style={{ top:y-ROAD_W/2, left:x+ROAD_W/2+2, height:ROAD_W, width:8, backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 12px, transparent 12px 24px)' }} />
          </React.Fragment>))}

          {/* cars */}
          {cars.map(car=>{ const {x,y,angle}=car.path.eval(car.t); const opacityIn=Math.min(1,(performance.now()-car.bornAt)/600); const nearingEnd=car.t>0.9?Math.max(0,1-(car.t-0.9)/0.1):1; const opacity=Math.min(opacityIn,nearingEnd); return <motion.div key={`c-${car.id}-${car.stepIdx}`} className="absolute" initial={{opacity:0}} animate={{opacity,x,y,rotate:angle}} transition={{type:'tween',duration:0.12}} style={{ left:-CAR_SIZE/2, top:-CAR_SIZE/2 }}><CarSprite color={car.color} /></motion.div> })}
          {/* pedestrians */}
          {peds.map(p=>{ const prog=Math.min(1,p.t); let x=p.cx, y=p.cy; if(p.axis==='NS'){ x=p.cx-ROAD_W/2 + prog*ROAD_W; y=p.cy-ROAD_W/2-14 } else { y=p.cy-ROAD_W/2 + prog*ROAD_W; x=p.cx-ROAD_W/2-14 } const color='#67e8f9'; return <motion.div key={`pd-${p.id}`} className="absolute" style={{ left:-4, top:-4 }} initial={{opacity:0}} animate={{opacity:1,x,y}} transition={{type:'tween',duration:0.15}}><div className="rounded-full" style={{ width:8, height:8, background:color, boxShadow:`0 0 10px ${color}` }} /></motion.div> })}
          {/* HUD */}
          <div className="absolute right-3 top-3 text-xs bg-black/50 backdrop-blur rounded-lg px-3 py-2 border border-emerald-500/20 text-emerald-200">
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> <span>NS: {nsPhase.toUpperCase()}</span></div>
            <div className="flex items-center gap-2 mt-1"><span className="inline-block w-2 h-2 rounded-full bg-cyan-400" /> <span>EW: {ewPhase.toUpperCase()}</span></div>
            <div className="opacity-70 mt-1">Cars: {cars.length} · Peds: {peds.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function updateCars(prev:CityCar[],dt:number,nsPhase:string,ewPhase:string,peds:Ped[]):CityCar[]{ const ACCEL=320,BRAKE=520; const inside=(c:CityCar)=>c.t>c.path.stopT && c.t<c.path.exitT; const occ=new Set<string>(); prev.forEach(c=>{ if(inside(c)) c.path.quads.forEach(q=>occ.add(`${c.path.id.split('@')[1]}:${q}`)) })
  const order=[...prev].sort((a,b)=>{const ia=inside(a)?-1:1, ib=inside(b)?-1:1; if(ia!==ib) return ia-ib; const da=Math.max(0,a.path.stopT-a.t), db=Math.max(0,b.path.stopT-b.t); return da-db })
  const upd:(CityCar & {_prevT:number})[]=[]
  for(const car of order){ const desired=car.speed/Math.max(1,car.path.len); const beforeStop=car.t<car.path.stopT; const inBox=car.t>=car.path.stopT && car.t<car.path.exitT; const axisPhase=(car.dir==='N'||car.dir==='S')?nsPhase:ewPhase; const distToStop=beforeStop? (car.path.stopT-car.t)*Math.max(1,car.path.len):0; const startedFromStop=!inBox && car.v<0.02 && Math.abs(car.t-car.path.stopT)<1e-4; let allow=false; if(axisPhase==='green') allow=true; else if(axisPhase==='yellow') allow=proceedOnYellow(distToStop,startedFromStop); const junctionKey=car.path.id.split('@')[1]; const [cxStr,cyStr]=junctionKey.split('-')[0].split(','); const pedBlock=junctionHasPed(parseFloat(cxStr),parseFloat(cyStr),peds); let targetV:number; if(inBox) targetV=desired; else if(beforeStop) targetV=(allow && !pedBlock)?desired:0; else targetV=desired; const START_ACCEL=220; const effAccel=(targetV>car.v && startedFromStop)?START_ACCEL:ACCEL; const a_t=(targetV>car.v?effAccel:BRAKE)/Math.max(1,car.path.len); let v=car.v+Math.sign(targetV-car.v)*a_t*dt; if((targetV-car.v)*(targetV-v)<0) v=targetV; let tNext=car.t+Math.max(0,v)*dt; const wantsEnter=car.t<car.path.stopT && tNext>car.path.stopT; const quadsFree=()=>car.path.quads.every(q=>!occ.has(`${junctionKey}:${q}`)); let canEnter=false; if(wantsEnter){ const gapOK=quadsFree() && !pedBlock; if(car.turn==='straight') canEnter=allow && gapOK; else canEnter = gapOK && (allow || true) } if(wantsEnter && !canEnter){ tNext=Math.min(tNext,car.path.stopT); v=0 } else if(wantsEnter && canEnter){ car.path.quads.forEach(q=>occ.add(`${junctionKey}:${q}`)) } else if(inBox){ car.path.quads.forEach(q=>occ.add(`${junctionKey}:${q}`)) } upd.push({...car,t:tNext,v,_prevT:car.t}) }
  // headway
  const groups:Record<string,(CityCar & {_prevT:number})[]>={}; upd.forEach(c=>{ (groups[c.path.id]??=[]).push(c) })
  const MIN_GAP=CAR_SIZE+10; for(const pid in groups){ const arr=groups[pid].sort((a,b)=>b.t-a.t); for(let i=1;i<arr.length;i++){ const lead=arr[i-1], foll=arr[i]; const gapT=MIN_GAP/Math.max(1,foll.path.len); if(foll.t>lead.t-gapT){ foll.t=Math.max(0,lead.t-gapT); foll.v=Math.min(foll.v,(lead.t-gapT-foll._prevT)/Math.max(1e-6,dt)); if(!isFinite(foll.v)||foll.v<0) foll.v=0 } } }
  // step transitions
  const out:CityCar[]=[]; for(const c of upd){ if(c.t<=1.02){ out.push({...c}); continue } if(c.stepIdx < c.route.length-1){ const nextIdx=c.stepIdx+1; const step=c.route[nextIdx]; const path=makePathAt(step.cx,step.cy,step.dirIn,step.turn,c.laneSide); out.push({...c,path,dir:step.dirIn,turn:step.turn,t:0,v:0,stepIdx:nextIdx}) } }
  return out }

function CarSprite({ color }:{color:string}){ return <div className="relative" style={{ width:CAR_SIZE, height:CAR_SIZE, background:color, borderRadius:4, boxShadow:'0 0 0 1px rgba(0,0,0,0.35) inset, 0 6px 14px rgba(0,0,0,0.45)' }} /> }
