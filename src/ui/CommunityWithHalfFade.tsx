import React, { useLayoutEffect, useRef, useState } from 'react'
import { GitHubIcon } from './icons'

export function CommunityWithHalfFade({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const leftBtnRef = useRef<HTMLAnchorElement | null>(null)
  const rightBtnRef = useRef<HTMLAnchorElement | null>(null)

  const [pos, setPos] = useState<{ cx: number | string; cy: number }>({ cx: '50%', cy: 220 })

  useLayoutEffect(() => {
    function calc() {
      if (!wrapRef.current || !leftBtnRef.current || !rightBtnRef.current) return
      const wrap = wrapRef.current.getBoundingClientRect()
      const a = leftBtnRef.current.getBoundingClientRect()
      const b = rightBtnRef.current.getBoundingClientRect()
      const cx = (a.right + b.left) / 2 - wrap.left
      const cy = (a.top + a.bottom) / 2 - wrap.top
      setPos({ cx, cy })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const styleVars = {
    ['--cx' as any]: typeof pos.cx === 'number' ? `${pos.cx}px` : pos.cx,
    ['--cy' as any]: `${pos.cy}px`,
  } as React.CSSProperties

  return (
    <section ref={wrapRef} className="relative w-full overflow-hidden mt-[1080px] font-brooklyn">
      {/* Title */}
      <h2 className="text-[30px] text-center text-white font-semibold">Join the community</h2>
      <p className="mt-[35px] text-[15px] text-center text-white/80">
        Discover what our community has to say about their Supabase experience.
      </p>

      {/* Buttons row */}
      <div className="mt-[40px] flex justify-center gap-3">
        <a
          ref={leftBtnRef}
          href="#"
          className="inline-flex h-[35px] items-center px-4 rounded-xl border border-white/30 bg-[#161616] text-white text-[15px]"
        >
          <GitHubIcon aria-hidden="true" className="h-[18px] w-[18px] mr-2 fill-white/70" />
          GitHub discussions
        </a>
        <a
          ref={rightBtnRef}
          href="#"
          className="inline-flex h-[35px] items-center px-4 rounded-xl border border-white/30 bg-[#161616] text-white text-[15px]"
        >
          <DiscordIcon aria-hidden="true" className="h-[18px] w-[18px] mr-2 fill-white/70" />
          Discord
        </a>
      </div>

      {/* Your moving cards panel goes here */}
      <div className="mt-[40px]">
        {children}
      </div>

      {/* HALF-CIRCLE FADE (bottom only) */}
      <div
        className="
          pointer-events-none absolute inset-0
          [--cx:50%] [--cy:220px] [--r:580px]
          [background:radial-gradient(circle_at_var(--cx)_var(--cy),
            rgba(0,0,0,0) var(--r),
            rgba(0,0,0,.70) calc(var(--r) + 160px),
            rgba(0,0,0,.90) 100%)]
          [clip-path:inset(var(--cy)_0_0_0)]
        "
        style={styleVars}
      />
    </section>
  )
}

function DiscordIcon({ className = '', ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-3.94 0 c-.16-.38-.39-.87-.59-1.23-1.38.25-2.73.68-3.76 1.37C4.18 7.22 3.81 10.02 3.98 12.79c1.62 1.2 3.2 1.93 4.74 2.41 .38-.52.72-1.07 1.02-1.65-.56-.21-1.09-.47-1.6-.77.13-.1.26-.2.38-.3 3 1.4 6.27 1.4 9.25 0 .13.1.25.2.38.3-.5.3-1.04.56-1.6.77.3.58.64 1.13 1.02 1.65 1.54-.48 3.12-1.21 4.74-2.41.23-3.65-.38-6.42-2.18-8.42zM9.7 12.35c-.72 0-1.31-.66-1.31-1.47 0-.81.58-1.47 1.31-1.47.73 0 1.32.66 1.31 1.47 0 .81-.58 1.47-1.31 1.47zm4.61 0c-.72 0-1.31-.66-1.31-1.47 0-.81.58-1.47 1.31-1.47.73 0 1.32.66 1.31 1.47 0 .81-.59 1.47-1.31 1.47z"/>
    </svg>
  )
}
