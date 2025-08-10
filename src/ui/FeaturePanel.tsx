export default function FeaturePanel() {
  return (
    <div className="max-w-[1375px] mx-auto h-[825px]">
      <div
        className="grid grid-cols-12 gap-[25px]"
        style={{ gridAutoRows: '400px' }}
      >
        {/* Big Monitoring Dashboard card */}
  <section className="card col-span-8 row-span-2">
          <h3 className="text-lg font-semibold text-white">Monitoring Dashboard</h3>
        </section>

        {/* Right stack */}
  <section className="card col-span-4 row-span-1">
          <h3 className="text-lg font-semibold text-white">User &amp; Org Access</h3>
        </section>
  <section className="card col-span-4 row-span-1">
          <h3 className="text-lg font-semibold text-white">Edge Collectors</h3>
        </section>

        {/* Bottom row */}
  <section className="card col-span-4 row-span-1">
          <h3 className="text-lg font-semibold text-white">Data Ingestion</h3>
        </section>
  <section className="card col-span-4 row-span-1">
          <h3 className="text-lg font-semibold text-white">Realtime Sensors</h3>
        </section>
  <section className="card col-span-4 row-span-1">
          <h3 className="text-lg font-semibold text-white">Modeling &amp; Forecasts</h3>
        </section>
      </div>
    </div>
  );
}
