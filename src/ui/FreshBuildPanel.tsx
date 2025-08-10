import React from 'react'
import { GitHubIcon } from './icons'

export function FreshBuildPanel() {
  return (
    <section className="w-[1380px] mx-auto mt-[330px] font-brooklyn text-center">
      <div className="space-y-[30px]">
        <h2 className="text-[30px] leading-[30px] text-white">
          Fresh build in a sec
        </h2>

        <p className="text-[20px] leading-snug text-white/80 max-w-[1000px] mx-auto">
          Kickstart your next project with templates built by us and our community.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            className="inline-flex items-center h-[35px] px-4 rounded-xl
                       text-[15px] text-white border border-white/30
                       bg-[#161616] hover:bg-[#1d1d1d] transition"
          >
            View all examples
          </button>

          <a
            href="#"
            className="inline-flex items-center h-[35px] px-4 rounded-xl
                       text-[15px] text-white border border-white/30
                       bg-[#161616] hover:bg-[#1d1d1d] transition"
          >
            <GitHubIcon className="h-[18px] w-[18px] mr-2 fill-white/70" />
            Official GitHub library
          </a>
        </div>
      </div>
    </section>
  );
}
