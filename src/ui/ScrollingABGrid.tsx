import React from 'react'

/* 640px tall, two rows, 40px below the previous section */
export function ScrollingABGrid() {
  return (
    <section className="relative mt-[40px] h-[640px] w-screen overflow-hidden ticker">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-full">
        <div className="flex flex-col h-full justify-between">
          <MarqueeRow pattern={row1Pattern} />
          <MarqueeRow pattern={row2Pattern} />
        </div>
        {/* circular fade overlay — radius ~640px */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 640px, rgba(0,0,0,.70) 800px, rgba(0,0,0,.90) 100%)',
          }}
        />
      </div>
    </section>
  );
}

/* --- patterns: A=305x275, B=305x295, ml = left margin between cards --- */
/* Row 1: 30px → B → 30 → A → 20 → B → 30 → A (extend as needed) */
const row1Pattern: Array<{ type: 'A' | 'B'; ml: number }> = [
  { type: 'B', ml: 30 },
  { type: 'A', ml: 30 },
  { type: 'B', ml: 20 },
  { type: 'A', ml: 30 },
];

/* Row 2: A → 30 → A → 30 → B → 30 → A → 30 → A */
const row2Pattern: Array<{ type: 'A' | 'B'; ml: number }> = [
  { type: 'A', ml: 0 },
  { type: 'A', ml: 30 },
  { type: 'B', ml: 30 },
  { type: 'A', ml: 30 },
  { type: 'A', ml: 30 },
];

function MarqueeRow({ pattern }: { pattern: Array<{ type: 'A' | 'B'; ml: number }> }) {
  return (
    <div className="h-[320px] relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="brand-track flex items-center h-full px-[15px]">
          <Sequence pattern={pattern} />
          <Sequence pattern={pattern} /> {/* duplicate for seamless loop */}
        </div>
      </div>
    </div>
  );
}

function Sequence({ pattern }: { pattern: Array<{ type: 'A' | 'B'; ml: number }> }) {
  return (
    <div className="flex items-center">
      {pattern.map((p, i) =>
        p.type === 'A' ? (
          <CardA key={i + 'A'} ml={p.ml} title="Card A" />
        ) : (
          <CardB key={i + 'B'} ml={p.ml} title="Card B" />
        )
      )}
    </div>
  );
}

/* --- cards --- */
function CardA({ ml = 0, title = 'A' }: { ml?: number; title?: string }) {
  return (
    <a
      href="#"
      style={{ marginLeft: ml }}
      className="
        block w-[305px] h-[275px] rounded-[22px]
        border border-white/10 bg-white/[.035]
        hover:bg-white/[.06] transition
        text-white/75 text-lg
        flex items-center justify-center
      "
      aria-label={title}
      title={title}
    >
      {title}
    </a>
  );
}

function CardB({ ml = 0, title = 'B' }: { ml?: number; title?: string }) {
  return (
    <a
      href="#"
      style={{ marginLeft: ml }}
      className="
        block w-[305px] h-[295px] rounded-[22px]
        border border-white/10 bg-white/[.035]
        hover:bg-white/[.06] transition
        text-white/75 text-lg
        flex items-center justify-center
      "
      aria-label={title}
      title={title}
    >
      {title}
    </a>
  );
}
