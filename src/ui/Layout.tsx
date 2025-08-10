import { Footer } from './Footer'
import TopBar from './TopBar'
import { PageFade } from './Page'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
  <div className="max-w-[1700px] w-full mx-auto min-h-[7500px] flex flex-col bg-[#0a0a0a] text-white overflow-x-hidden">
      <TopBar />
      <main className="flex-1">
        <PageFade>
          {children}
        </PageFade>
      </main>
      {/* safety space if any section used negative margins; adjust/remove if not needed */}
      <div className="h-8" />
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
