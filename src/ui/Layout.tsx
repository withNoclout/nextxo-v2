import { Footer } from './Footer'
import TrustBar from './TrustBar'
import TopBar from './TopBar'
import { PageFade } from './Page'
import BottomCta from '../components/BottomCta'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
  <div className="max-w-[1700px] w-full mx-auto min-h-[7500px] flex flex-col bg-[#0a0a0a] text-white overflow-x-hidden">
      <TopBar />
      <main className="flex-1">
        <PageFade>
          {children}
        </PageFade>
      </main>
      <div className="mt-auto">
        <BottomCta />
        <TrustBar />
        <Footer />
      </div>
    </div>
  )
}
