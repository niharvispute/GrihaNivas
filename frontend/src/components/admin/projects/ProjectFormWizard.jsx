'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectForm } from '@/context/ProjectFormContext';
import WizardSidebar from './WizardSidebar';
import WizardFooter from './WizardFooter';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2LocationConfig from './steps/Step2LocationConfig';
import Step3MediaDocs from './steps/Step3MediaDocs';
import Step4PricingInventory from './steps/Step4PricingInventory';
import Step5ReviewPublish from './steps/Step5ReviewPublish';

const STEP_COMPONENTS = {
  1: Step1BasicInfo,
  2: Step2LocationConfig,
  3: Step3MediaDocs,
  4: Step4PricingInventory,
  5: Step5ReviewPublish,
};

export default function ProjectFormWizard() {
  const { currentStep, goToStep, projectId } = useProjectForm();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const StepComponent = STEP_COMPONENTS[currentStep];

  const handleNext = async () => {
    // Phase 0: just advance step — API calls wired in Phase 1
    if (currentStep < 5) {
      goToStep(currentStep + 1);
    } else {
      // Step 5 publish — Phase 1 will call setProjectStatus here
      router.push('/admin/projects');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    // Phase 0: no-op — Phase 1 will call updateProject here
    console.log('Save draft — wired in Phase 1');
  };

  return (
    // Full-bleed wizard layout — overrides the admin layout max-width
    <div className="fixed inset-0 top-[72px] flex bg-[#f8f7f5] z-10">
      <WizardSidebar />

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <StepComponent />
          </div>
        </div>
        <WizardFooter
          onBack={handleBack}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
