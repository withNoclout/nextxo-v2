export default function FeaturePanel() {
  return (
    <section className="mx-auto max-w-[1350px] px-0">
      <div
        className="panel cq inline-grid grid-cols-4 w-full gap-[clamp(16px,2vw,25px)] [container-type:inline-size] [--panel-h:clamp(520px,60vw,800px)] [--row:calc((var(--panel-h)-clamp(16px,2vw,25px))/2)]"
        style={{ gridAutoRows: 'var(--row)', height: 'var(--panel-h)' }}
      >
        {/* TOP row (first is 2×) */}
        <section className="card col-span-2">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Monitoring Dashboard</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">User &amp; Org Access</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Edge Collectors</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>

        {/* BOTTOM row (4 equal) */}
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Data Ingestion</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Realtime Sensors</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Modeling &amp; Forecasts</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
        <section className="card">
          <header className="mb-3">
            <h3 className="card-title text-white font-semibold">Reporting &amp; APIs</h3>
            <p className="card-desc text-white/70">Short one-line description goes here.</p>
          </header>
          <div className="card-media" />
        </section>
      </div>
      {/* Caption: exactly 30px below the panel, aligned left within the same container */}
      <p className="mt-[30px] text-sm leading-relaxed">
        <span className="font-bold text-white">Use one or all.</span>{' '}
        <span className="text-white/60">Best of breed products. Integrated as a platform.</span>
      </p>
    </section>
  );
}
