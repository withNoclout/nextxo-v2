export default function FeaturePanel() {
  return (
    <section className="mx-auto max-w-[1350px] px-0">
      <div
        className="panel cq inline-grid grid-cols-4 w-full gap-[clamp(16px,2vw,25px)] [container-type:inline-size] [--panel-h:clamp(520px,60vw,800px)] [--row:calc((var(--panel-h)-clamp(16px,2vw,25px))/2)]"
        style={{ gridAutoRows: 'var(--row)', height: 'var(--panel-h)' }}
      >
        {/* TOP (3) — first is 2x */}
        <section className="card col-span-2" data-priority="1">
          <h3 className="card-title text-white">Monitoring Dashboard</h3>
          <div className="card-blank" />
        </section>
        <section className="card" data-priority="2">
          <h3 className="card-title text-white">User &amp; Org Access</h3>
          <div className="card-blank" />
        </section>
        <section className="card" data-priority="3">
          <h3 className="card-title text-white">Edge Collectors</h3>
          <div className="card-blank" />
        </section>
        {/* BOTTOM (4 equal) */}
        <section className="card" data-priority="4">
          <h3 className="card-title text-white">Data Ingestion</h3>
          <div className="card-blank" />
        </section>
        <section className="card" data-priority="5">
          <h3 className="card-title text-white">Realtime Sensors</h3>
          <div className="card-blank" />
        </section>
        <section className="card" data-priority="6">
          <h3 className="card-title text-white">Modeling &amp; Forecasts</h3>
          <div className="card-blank" />
        </section>
        <section className="card" data-priority="7">
          <h3 className="card-title text-white">Reporting &amp; APIs</h3>
          <div className="card-blank" />
        </section>
      </div>
    </section>
  );
}
