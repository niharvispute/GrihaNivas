import LeadForm from '@/components/forms/LeadForm';

export default function AgreementPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
        <div className="bg-linear-to-br from-slate-50 via-white to-slate-100 border border-slate-100 rounded-4xl p-8 md:p-12">
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-primary mb-4">Rent Agreement Service</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-5 leading-none">
            Online Rent Agreement & Registration
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
            Start your rent agreement workflow with our guided support for drafting, document checks, stamping, and registration.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs font-black tracking-wide uppercase text-slate-400 mb-2">Step 1</p>
              <p className="text-sm font-semibold text-slate-700">Submit your request</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs font-black tracking-wide uppercase text-slate-400 mb-2">Step 2</p>
              <p className="text-sm font-semibold text-slate-700">Share tenant/owner details</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs font-black tracking-wide uppercase text-slate-400 mb-2">Step 3</p>
              <p className="text-sm font-semibold text-slate-700">Complete registration</p>
            </div>
          </div>
        </div>

        <LeadForm
          title="Request Rent Agreement Assistance"
          leadType="agreement"
        />
      </section>
    </main>
  );
}
