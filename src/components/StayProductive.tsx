import ComingSoonDashboard from './ComingSoonDashboard'

export default function StayProductive() {
  return (
    <section className="mx-auto max-w-[1385px] px-6 text-center">
      <h2 className="text-[30px] leading-tight font-semibold text-white">
        Stay productive and manage your app
        <br />
        <span className="text-white/70">without leaving the dashboard</span>
      </h2>

      {/* 200px below the text */}
      <ComingSoonDashboard />
    </section>
  )
}
