import React from 'react'

export function TemplatesGrid() {
  return (
    <section className="w-[1240px] h-[640px] mx-auto mt-[60px]">
      <div className="grid grid-cols-3 grid-rows-2 gap-[25px] h-full">
        <TemplateCard
          title="Stripe Subscriptions Starter"
          desc="The all-in-one subscription starter kit for high-performance SaaS applications."
          badges={["N","S","▲"]}
        />
        <TemplateCard
          title="Next.js Starter"
          desc="App Router template with cookie-based auth using Supabase, TypeScript and Tailwind CSS."
          badges={["N","▲"]}
        />
        <TemplateCard
          title="AI Chatbot"
          desc="An open-source AI chatbot template built with Next.js, the Vercel AI SDK, and Supabase."
          badges={["N","◎","▲"]}
        />
        <TemplateCard
          title="LangChain + Next.js Starter"
          desc="Starter template and example use-cases for LangChain projects in Next.js."
          badges={["🦜","N"]}
        />
        <TemplateCard
          title="Flutter User Management"
          desc="Get started with Supabase and Flutter by building a user management app with auth, storage and database."
          badges={["🅵"]}
        />
        <TemplateCard
          title="Expo React Native Starter"
          desc="An extended create-t3-turbo version implementing authentication on web and mobile."
          badges={["📱"]}
        />
      </div>
    </section>
  );
}

function TemplateCard({ title, desc, badges = [] as string[] }: { title: string; desc: string; badges?: string[] }) {
  return (
    <a
      href="#"
      aria-label={title}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[.03] hover:bg-white/[.05] transition-colors"
    >
      {/* top canvas ~45% */}
      <div className="relative h-[45%]">
        <div className="absolute inset-0 opacity-[.12] pointer-events-none bg-[linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06))]"></div>
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.09)_1px,transparent_0)] [background-size:24px_24px] opacity-[.2]" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {badges.map((b, i) => (
            <span key={i} aria-hidden="true" className="grid place-items-center h-9 w-9 rounded-xl bg-white/10 text-white/70 text-sm font-semibold">{b}</span>
          ))}
        </div>
      </div>

      {/* bottom content */}
      <div className="flex-1 p-6">
        <h3 className="text-[20px] font-semibold text-white">{title}</h3>
        <p className="mt-2 text-[14px] leading-6 text-white/70 clamp-3">
          {desc}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[14px] text-white/80 group-hover:text-white">
          View Template
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
