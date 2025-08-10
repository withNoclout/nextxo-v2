import React from 'react'

export function CustomerStories(): JSX.Element {
  return (
    <section className="w-[1380px] h-[200px] mx-auto flex items-stretch justify-between">
      {/* left: label, title, description */}
      <div className="flex-1 font-brooklyn">
        <div className="text-[10px] tracking-[0.16em] uppercase text-white/60">
          Customer stories
        </div>

        {/* main title: 2 lines, 25px gap between lines -> 30px font + 25px = 55px leading */}
        <h2 className="mt-[30px] text-[30px] leading-[55px] font-semibold text-white clamp-2">
          Trusted by the world’s most innovative companies.
        </h2>

        {/* description 30px under title */}
        <p className="mt-[30px] text-[10px] leading-5 text-white/70 max-w-[880px]">
          See how NetXO empowers companies of all sizes to accelerate their growth
          and streamline their work.
        </p>
      </div>

      {/* right: buttons (bottom-aligned, 10px apart) */}
      <div className="flex items-end gap-[10px]">
        <button
          className="h-[30px] px-3 rounded-xl text-[10px] text-white
                     border border-white/30 bg-[#0B7A54]
                     hover:brightness-110 active:translate-y-[1px] transition"
        >
          View all stories
        </button>
        <button
          className="h-[30px] px-3 rounded-xl text-[10px] text-white
                     border border-white/30 bg-[#161616]
                     hover:bg-[#1d1d1d] active:translate-y-[1px] transition"
        >
          View Events
        </button>
      </div>
    </section>
  )
}
