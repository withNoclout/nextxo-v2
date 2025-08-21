import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'

export default function MonitoringPage() {
  return (
    <Layout>
      {/* Secondary product navigation */}
      <ProductTabs />
      <section
        className="relative min-h-[70vh] bg-transparent px-6 pt-10"
        aria-labelledby="monitoring-heading"
      >
        <h1 id="monitoring-heading" className="text-3xl font-semibold tracking-tight mb-6">Monitoring</h1>
        <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
          Real-time insights into your infrastructure carbon footprint and system performance will appear here.
          This placeholder section is ready for charts, live metrics, and alert configuration panels.
        </p>
      </section>
    </Layout>
  )
}
