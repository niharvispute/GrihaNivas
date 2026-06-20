'use client';

import { useProjectForm } from '@/context/ProjectFormContext';

const STEPS = [
  { num: 1, label: 'Basic Information' },
  { num: 2, label: 'Location & Config' },
  { num: 3, label: 'Media & Documents' },
  { num: 4, label: 'Pricing & Inventory' },
  { num: 5, label: 'Review & Publish' },
];

export default function WizardSidebar() {
  const { currentStep, goToStep, projectId } = useProjectForm();

  const progressPct = Math.round(((currentStep - 1) / 4) * 100);

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Admin</p>
        <h2 className="text-sm font-bold text-white leading-tight">
          {projectId ? 'Edit Project' : 'New Project'}
        </h2>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400">Step {currentStep} of 5</span>
            <span className="text-[11px] text-primary font-bold">{progressPct}%</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {STEPS.map((step) => {
          const isDone    = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isLocked  = step.num > currentStep && !projectId;

          return (
            <button
              key={step.num}
              onClick={() => !isLocked && goToStep(step.num)}
              disabled={isLocked}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                isCurrent
                  ? 'bg-primary/15 text-white'
                  : isDone
                  ? 'hover:bg-slate-800 text-slate-300 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {/* Circle indicator */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                isDone
                  ? 'bg-primary border-primary text-white'
                  : isCurrent
                  ? 'border-primary text-primary bg-transparent'
                  : 'border-slate-700 text-slate-600'
              }`}>
                {isDone
                  ? <span className="material-symbols-outlined text-[13px]">check</span>
                  : step.num
                }
              </div>
              <p className={`text-xs font-medium leading-tight ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>
                {step.label}
              </p>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
