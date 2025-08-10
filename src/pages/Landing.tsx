import FeaturePanel from '../ui/FeaturePanel'
import { FrameworksBandResponsive } from '../ui/FrameworksBandResponsive'
import Layout from '../ui/Layout'
import { Hero } from '../ui/Hero'

export default function Landing() {
  return (
    <Layout>
      <Hero />
      <FeaturePanel />
  <FrameworksBandResponsive />
    </Layout>
  )
}
