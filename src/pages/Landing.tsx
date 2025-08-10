import FeaturePanel from '../ui/FeaturePanel'
import { FrameworksBandCompact } from '../ui/FrameworksBandCompact'
import { CustomerStories } from '../ui/CustomerStories'
import Layout from '../ui/Layout'
import { Hero } from '../ui/Hero'

export default function Landing() {
  return (
    <Layout>
      <Hero />
  <FeaturePanel />
      <FrameworksBandCompact />
      <div className="mt-[205px]">
        <CustomerStories />
      </div>
    </Layout>
  )
}
