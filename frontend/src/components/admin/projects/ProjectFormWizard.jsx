'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectForm } from '@/context/ProjectFormContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errors';
import {
  createProject,
  updateProject,
  setProjectStatus,
  getProjectById,
  listUnits,
  createConfiguration,
  updateConfiguration,
} from '@/services/projectService';
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

const slugify = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const numOrUndef = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Map a backend project document (incl. configurations[]) into wizard formData slices
function mapProjectToFormData(p) {
  if (!p) return null;
  const configs = (p.configurations || []).map((c) => ({
    _id: c._id,
    bhkType: c.bhkType,
    title: c.title || '',
    carpetAreaMin: c.carpetAreaMin ?? '',
    carpetAreaMax: c.carpetAreaMax ?? '',
    bathrooms: c.bathrooms != null ? String(c.bathrooms) : '',
    balconies: c.balconies != null ? String(c.balconies) : '',
    parking: c.parking != null ? String(c.parking) : '',
    totalUnits: c.totalUnits ?? '',
    images: Array.isArray(c.gallery)
      ? c.gallery.map((g) => (typeof g === 'string' ? g : g?.url || '')).filter(Boolean)
      : [],
    imageFiles: [],
  }));
  const configPricing = {};
  (p.configurations || []).forEach((c) => {
    configPricing[c._id] = { priceMin: c.priceMin ?? '', priceMax: c.priceMax ?? '' };
  });
  const floorPlans = {};
  (p.configurations || []).forEach((c) => {
    if (Array.isArray(c.floorPlans) && c.floorPlans.length) {
      floorPlans[c.bhkType] = c.floorPlans;
    }
  });

  const builder = typeof p.builderId === 'object' && p.builderId ? p.builderId : null;

  return {
    step1: {
      projectName: p.name || '',
      builderId: builder?._id || p.builderId || '',
      builderName: builder?.name || '',
      contactPerson: p.contactPerson || '',
      contactPhone: p.contactPhone || '',
      reraNumber: p.reraNumber || '',
      reraUrl: p.reraUrl || '',
      projectType: p.projectType || 'residential',
      projectStatus: p.projectStatus || 'new_launch',
      configurations: (p.configurations || []).map((c) => c.bhkType),
    },
    step2: {
      area: p.location?.area || '',
      city: p.location?.city || 'Mumbai',
      state: p.location?.state || 'Maharashtra',
      pincode: p.location?.pincode || '',
      address: p.location?.address || '',
      totalTowers: p.totalTowers ?? '',
      totalFloors: p.totalFloors ?? '',
      totalUnits: p.totalUnits ?? '',
      landArea: p.landArea ?? '',
      configurations: configs,
    },
    step3: {
      heroImage: p.heroImage || null,
      gallery: p.gallery || [],
      masterPlan: p.masterPlan || null,
      brochure: p.brochure || null,
      videoUrl: p.videoUrl || '',
      configFloorPlans: floorPlans,
    },
    step4: {
      priceMin: p.priceMin ?? '',
      priceMax: p.priceMax ?? '',
      pricePerSqft: p.pricePerSqft ?? '',
      maintenanceCharges: p.maintenanceCharges ?? '',
      configPricing,
    },
    step5: {
      listingStatus: p.listingStatus || 'draft',
      reraVerified: !!p.reraVerified,
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      slug: p.slug || '',
      leadCapture: {
        enablePriceRequest: p.enablePriceRequest !== false,
        enableCallback: p.enableCallback !== false,
        enableBrochureDownload: p.enableBrochureDownload !== false,
        whatsappCtaEnabled: p.whatsappCtaEnabled !== false,
        enableSiteVisit: p.enableSiteVisit !== false,
      },
    },
  };
}

