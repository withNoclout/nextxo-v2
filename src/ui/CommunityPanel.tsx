import React from 'react'
import { GitHubIcon } from './icons'

export function CommunityPanel() {
  return (
    <section className="w-[1380px] mx-auto mt-[1080px] text-center font-brooklyn">
      {/* Title 30px */}
      <h2 className="text-[30px] font-semibold text-white">
        Join the community
      </h2>

      {/* 35px space, 15px description */}
      <p className="mt-[35px] text-[15px] leading-6 text-white/80">
        Discover what our community has to say about their Supabase experience.
      </p>

      {/* 40px space, two 35px-high buttons */}
      <div className="mt-[40px] flex items-center justify-center gap-3">
        <PillButton
          leftIcon={<GitHubIcon aria-hidden="true" className="h-[18px] w-[18px] fill-white/70" />}
          rightIcon={<ChatIcon aria-hidden="true" className="h-[18px] w-[18px] stroke-white/60" />}
          label="GitHub discussions"
        />
        <PillButton
          leftIcon={<DiscordIcon aria-hidden="true" className="h-[18px] w-[18px] fill-white/70" />}
          rightIcon={<ChatIcon aria-hidden="true" className="h-[18px] w-[18px] stroke-white/60" />}
          label="Discord"
        />
      </div>
    </section>
  );
}

/* Reusable pill-style button (35px height, ~15px text) */
function PillButton({ leftIcon, rightIcon, label }: { leftIcon: React.ReactNode; rightIcon: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      className="
        inline-flex items-center justify-between
        h-[35px] px-4 rounded-xl min-w-[280px]
        text-[15px] text-white border border-white/30
        bg-[#161616] hover:bg-[#1d1d1d] transition
      "
    >
      <span className="flex items-center gap-2">
        {leftIcon}
        {label}
      </span>
      {rightIcon}
    </a>
  );
}

function DiscordIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-3.94 0
        c-.16-.38-.39-.87-.59-1.23-1.38.25-2.73.68-3.76 1.37C4.18 7.22 3.81 10.02 3.98 12.79c1.62 1.2 3.2 1.93 4.74 2.41
        .38-.52.72-1.07 1.02-1.65-.56-.21-1.09-.47-1.6-.77.13-.1.26-.2.38-.3 3 1.4 6.27 1.4 9.25 0 .13.1.25.2.38.3-.5.3-1.04.56-1.6.77.3.58.64 1.13 1.02 1.65
        1.54-.48 3.12-1.21 4.74-2.41.23-3.65-.38-6.42-2.18-8.42zM9.7 12.35c-.72 0-1.31-.66-1.31-1.47 0-.81.58-1.47 1.31-1.47.73 0 1.32.66 1.31 1.47 0 .81-.58 1.47-1.31 1.47zm4.61 0c-.72 0-1.31-.66-1.31-1.47 0-.81.58-1.47 1.31-1.47.73 0 1.32.66 1.31 1.47 0 .81-.59 1.47-1.31 1.47z"/>
    </svg>
  );
}

function ChatIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...rest}>
      <path d="M21 12a7 7 0 0 1-7 7H7l-4 3 1-5A7 7 0 1 1 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
