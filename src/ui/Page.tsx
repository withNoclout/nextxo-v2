import { useEffect, useRef } from 'react'

export function PageFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('page-enter')
    // next frame
    const id = requestAnimationFrame(() => el.classList.add('page-enter-active'))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
