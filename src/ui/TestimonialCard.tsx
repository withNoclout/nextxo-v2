import type { Testimonial } from './mockTestimonials'

export function TestimonialCard({
  t,
  size = 'A', // "A" => 305x275, "B" => 305x295
  ml = 0,
}: {
  t: Testimonial
  size?: 'A' | 'B'
  ml?: number
}) {
  const h = size === 'A' ? 275 : 295

  return (
    <article
      style={{ marginLeft: ml }}
      className={`
        relative w-[305px] h-[${h}px] rounded-[22px]
        border border-white/10 bg-white/[.035] hover:bg-white/[.06]
        shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]
        transition p-4 text-white/80 flex flex-col
      `}
      aria-label={`${t.username} post`}
      title={t.username}
    >
      {/* platform badge in the TOP-RIGHT */}
      <PlatformBadge platform={t.platform} className="absolute top-3 right-3" />

      {/* header row */}
      <div className="flex items-center gap-3 pr-6">
        <Avatar seed={t.username} />
        <span className="text-[15px] leading-5 text-white font-medium">
          {t.username}
        </span>
      </div>

      {/* body (Thai) */}
      <p className="mt-3 text-[14px] leading-[22px] text-white/85 whitespace-pre-line">
        {t.text}
      </p>
    </article>
  )
}

/* 16x16 X/Discord badge */
function PlatformBadge({ platform, className = '' }: { platform: 'x' | 'discord'; className?: string }) {
  return (
    <div className={`h-4 w-4 rounded-full bg-black/80 flex items-center justify-center border border-white/20 ${className}`}>
      {platform === 'x' ? (
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white">
          <path d="M18.9 3H21l-6.51 7.44L22 21h-6.79l-5.32-6.38L3.6 21H1.5l7.01-8-7-10h6.86l4.8 5.77L18.9 3Zm-2.37 16h1.77L7.58 5H5.73l10.8 14Z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white">
          <path d="M20.32 4.37A19.8 19.8 0 0 0 16.56 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-3.94 0c-.16-.38-.39-.87-.59-1.23-1.38.25-2.73.68-3.76 1.37C4.18 7.22 3.81 10.02 3.98 12.79c1.62 1.2 3.2 1.93 4.74 2.41.38-.52.72-1.07 1.02-1.65-.56-.21-1.09-.47-1.6-.77.13-.1.26-.2.38-.3 3 1.4 6.27 1.4 9.25 0 .13.1.25.2.38.3-.5.3-1.04.56-1.6.77.3.58.64 1.13 1.02 1.65 1.54-.48 3.12-1.21 4.74-2.41.23-3.65-.38-6.42-2.18-8.42z"/>
        </svg>
      )}
    </div>
  )
}

/* Simple generated avatar (no external images) */
function Avatar({ seed }: { seed: string }) {
  const hue = [...seed].reduce((a, c) => (a + c.charCodeAt(0)) % 360, 0) // deterministic color
  const initials = seed
    .replace('@', '')
    .split('.')
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
  return (
    <div
      className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-[11px] font-semibold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 18%), hsl(${(hue + 40) % 360} 60% 28%))`,
      }}
      aria-hidden
    >
      {initials || 'MU'}
    </div>
  )
}
