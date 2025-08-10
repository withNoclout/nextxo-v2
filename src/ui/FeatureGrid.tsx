function Tile({ title, big = false }: { title: string; big?: boolean }) {
  const Inner = (
    <div className={`card ${big ? 'card-lg' : ''} card-click`}>
      <div className="card-title">{title}</div>
      <div className="card-blank" />
    </div>
  )
  return Inner
}

export function FeatureGrid() {
  return (
    <section id="features" className="feature-section">
      <div className="feature-container">
        <div className="feature-grid">
          {/* Large left card: lg col-span-8 / row-span-2; md spans all 6 cols */}
          <div className="row-2 lg-col-8 md-col-6">
            <Tile title="title_name" big />
          </div>

          {/* Right column: two cards, each lg col-span-4 / row-span-1; md span 3 */}
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>

          {/* Next row: three cards across, each lg col-span-4 / row-span-1; md span 3 */}
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>

          {/* Final single card (optional) */}
          <div className="row-1 lg-col-4 md-col-3">
            <Tile title="title_name" />
          </div>
        </div>
      </div>
    </section>
  )
}
