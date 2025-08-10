import React from 'react'

export function FrameworksBandResponsive() {
  const items = [
    { label: 'React',    Icon: IconReact },
    { label: 'Next.js',  Icon: IconNext },
    { label: 'RedwoodJS',Icon: IconRedwood },
    { label: 'Flutter',  Icon: IconFlutter },
    { label: 'Kotlin',   Icon: IconKotlin },
    { label: 'Svelte',   Icon: IconSvelte },
    { label: 'SolidJS',  Icon: IconSolid },
    { label: 'Vue',      Icon: IconVue },
    { label: 'Next.js',  Icon: IconNext },
    { label: 'Refine',   Icon: IconRefine },
  ] as const

  const [activeName, setActiveName] = React.useState('React')
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null)

  return (
    <section className="w-full max-w-[1150px] mx-auto [container-type:inline-size]">
      {/* band */}
      <div className="band grid items-center h-[90px] [grid-template-columns:420px_1fr]">
        {/* text block (moves on top at <1150px) */}
        <div className="leading-none">
          <div className="text-[28px] font-semibold text-white/60">Use NetXO with</div>
          <div className="text-[36px] font-bold text-white">{activeName}</div>
        </div>

        {/* icons (wrap to 2 then 3 rows as container shrinks) */}
        <ul
          className="icons m-0 p-0 list-none flex items-center justify-start gap-[9px]"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {items.map(({ label, Icon }, i) => {
            const isHover = hoveredIdx === i
            const isDim = hoveredIdx !== null && hoveredIdx !== i
            return (
              <li key={`${label}-${i}`}>
                <button
                  type="button"
                  aria-label={label}
                  onMouseEnter={() => {
                    setHoveredIdx(i)
                    setActiveName(label)
                  }}
                  onFocus={() => {
                    setHoveredIdx(i)
                    setActiveName(label)
                  }}
                  className={[
                    'group w-[66px] h-[66px] grid place-items-center rounded-[12px]',
                    'ring-1 transition duration-150 ease-out',
                    isHover ? 'ring-white' : 'ring-transparent focus-visible:ring-white',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-10 w-10 transition duration-150 ease-out',
                      isHover
                        ? 'fill-white opacity-100 scale-[1.03]'
                        : isDim
                        ? 'fill-white/60 opacity-40'
                        : 'fill-white/60 opacity-100',
                    ].join(' ')}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* --- Minimalist SVG placeholders (swap for official brand icons when ready) --- */
function IconReact({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IconNext({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
      <text x="8.5" y="16" fontFamily="ui-sans-serif,system-ui" fontSize="10" fill="currentColor">
        N
      </text>
    </svg>
  )
}
function IconRedwood({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2l5 9H7l5-9z" />
      <rect x="11" y="11" width="2" height="10" rx="1" />
    </svg>
  )
}
function IconFlutter({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M14 3L4 13l3 3 13-13h-6zM7 19l4 4 3-3-4-4-3 3z" />
    </svg>
  )
}
function IconKotlin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M3 3h18L12 12 21 21H3V3z" />
    </svg>
  )
}
function IconSvelte({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M16 3c-2-1-4-1-6 .5L6 6.2C4 7.4 3.4 9.8 4.5 11.8c1.2 2 3.8 2.7 5.8 1.5l4-2.3c1-.6 1.3-1.9.7-2.9-.6-1-1.9-1.3-2.9-.7l-4 2.3c-.9.5-2 .2-2.5-.7-.5-.9-.2-2 .7-2.5l4-2.3C12.3 3.2 14 3.3 15.3 4" />
      <path d="M8 21c2 1 4 1 6-.5l4-2.3c2-1.2 2.6-3.6 1.5-5.6-1.2-2-3.8-2.7-5.8-1.5l-4 2.3c-1 .6-1.3 1.9-.7 2.9.6 1 1.9 1.3 2.9.7l4-2.3c.9-.5 2-.2 2.5.7.5.9.2 2-.7 2.5l-4 2.3C11.7 20.8 10 20.7 8.7 20" />
    </svg>
  )
}
function IconSolid({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 3c-3 0-5 2-5 5 0 5 5 7 5 13 0-6 5-8 5-13 0-3-2-5-5-5z" />
    </svg>
  )
}
function IconVue({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M2 4h6l4 7 4-7h6L12 22 2 4z" />
    </svg>
  )
}
function IconRefine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="4" y="6" width="16" height="3" rx="1.5" />
      <rect x="4" y="11" width="12" height="3" rx="1.5" />
      <rect x="4" y="16" width="8" height="3" rx="1.5" />
    </svg>
  )
}
