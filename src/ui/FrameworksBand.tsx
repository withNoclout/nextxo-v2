import React from 'react'

export function FrameworksBand() {
  const items = [
    { label: 'React', Icon: IconReact },
    { label: 'Next.js', Icon: IconNext },
    { label: 'Astro', Icon: IconAstro },
    { label: 'Flutter', Icon: IconFlutter },
    { label: 'Kotlin', Icon: IconKotlin },
    { label: 'Svelte', Icon: IconSvelte },
    { label: 'Swift', Icon: IconSwift },
    { label: 'Vue', Icon: IconVue },
    { label: 'Nuxt', Icon: IconNuxt },
    { label: 'Remix', Icon: IconRemix },
  ] as const

  const [activeName, setActiveName] = React.useState('SolidJS')

  return (
    <section className="mt-[250px] max-w-[1375px] mx-auto">
      <div className="grid grid-cols-12 items-center gap-6">
        {/* Left text */}
        <div className="col-span-12 md:col-span-5">
          <div className="leading-none">
            <div className="text-[32px] md:text-[36px] font-semibold text-white/60">
              Use NetXO with
            </div>
            <div className="mt-1 text-[44px] md:text-[56px] font-bold text-white">
              {activeName}
            </div>
          </div>
        </div>

        {/* Right icon rail */}
        <div className="col-span-12 md:col-span-7">
          <ul
            className="flex flex-wrap md:flex-nowrap items-center gap-10 md:gap-14 justify-start md:justify-end"
          >
            {items.map(({ label, Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  aria-label={label}
                  onMouseEnter={() => setActiveName(label)}
                  onFocus={() => setActiveName(label)}
                  className="outline-none group rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span className="sr-only">{label}</span>
                  <Icon className="h-12 w-12 md:h-14 md:w-14 fill-white/60 group-hover:fill-white transition-all duration-150 ease-out group-hover:scale-[1.03] focus-visible:scale-[1.03]" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* --- Minimal inline SVGs (swap with official brand assets for exact logos) --- */
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
function IconAstro({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 3l6 12H6L12 3z" />
      <circle cx="12" cy="19" r="3" opacity="0.3" />
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
function IconSwift({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M20 4c.7 0 1 .3 1 1v14c0 .7-.3 1-1 1H4c-.7 0-1-.3-1-1V5c0-.7.3-1 1-1h16zM7 8l4 4-6-3 7 7c3-1 4-3 4-5 0-1-.3-2-.8-3l-2.8 1.4L7 8z" />
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
function IconNuxt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M3 18l6-11 6 11H3zM9 18l3-6 3 6H9z" />
    </svg>
  )
}
function IconRemix({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="11" opacity="0.15" />
      <rect x="6" y="8" width="12" height="3" rx="1.5" />
      <rect x="6" y="13" width="8" height="3" rx="1.5" />
    </svg>
  )
}
