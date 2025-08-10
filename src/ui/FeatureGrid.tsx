import { Link } from 'react-router-dom'

function Tile({ title, to, big = false }: { title: string; to?: string; big?: boolean }) {
  const Inner = (
    <div className={`card ${big ? 'card-lg' : ''} card-click`}>
      <div className="card-title">{title}</div>
      <div className="card-blank" />
    </div>
  )
  return to ? (
    <Link to={to} aria-label={title} className="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-[18px]">
      {Inner}
    </Link>
  ) : (
    Inner
  )
}

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto px-4 sm:px-5 md:px-6 py-12 md:py-16" style={{maxWidth: '1300px'}}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Big 2x2 tile */}
        <div className="lg:col-span-2 lg:row-span-2">
          <Tile title="Realtime Carbon Monitor" to="/realtime-carbon" big />
        </div>

        {/* Standard tiles, blank bodies */}
        <Tile title="Authentication" />
        <Tile title="Database" />
        <Tile title="Storage" />
        <Tile title="Edge Functions" />
        <Tile title="Realtime" />
        <Tile title="AI/Vector" />
      </div>
    </section>
  )
}
