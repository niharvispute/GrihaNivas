'use client';

import { createContext, useCallback, useContext, useState } from 'react';

const ProjectFormContext = createContext(null);

const INITIAL_FORM_DATA = {
  step1: {
    listingMode: 'project',       // 'single' | 'project' — UI-only routing hint, not sent to backend
    listingType: 'new_launch',    // 'sale' | 'rent' | 'new_launch' | 'commercial' — UI-only for now
    projectName: '',
    builderId: '',
    builderName: '',              // display label
    contactPerson: '',
    contactPhone: '',
    reraNumber: '',
    reraUrl: '',
    projectType: 'residential',   // 'residential' | 'commercial' | 'mixed' | 'plotting'
    projectStatus: 'new_launch',  // 'new_launch' | 'under_construction' | 'ready_to_move'
    configurations: [],           // ['studio','1BHK','2BHK',...] — drives Step2 config tabs
  },
  step2: {
    locality: '',
    area: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    address: '',
    coordinates: { lat: null, lng: null },
    totalTowers: '',
    totalFloors: '',
    totalUnits: '',
    landArea: '',
    configurations: [],           // [{bhkType,title,carpetAreaMin,carpetAreaMax,bathrooms,balconies,parking,totalUnits,_tempId}]
  },
  step3: {
    heroImage: null,              // File object (pre-upload) | {url,publicId} (post-upload)
    gallery: [],                  // [File | {url,publicId}]
    masterPlan: null,
    brochure: null,
    videoUrl: '',
    configFloorPlans: {},         // { bhkType: [File | {url,publicId}] }
  },
  step4: {
    priceMin: '',
    priceMax: '',
    pricePerSqft: '',
    maintenanceCharges: '',
    configPricing: {},            // { _tempId: { priceMin, priceMax } }
    units: [],                    // loaded from API in Phase 1
  },
  step5: {
    listingStatus: 'draft',       // 'draft' | 'active'
    reraVerified: false,
    seoTitle: '',
    seoDescription: '',
    slug: '',
    leadCapture: {
      enablePriceRequest: true,
      enableCallback: true,
      enableBrochureDownload: true,
      whatsappCtaEnabled: true,
      enableSiteVisit: true,
    },
  },
};

export function ProjectFormProvider({ children, initialProjectId = null, initialStep = 1 }) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((step, data) => {
    setFormData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
    setIsDirty(true);
  }, []);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 5) setCurrentStep(step);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setProjectId(null);
    setCurrentStep(1);
    setIsDirty(false);
  }, []);

  return (
    <ProjectFormContext.Provider
      value={{
        projectId,
        setProjectId,
        currentStep,
        goToStep,
        formData,
        updateFormData,
        isDirty,
        setIsDirty,
        resetForm,
      }}
    >
      {children}
    </ProjectFormContext.Provider>
  );
}

export function useProjectForm() {
  const ctx = useContext(ProjectFormContext);
  if (!ctx) throw new Error('useProjectForm must be used within ProjectFormProvider');
  return ctx;
}
