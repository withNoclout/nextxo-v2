import React from 'react'

// Lightweight placeholder tabs bar (future: real product navigation)
export default function ProductTabs(){
	return (
		<nav aria-label="Product sections" className="mb-6">
			<ul className="flex gap-4 text-[12px] text-white/60">
				<li className="px-3 py-1 rounded-md bg-white/10 text-white/80">Monitoring</li>
				<li className="px-3 py-1 rounded-md bg-white/5">Optimization</li>
				<li className="px-3 py-1 rounded-md bg-white/5">Reporting</li>
			</ul>
		</nav>
	)
}

