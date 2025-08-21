import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GridNode {
  id: number;
  x: number;
  y: number;
  department: string;
  throughput: number; // 0..1
  isCritical?: boolean;
}
interface GridEdge {
  id: number;
  from: GridNode;
  to: GridNode;
  throughput: number; // 0..1
  speed: number; // affects pulse animation
  isCritical?: boolean;
}

const DEPARTMENTS = [
  'Finance','HR','IT','Marketing','Operations','Sales','Legal','R&D','Supply','Service','Quality','Security','Analytics','Procure','Facilities','Comms','Training','Compliance','Product','Engineering'
];

export const TrafficPanel: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ rows = 4, cols = 5, className = '' }) => {
  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [edges, setEdges] = useState<GridEdge[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // init nodes in grid layout
    const created: GridNode[] = [];
    const w = 750; const h = 550; // panel dims
    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const idx = r*cols + c;
        created.push({
          id: idx,
          x: (c+0.5) * (w/cols) + (Math.random()-0.5)*30,
          y: (r+0.5) * (h/rows) + (Math.random()-0.5)*25,
          department: DEPARTMENTS[idx % DEPARTMENTS.length],
          throughput: Math.random(),
          isCritical: Math.random() < 0.15
        });
      }
    }
    // edges (random adjacency)
    const createdEdges: GridEdge[] = [];
    for (let i=0; i<created.length; i++) {
      for (let j=i+1; j<created.length; j++) {
        if (Math.random() < 0.15) {
          createdEdges.push({
            id: createdEdges.length,
            from: created[i],
            to: created[j],
            throughput: Math.random(),
            speed: 0.6 + Math.random()*1.2,
            isCritical: Math.random() < 0.1
          });
        }
      }
    }
    setNodes(created);
    setEdges(createdEdges);
    setMounted(true);
  }, [rows, cols]);

  // periodic update
  useEffect(() => {
    const id = setInterval(() => {
      setNodes(prev => prev.map(n => ({ ...n, throughput: Math.random() })));
      setEdges(prev => prev.map(e => ({ ...e, throughput: Math.random(), speed: 0.6 + Math.random()*1.2 })));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative w-[750px] h-[550px] bg-black/30 border border-white/10 rounded-xl overflow-hidden ${className}`}>      
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.95 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <svg className="absolute inset-0 w-full h-full">
          {/* edges behind */}
          {edges.map((e) => {
            const opacity = 0.15 + e.throughput * 0.5;
            const stroke = e.isCritical ? '#f87171' : 'rgba(94,234,212,0.6)';
            const width = 1 + e.throughput * 2;
            return (
              <line key={e.id} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={stroke} strokeWidth={width} strokeOpacity={opacity} />
            );
          })}
          {/* nodes */}
          {nodes.map(n => {
            const glow = 4 + n.throughput * 14;
            const base = n.isCritical ? '#f87171' : '#34d399';
            return (
              <g key={n.id}>
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={12 + n.throughput * 6}
                  fill={base}
                  fillOpacity={0.25 + n.throughput * 0.3}
                  stroke={base}
                  strokeWidth={1.5}
                  style={{ filter: `drop-shadow(0 0 ${glow}px ${base})` }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.8 + Math.random()*0.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <text x={n.x} y={n.y + 26} textAnchor="middle" className="fill-white/80 text-[10px] select-none font-medium">
                  {n.department}
                </text>
              </g>
            );
          })}
        </svg>
        {/* gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(52,211,153,0.15),transparent_60%)]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/40" />
      </motion.div>
    </div>
  );
};
