import React from 'react'

// 40px below the previous panel
export function MovingCardsPanel() {
  return (
    <section className="mt-[40px] h-[640px] w-screen overflow-hidden ticker">
      {/* full-bleed even inside a centered layout */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-full">
        {/* two rows (each 320px: 290 card + 15 top + 15 bottom) */}
        <div className="flex flex-col h-full justify-between">
          <MarqueeRow />
          <MarqueeRow />
        </div>
      </div>
    </section>
  );
}

function MarqueeRow() {
  return (
    <div className="h-[320px] relative">
      <div className="absolute inset-0 overflow-hidden">
        {/* 15px edge padding; 30px between cards to simulate 15px each side */}
        <div className="brand-track flex items-center h-full gap-[30px] px-[15px]">
          <CardsSequence />
          <CardsSequence /> {/* duplicate for seamless loop */}
        </div>
      </div>
    </div>
  );
}

function CardsSequence() {
  // put as many as you like
  const items = [
    'Case Study', 'Release Notes', 'Roadmap', 'Tutorial',
    'Design Doc', 'Changelog', 'Benchmark', 'Whitepaper',
    'Integration', 'Starter Kit', 'Example', 'How-to',
  ];
  return (
    <>
      {items.map((t, i) => (
        <Card key={i} title={t} />
      ))}
    </>
  );
}

function Card({ title }: { title: string }) {
  return (
    <a
      href="#"
      className="
        block w-[305px] h-[290px] rounded-2xl
        border border-white/10 bg-white/[.03]
        hover:bg-white/[.06] transition
        p-4 text-white/80
      "
      aria-label={title}
      title={title}
    >
      <div className="h-full w-full flex items-center justify-center text-sm text-white/70">
        {title}
      </div>
    </a>
  );
}
