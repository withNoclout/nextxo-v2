import Layout from '../ui/Layout'
import React from 'react'

export default function MonitoringPage() {
  return (
    <Layout>
      <section
        className="relative min-h-[70vh] bg-transparent"
        aria-labelledby="monitoring-heading"
      >
        <h1 id="monitoring-heading" className="sr-only">Monitoring</h1>
        {/* Future monitoring content will go here */}
      </section>
    </Layout>
  )
}
