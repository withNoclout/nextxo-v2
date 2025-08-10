import React from 'react'

export function CustomerStories(): JSX.Element {
  return (
    <section className="w-[1150px] mx-auto">
      {/* label 205px below framework band */}
      <div className="mt-[205px] text-[10px] tracking-[0.16em] uppercase text-white/60">
        Customer stories
      </div>

      {/* title/desc + buttons (title 30px under label) */}
      <div className="mt-[30px] flex items-start justify-between gap-6">
        <div className="max-w-[880px]">
          <h2 className="text-[30px] leading-tight font-semibold text-white">
            Trusted by the world’s most innovative companies.
          </h2>
          <p className="mt-3 text-[10px] leading-5 text-white/70">
            See how NetXO empowers companies of all sizes to accelerate their growth and
            streamline their work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Green primary */}
          <button
            className="h-[30px] px-3 rounded-xl text-[10px] text-white
                       border border-white/30 bg-[#0B7A54]
                       hover:brightness-110 active:translate-y-[1px] transition"
          >
            View all stories
          </button>

          {/* Neutral secondary */}
          <button
            className="h-[30px] px-3 rounded-xl text-[10px] text-white
                       border border-white/30 bg-[#161616]
                       hover:bg-[#1d1d1d] active:translate-y-[1px] transition"
          >
            View Events
          </button>
        </div>
      </div>
    </section>
  )
}
