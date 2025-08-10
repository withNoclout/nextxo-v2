export default function FeaturePanel() {
  return (
    <div className="w-[1350px] h-[800px] mx-auto">
      <div
        className="grid grid-cols-4 gap-[25px]"
        style={{ gridAutoRows: '387.5px' }}
      >
        {/* Top row: [2 cols | 1 col | 1 col] */}
        <section className="card col-span-2">
          <h3 className="text-lg font-semibold text-white">Monitoring Dashboard</h3>
        </section>
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">User &amp; Org Access</h3>
        </section>
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">Edge Collectors</h3>
        </section>

        {/* Bottom row: 4 equal cards */}
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">Data Ingestion</h3>
        </section>
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">Realtime Sensors</h3>
        </section>
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">Modeling &amp; Forecasts</h3>
        </section>
        <section className="card col-span-1">
          <h3 className="text-lg font-semibold text-white">Reporting &amp; APIs</h3>
        </section>
      </div>
    </div>
  );
}
