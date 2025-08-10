import FeaturePanel from '../ui/FeaturePanel'
import { FrameworksBand } from '../ui/FrameworksBand'
import Layout from '../ui/Layout'
import { Footer } from '../ui/Footer'
import { Header } from '../ui/Header'
import { Hero } from '../ui/Hero'
import { PageFade } from '../ui/Page'

export default function Landing() {
  return (
    <Layout>
      <Hero />
      <FeaturePanel />
  <FrameworksBand />
    </Layout>
  )
}
