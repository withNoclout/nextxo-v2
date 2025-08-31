import React, { useCallback, useEffect, useRef, useState } from 'react'

type Tab = { id: string; label: string }

interface TabsWithDropdownProps {
  tabs?: Tab[]
  initial?: string
  onChange?: (id: string) => void
  className?: string
}

const DEFAULT_TABS: Tab[] = [
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'optimization', label: 'Optimization' },
  { id: 'reporting', label: 'Reporting' },
]

export default function TabsWithDropdown({
  tabs = DEFAULT_TABS,
  initial,
  onChange,
  className = '',
}: TabsWithDropdownProps) {
  const firstId = tabs[0]?.id
  const [active, setActive] = useState<string>(initial || firstId)
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Notify parent when active changes
  useEffect(() => { if (active && onChange) onChange(active) }, [active, onChange])

  const currentTab = tabs.find(t => t.id === active) || tabs[0]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(ev: MouseEvent) {
      const target = ev.target as Node
      if (btnRef.current && btnRef.current.contains(target)) return
      if (menuRef.current && menuRef.current.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('mousedown', handle)
    return () => window.removeEventListener('mousedown', handle)
  }, [open])

  // Keyboard handling for button & menu
  const onKeyDownButton = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) }
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
  }

  const onKeyDownMenu = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btnRef.current?.focus() }
  }

  const selectTab = useCallback((id: string) => {
    setActive(id)
    setOpen(false)
  }, [])

  return (
    <div className={`w-full max-w-[1350px] mx-auto px-6 ${className}`}>
      <div className="flex items-center justify-between gap-6">
        {/* Horizontal tab list (desktop) */}
        <nav role="tablist" aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm">
          {tabs.map(t => {
            const isActive = t.id === active
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => selectTab(t.id)}
                className={`relative pb-2 transition-colors whitespace-nowrap border-b-2 ${isActive ? 'text-white border-emerald-500' : 'border-transparent text-white/60 hover:text-white/85'} focus:outline-none focus-visible:text-white`}
              >
                {t.label}
              </button>
            )
          })}
        </nav>
        {/* Compact dropdown trigger (always visible) */}
        <div className="ml-auto relative">
          <button
            ref={btnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            onKeyDown={onKeyDownButton}
            className="inline-flex items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
          >
            <span>{currentTab?.label}</span>
            <Caret open={open} />
          </button>
          {open && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Select section"
              onKeyDown={onKeyDownMenu}
              className="absolute right-0 mt-2 w-56 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 shadow-lg py-2 z-40"
            >
              {tabs.map(t => {
                const isActive = t.id === active
                return (
                  <button
                    key={t.id}
                    role="menuitem"
                    aria-pressed={isActive}
                    onClick={() => selectTab(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus:bg-white/10 ${isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                    {isActive ? <CheckIcon /> : <span className="w-4" />}
                    <span className="flex-1">{t.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-white/70 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-emerald-400"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}
