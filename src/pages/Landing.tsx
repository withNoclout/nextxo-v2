import { FeatureGrid } from '../ui/FeatureGrid'
import { Footer } from '../ui/Footer'
import { Header } from '../ui/Header'
import { Hero } from '../ui/Hero'
import { PageFade } from '../ui/Page'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <PageFade>
        <main className="flex-1">
          <Hero />
          <FeatureGrid />
        </main>
      </PageFade>
      <Footer />
    </div>
  )
}
