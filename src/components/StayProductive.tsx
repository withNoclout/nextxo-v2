import ComingSoonDashboard from './ComingSoonDashboard'

export default function StayProductive() {
  return (
    <section
      id="stay-productive"
      className="mt-[150px] mx-auto max-w-[1385px] px-6 text-center"
    >
      {/* Single heading in two lines, 30px */}
      <h2 className="text-[30px] leading-tight font-semibold text-white">
        Stay productive and manage your app
      </h2>
      <p className="mt-[25px] text-[30px] leading-tight text-white/70">
        without leaving the dashboard
      </p>

      {/* Coming soon dashboard — 200px below heading, and only 120px space to next panel */}
      <div className="mt-[200px] mb-[120px]">
        <ComingSoonDashboard />
      </div>
    </section>
  )
}
