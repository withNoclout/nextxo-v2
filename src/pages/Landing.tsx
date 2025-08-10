import FeaturePanel from '../ui/FeaturePanel'
import { FrameworksBandCompact } from '../ui/FrameworksBandCompact'
import Layout from '../ui/Layout'
import { Hero } from '../ui/Hero'

export default function Landing() {
  return (
    <Layout>
      <Hero />
  <FeaturePanel />
  <FrameworksBandCompact />
    </Layout>
  )
}
