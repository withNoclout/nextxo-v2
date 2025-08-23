import Layout from '../ui/Layout'
import React from 'react'
import ProductTabs from '../components/nav/ProductTabs'
import IntersectionDemo from '../monitoring/IntersectionDemo'
import CitySim from '../monitoring/CitySim'

export default function MonitoringPage() {
  return (
    <Layout>
      {/* Secondary product navigation */}
      <ProductTabs />
      <section className="relative min-h-[70vh] bg-transparent px-6 pt-8 space-y-8" aria-labelledby="monitoring-heading">
        <header>
          <h1 id="monitoring-heading" className="text-3xl font-semibold tracking-tight mb-3">Monitoring</h1>
          <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
            Experimental live traffic simulation widget (intersection signal logic + vehicle flow) embedded as a visualization demo.
          </p>
        </header>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-10">
          <div>
            <h2 className="text-sm font-medium text-white/80 mb-3">Single Intersection Demo</h2>
            <IntersectionDemo />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white/80 mb-3">Living City Grid (Cars + Pedestrians)</h2>
            <CitySim />
          </div>
        </div>
      </section>
    </Layout>
  )
}
