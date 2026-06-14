'use client';

import { useProjectForm } from '@/context/ProjectFormContext';

export default function WizardFooter({ onBack, onSaveDraft, onNext, isLoading = false }) {
  const { currentStep } = useProjectForm();
  const isFirstStep = currentStep === 1;
  const isLastStep  = currentStep === 5;

  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        {!isFirstStep && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSaveDraft}
          disabled={isLoading}
          className="px-5 py-2.5 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          Save as Draft
        </button>

        <button
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isLoading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {isLastStep ? (
            <>
              <span className="material-symbols-outlined text-lg">publish</span>
              Publish Project
            </>
          ) : (
            <>
              Next Phase
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
