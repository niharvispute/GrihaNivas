'use client';

import { useProjectForm } from '@/context/ProjectFormContext';

const STEPS = [
  { num: 1, label: 'Basic Information',    sub: 'Project details & type' },
  { num: 2, label: 'Location & Config',    sub: 'Address & BHK configs' },
  { num: 3, label: 'Media & Documents',    sub: 'Images, plans & brochure' },
  { num: 4, label: 'Pricing & Inventory',  sub: 'Prices & unit inventory' },
  { num: 5, label: 'Review & Publish',     sub: 'SEO & go live' },
];

export default function WizardSidebar() {
  const { currentStep, goToStep, projectId } = useProjectForm();

  const progressPct = Math.round(((currentStep - 1) / 4) * 100);

  return (
    <aside className="w-72 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-slate-800">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Admin Console</p>
        <h2 className="text-lg font-bold text-white leading-tight">
          {projectId ? 'Edit Project' : 'New Project'}
        </h2>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">Step {currentStep} of 5</span>
            <span className="text-xs text-primary font-bold">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {STEPS.map((step) => {
          const isDone    = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isLocked  = step.num > currentStep && !projectId;

          return (
            <button
              key={step.num}
              onClick={() => !isLocked && goToStep(step.num)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-colors ${
                isCurrent
                  ? 'bg-primary/15 text-white'
                  : isDone
                  ? 'hover:bg-slate-800 text-slate-300 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {/* Circle indicator */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                isDone
                  ? 'bg-primary border-primary text-white'
                  : isCurrent
                  ? 'border-primary text-primary bg-transparent'
                  : 'border-slate-700 text-slate-600'
              }`}>
                {isDone
                  ? <span className="material-symbols-outlined text-base">check</span>
                  : step.num
                }
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{step.sub}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Support box */}
      <div className="mx-4 mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="material-symbols-outlined text-primary text-lg">support_agent</span>
          <p className="text-sm font-semibold text-white">Need Help?</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">Contact support for any issues while listing your project.</p>
        <button className="mt-2.5 text-xs text-primary font-bold hover:underline">Contact Support →</button>
      </div>
    </aside>
  );
}
