import React, { useState, useRef, useEffect } from 'react'

interface ProductItem {
  id: string
  label: string
  icon?: React.ReactNode // optional icon; blank if not provided
}

interface ProductSubNavProps {
  items: ProductItem[]
  current: string
  onChange?: (id: string) => void
}

// Lightweight, self‑contained product secondary nav (100px bar, underline active style)
export default function ProductSubNav({ items, current, onChange }: ProductSubNavProps) {
  const [active, setActive] = useState(current)
  const listRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => { setActive(current) }, [current])
  useEffect(() => { if(onChange) onChange(active) }, [active, onChange])

  function onKey(e: React.KeyboardEvent, idx: number) {
    if(e.key === 'ArrowRight') { const n = (idx + 1) % items.length; setActive(items[n].id); tabRefs.current[items[n].id]?.focus(); e.preventDefault() }
    else if(e.key === 'ArrowLeft') { const p = (idx - 1 + items.length) % items.length; setActive(items[p].id); tabRefs.current[items[p].id]?.focus(); e.preventDefault() }
  }

  return (
  <div className="w-full bg-[#0a0a0a] border-b border-white/5" style={{height: '50px'}}>
      <div className="max-w-[1350px] mx-auto h-full px-6 flex items-center">
  <div ref={listRef} role="tablist" aria-label="Products" className="flex items-center gap-[25px] overflow-x-auto no-scrollbar w-full" style={{ transform: 'translateX(-29px)' }}>
          {items.map((it, i) => {
            const isActive = it.id === active
            return (
              <button
                key={it.id}
                ref={el => tabRefs.current[it.id] = el}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(it.id)}
                onKeyDown={e => onKey(e, i)}
                className={`relative flex items-center gap-2 px-1 py-1 h-10 text-[13px] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${isActive ? 'text-[rgba(255,255,255,0.95)]' : 'text-[rgba(255,255,255,0.65)] hover:text-[rgba(255,255,255,0.85)]'}`}
              >
                <span className="inline-flex items-center justify-center w-[15px] h-[15px] flex-shrink-0" aria-hidden>
                  {it.icon || <span />}
                </span>
                <span className="leading-none relative">{it.label}
                  {/* tiny underline aligned with main underline */}
                  <span aria-hidden className="block absolute left-1/2 -translate-x-1/2" style={{bottom: -10, height: 2, width: isActive ? 24 : 0, background: isActive ? 'rgba(255,255,255,0.85)' : 'transparent', transition: 'width 240ms ease-out', borderRadius: 2}} />
                </span>
                <span aria-hidden className="absolute left-1/2 -translate-x-1/2" style={{bottom: -10, height: 2, width: isActive ? 44 : 0, background: isActive ? 'rgba(255,255,255,0.85)' : 'transparent', transition: 'width 260ms ease-out', borderRadius: 2}} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
