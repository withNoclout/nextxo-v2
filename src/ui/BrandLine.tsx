import React from 'react'

/* Brand Line — place 30px below the previous panel */
export function BrandLine() {
  return (
    <section className="mt-[30px] w-screen overflow-hidden h-[300px] ticker">
      {/* center the full-bleed section even inside a max-w layout */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-full">
        {/* track: duplicate content for seamless loop */}
        <div className="flex gap-5 h-full brand-track">
          <Sequence />
          <Sequence /> {/* duplicate */}
        </div>
      </div>
    </section>
  );
}

/* one full sequence = 1 big, 2 small, 1 big, 2 small, 1 big, 4 small */
function Sequence() {
  return (
    <div className="flex h-full items-stretch gap-5">
      <BigCard  title="Chatbase" />
      <SmallCol>
        <SmallCard title="Shotgun" />
        <SmallCard title="Moz://a" />
      </SmallCol>

      <BigCard  title="Mobbin" />
      <SmallCol>
        <SmallCard title="HappyTeams" />
        <SmallCard title="Loops" />
      </SmallCol>

      <BigCard  title="Pebblely" />
      <SmallCol>
        <SmallCard title="Resend" />
        <SmallCard title="LangChain" />
      </SmallCol>
      <SmallCol>
        <SmallCard title="Udio" />
        <SmallCard title="Pika" />
      </SmallCol>
    </div>
  );
}

/* --- card primitives --- */

function BigCard({ title = "Brand" }: { title?: string }) {
  return (
    <a
      href="#"
      className="
        w-[450px] h-[300px] rounded-2xl
        border border-white/10 bg-white/[.04]
        hover:bg-white/[.06] transition
        flex items-center justify-center
        text-white/80 text-xl font-semibold
      "
      aria-label={title}
      title={title}
    >
      {title}
    </a>
  );
}

function SmallCol({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[250px] h-[300px] flex flex-col gap-5">
      {children}
    </div>
  );
}

function SmallCard({ title = "Brand" }: { title?: string }) {
  return (
    <a
      href="#"
      className="
        w-[250px] h-[140px] rounded-2xl
        border border-white/10 bg-white/[.04]
        hover:bg-white/[.06] transition
        flex items-center justify-center
        text-white/70 text-base font-medium
      "
      aria-label={title}
      title={title}
    >
      {title}
    </a>
  );
}