export default function ProjectFormWizard() {
  const {
    currentStep,
    goToStep,
    projectId,
    setProjectId,
    formData,
    updateFormData,
    setIsDirty,
  } = useProjectForm();
  const [isLoading, setIsLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const router = useRouter();
  const { addToast } = useToast();

  const StepComponent = STEP_COMPONENTS[currentStep];

  // ── Edit-flow hydration (P1-3d / P1-4e / P1-5d / P1-6a / P1-7a) ────────────
  useEffect(() => {
    let cancelled = false;
    if (!projectId) return;
    // Only hydrate once on entry (when name not yet loaded)
    if (formData.step1.projectName) return;

    (async () => {
      setHydrating(true);
      setError(null);
      try {
        const project = await getProjectById(projectId);
        const mapped = mapProjectToFormData(project);
        if (cancelled || !mapped) return;
        Object.entries(mapped).forEach(([step, data]) => updateFormData(step, data));
        // Load existing units into Step 4
        try {
          const { items } = await listUnits(projectId, {});
          if (!cancelled) updateFormData('step4', { units: items });
        } catch { /* units optional */ }
        setIsDirty(false);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load project');
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── Persist a configuration (create when no _id, else update) ──────────────
  const syncConfigurations = useCallback(async (id) => {
    const configs = formData.step2.configurations || [];
    const updated = [];
    for (const cfg of configs) {
      const payload = {
        bhkType: cfg.bhkType,
        title: cfg.title || undefined,
        carpetAreaMin: numOrUndef(cfg.carpetAreaMin),
        carpetAreaMax: numOrUndef(cfg.carpetAreaMax),
        bathrooms: numOrUndef(cfg.bathrooms),
        balconies: numOrUndef(cfg.balconies),
        parking: numOrUndef(cfg.parking),
        totalUnits: numOrUndef(cfg.totalUnits),
      };
      let configId = cfg._id;
      if (cfg._id) {
        await updateConfiguration(cfg._id, payload);
      } else {
        // priceMin/priceMax required on create — real pricing set in Step 4
        const created = await createConfiguration(id, { ...payload, priceMin: 0, priceMax: 0 });
        configId = created?._id;
      }
      // Upload new unit photos if any were added in the config panel
      if (configId && Array.isArray(cfg.imageFiles) && cfg.imageFiles.length > 0) {
        const fd = new FormData();
        cfg.imageFiles.forEach((f) => fd.append('images', f));
        fd.append('sortOrder', '0');
        await updateConfiguration(configId, fd);
      }
      updated.push({ ...cfg, _id: configId, imageFiles: [] });
    }
    updateFormData('step2', { configurations: updated });
  }, [formData.step2.configurations, updateFormData]);

  // ── Save the current step's project-level data ─────────────────────────────
  const saveCurrentStep = useCallback(async () => {
    const s1 = formData.step1;
    const s2 = formData.step2;
    const s3 = formData.step3;
    const s4 = formData.step4;
    const s5 = formData.step5;

    let id = projectId;

    if (currentStep === 1) {
      // Create on first advance, else update. location.area is required by the
      // backend at create time but is only collected in Step 2 — use a placeholder
      // (the project name) when area is not yet known; Step 2 overwrites it.
      const base = {
        name: s1.projectName,
        builderId: s1.builderId,
        reraNumber: s1.reraNumber || undefined,
        reraUrl: s1.reraUrl || undefined,
        projectType: s1.projectType,
        projectStatus: s1.projectStatus,
        contactPerson: s1.contactPerson || undefined,
        contactPhone: s1.contactPhone || undefined,
      };
      if (!id) {
        const created = await createProject({
          ...base,
          listingStatus: 'draft',
          location: { area: s2.area || s1.projectName },
          bhkSummary: s1.configurations || [],
        });
        id = created?._id;
        setProjectId(id);
      } else {
        await updateProject(id, { ...base, bhkSummary: s1.configurations || [] });
      }
      return id;
    }

    if (currentStep === 2) {
      await updateProject(id, {
        location: {
          area: s2.area,
          address: s2.address || undefined,
          city: s2.city || undefined,
          state: s2.state || undefined,
          pincode: s2.pincode || undefined,
        },
        totalTowers: numOrUndef(s2.totalTowers),
        totalFloors: numOrUndef(s2.totalFloors),
        landArea: numOrUndef(s2.landArea),
      });
      await syncConfigurations(id);
      return id;
    }

    if (currentStep === 3) {
      // Client-side validation before hitting the API
      if (s3.videoUrl) {
        try { new URL(s3.videoUrl); } catch {
          throw new Error('Video URL is not valid — use the full URL including https:// (e.g. https://youtu.be/…)');
        }
      }

      const fd = new FormData();
      if (s3.heroImage instanceof File) fd.append('heroImage', s3.heroImage);
      if (s3.masterPlan instanceof File) fd.append('masterPlan', s3.masterPlan);
      if (s3.brochure instanceof File) fd.append('brochure', s3.brochure);
      (s3.gallery || []).forEach((g) => {
        if (g instanceof File) fd.append('images', g);
      });
      if (s3.videoUrl) fd.append('videoUrl', s3.videoUrl);

      const removedIds = s3.removedGalleryPublicIds || [];
      const hasFileChanges =
        (s3.heroImage instanceof File) ||
        (s3.masterPlan instanceof File) ||
        (s3.brochure instanceof File) ||
        (s3.gallery || []).some((g) => g instanceof File);

      if (hasFileChanges || removedIds.length || s3.videoUrl) {
        // Always include removeGalleryIds (even as '[]') so req.body is never empty
        // after multer strips file fields — otherwise Zod's update refine rejects the request
        fd.append('removeGalleryIds', JSON.stringify(removedIds));
        await updateProject(id, fd);
      }
      // Clear the removal queue now that the backend has processed it
      updateFormData('step3', { removedGalleryPublicIds: [] });

      // Per-config floor plan uploads (P1-5b)
      const configs = s2.configurations || [];
      for (const [bhkType, plans] of Object.entries(s3.configFloorPlans || {})) {
        const newFiles = (plans || []).filter((f) => f instanceof File);
        if (!newFiles.length) continue;
        const cfg = configs.find((c) => c.bhkType === bhkType);
        if (!cfg?._id) continue; // config not yet persisted — skip
        const cfgFd = new FormData();
        newFiles.forEach((f) => cfgFd.append('floorPlans', f));
        // sortOrder makes the body non-empty so Zod's "at least one field" passes
        cfgFd.append('sortOrder', String(cfg.sortOrder ?? 0));
        try {
          await updateConfiguration(cfg._id, cfgFd);
        } catch (e) {
          throw new Error(`Failed to upload floor plans for ${bhkType}: ${e.message}`);
        }
      }
      return id;
    }

    if (currentStep === 4) {
      const pricingPayload = {
        priceMin: numOrUndef(s4.priceMin),
        priceMax: numOrUndef(s4.priceMax),
        pricePerSqft: numOrUndef(s4.pricePerSqft),
        maintenanceCharges: s4.maintenanceCharges || undefined,
      };
      // Sanity-check pricing (values are full rupee amounts, not lakhs/crores).
      // Prevents data like "Starting ₹150" from being published.
      const MIN_PROJECT_PRICE = 100000; // ₹1 Lakh
      const { priceMin, priceMax } = pricingPayload;
      if (priceMin !== undefined && priceMin < MIN_PROJECT_PRICE) {
        throw new Error('Starting price looks too low — enter the full amount in rupees (e.g. 12500000 for ₹1.25 Cr).');
      }
      if (priceMax !== undefined && priceMax < MIN_PROJECT_PRICE) {
        throw new Error('Maximum price looks too low — enter the full amount in rupees (e.g. 42500000 for ₹4.25 Cr).');
      }
      if (priceMin !== undefined && priceMax !== undefined && priceMax < priceMin) {
        throw new Error('Maximum price cannot be less than the starting price.');
      }
      if (Object.values(pricingPayload).some((v) => v !== undefined)) {
        await updateProject(id, pricingPayload);
      }
      // Persist per-config pricing edits
      const pricing = s4.configPricing || {};
      for (const cfg of s2.configurations || []) {
        const key = cfg._id || cfg._tempId;
        const p = pricing[key];
        if (cfg._id && p && (p.priceMin !== '' || p.priceMax !== '')) {
          await updateConfiguration(cfg._id, {
            priceMin: numOrUndef(p.priceMin),
            priceMax: numOrUndef(p.priceMax),
          });
        }
      }
      return id;
    }

    if (currentStep === 5) {
      const lc = s5.leadCapture || {};
      await updateProject(id, {
        seoTitle: s5.seoTitle || undefined,
        seoDescription: s5.seoDescription || undefined,
        slug: s5.slug || slugify(s1.projectName) || undefined,
        reraVerified: s5.reraVerified,
        enablePriceRequest: lc.enablePriceRequest,
        enableCallback: lc.enableCallback,
        enableBrochureDownload: lc.enableBrochureDownload,
        whatsappCtaEnabled: lc.whatsappCtaEnabled,
        enableSiteVisit: lc.enableSiteVisit,
      });
      return id;
    }

    return id;
  }, [currentStep, formData, projectId, setProjectId, syncConfigurations]);

  const handleNext = async () => {
    setError(null);
    setFieldErrors(null);
    setIsLoading(true);
    try {
      if (currentStep < 5) {
        await saveCurrentStep();
        setIsDirty(false);
        goToStep(currentStep + 1);
      } else {
        // Step 5 — publish
        await saveCurrentStep();
        const target = formData.step5.listingStatus || 'active';
        await setProjectStatus(projectId, target === 'draft' ? 'draft' : 'active');
        addToast(target === 'draft' ? 'Project saved as draft.' : 'Project published successfully.', 'success');
        router.push('/admin/projects');
      }
    } catch (err) {
      const details = Array.isArray(err?.details) && err.details.length ? err.details : null;
      const msg = getErrorMessage(err, 'Something went wrong while saving');
      setFieldErrors(details);
      setError(details ? null : msg);
      addToast(details ? `${details.length} field error${details.length > 1 ? 's' : ''} — see details above` : msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setFieldErrors(null);
    setIsLoading(true);
    try {
      await saveCurrentStep();
      if (projectId) await setProjectStatus(projectId, 'draft');
      setIsDirty(false);
      addToast('Draft saved.', 'success');
    } catch (err) {
      const details = Array.isArray(err?.details) && err.details.length ? err.details : null;
      const msg = getErrorMessage(err, 'Failed to save draft');
      setFieldErrors(details);
      setError(details ? null : msg);
      addToast(details ? `${details.length} field error${details.length > 1 ? 's' : ''} — see details above` : msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Full-bleed wizard layout — overrides the admin layout max-width
    <div className="fixed inset-0 top-18 flex bg-[#f8f7f5] z-55">
      <WizardSidebar />

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {(error || fieldErrors) && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {fieldErrors ? (
                  <>
                    <p className="font-semibold mb-1">Please fix the following before continuing:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {fieldErrors.map((d, i) => (
                        <li key={i}>
                          <span className="font-medium capitalize">{d.field?.replace(/\./g, ' › ')}:</span>{' '}
                          {d.message}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : error}
              </div>
            )}
            {hydrating ? (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Loading project…
              </div>
            ) : (
              <StepComponent />
            )}
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
