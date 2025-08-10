import FeaturePanel from '../ui/FeaturePanel'
import { FrameworksBandCompact } from '../ui/FrameworksBandCompact'
import { CustomerStories } from '../ui/CustomerStories'
import { BrandLine } from '../ui/BrandLine'
import { FreshBuildPanel } from '../ui/FreshBuildPanel'
import { TemplatesGrid } from '../ui/TemplatesGrid'
import { DashboardHeading } from '../ui/DashboardHeading'
import { CommunityWithHalfFade } from '../ui/CommunityWithHalfFade'
import { ScrollingABGrid } from '../ui/ScrollingABGrid'
import Layout from '../ui/Layout'
import { Hero } from '../ui/Hero'
import StayProductive from '../components/StayProductive'

export default function Landing() {
  return (
    <Layout>
      <Hero />
  <FeaturePanel />
      <FrameworksBandCompact />
      <div className="mt-[205px]">
        <CustomerStories />
      </div>
  {/* New brand line, full-bleed, self-spaced 30px internally */}
  <BrandLine />
  {/* Fresh build panel sits 330px under brand line */}
  <FreshBuildPanel />
  {/* Templates grid sits 60px under Fresh build panel */}
  <TemplatesGrid />
  {/* Dashboard heading sits 150px under the templates grid */}
  <DashboardHeading />
  {/* Stay Productive panel */}
  <StayProductive />
      {/* Community + Half Fade wrapper with scrolling section as child */}
      <CommunityWithHalfFade>
        <ScrollingABGrid />
      </CommunityWithHalfFade>
    </Layout>
  )
}
