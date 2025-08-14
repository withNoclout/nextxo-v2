export default function TrustBar() {
  return (
    <div className="w-full h-[100px] border-t border-[#222] flex items-center justify-center px-6">
      <div className="max-w-7xl w-full flex items-center justify-center md:justify-center">
        {/* Left text */}
        <div className="text-[15px] text-neutral-300 font-medium text-center md:text-left">
          We protect your data. <a href="#" className="text-emerald-400 hover:text-emerald-300">More on Security</a>
        </div>

        {/* Spacer 130px (hidden on mobile) */}
        <div className="mx-[130px] hidden md:block" />

        {/* Right-side texts */}
        <div className="hidden md:flex items-center text-[10px] text-neutral-400 gap-[60px]">
          <div>✓ SOC2 Type 2 <span className="text-neutral-500">Certified</span></div>
          <div>✓ HIPAA <span className="text-neutral-500">Compliant</span></div>
        </div>
      </div>
    </div>
  )
}
