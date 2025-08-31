import React, { useEffect } from 'react'

export interface NotificationEvent {
	id: number
	message: string
	type?: 'info' | 'warn' | 'clear'
}

interface Props {
	desiredHeight?: number
	onNotify?: (e: NotificationEvent) => void
	frameless?: boolean
	blendBackground?: boolean
	className?: string
}

// Simple stub simulation that periodically fires notification events.
export default function AdaptiveNetworkSim({ desiredHeight=540, onNotify, className=''}: Props){
	useEffect(()=>{
		let idCounter = 1
		const interval = setInterval(()=>{
			const sampleMsgs = [
				'Critical congestion: Node A → B backlog rising',
				'Emission spike detected: Northwest sector',
				'Heavy congestion near East Ring',
				'Node recovery: West junction stabilized'
			]
			const msg = sampleMsgs[Math.floor(Math.random()*sampleMsgs.length)]
			onNotify?.({ id: idCounter++, message: msg, type: 'info' })
		}, 4500)
		return ()=> clearInterval(interval)
	},[onNotify])

	return (
		<div className={className} style={{height:desiredHeight}}>
			<div className="w-full h-full flex items-center justify-center text-white/40 text-xs border border-white/10 rounded-xl bg-white/5">
				AdaptiveNetworkSim placeholder
			</div>
		</div>
	)
}

