'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
import { invalidateMyListingsSummary } from '@/hooks/useMyListingsSummary';
import { createPropertySubmission } from '@/services/propertySubmissionService';

const MIN_PROPERTY_IMAGES = 5;
const MAX_PROPERTY_IMAGES = 10;

const toFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

const parseFeatureLines = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);

export default function MultiStageListingForm() {
  const { user, openModal } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  
  // 🆕 Upload Status States
  const [uploadStage, setUploadStage] = useState(''); // 'Preparing...', 'Uploading...', 'Finalizing...'
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    // Step 1: Details
    listingType: 'Sale', // Sale, Rent
    buildingType: 'Residential', // Residential, Commercial
    propertyType: 'Apartment',
    city: 'Mumbai',
    locality: '',
    ownerName: '',
    phone: '',
    email: '',
    bhk: '',

    // Step 2: Basics
    possession: 'Ready to Move',
    age: '2-4',
    bathrooms: '2',
    balconies: 'Connected',
    coveredParking: '1',
    openParking: 'N/A',
    carpetArea: '',
    totalArea: '',

    // Step 3: Media
    images: [],
    videoFile: null,
    floorPlans: [],
    brochureFile: null,

    // Step 4: Pricing & Features
    price: '',
    rentPerMonth: '',
    deposit: '',
    maintenanceCharges: '',
    amenities: [],
    featureText: '',
    reraUrl: '',
    reraNumber: '',

    // Step 5: Review
    title: '',
    description: '',
    readyToProceed: false,
  });

  // 🆕 Step Change Auto-Scroll (Internal Container)
  useEffect(() => {
    const container = document.getElementById('form-content-area');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // 🆕 Media Cleanup: Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (form.images && form.images.length > 0) {
        form.images.forEach(file => {
          if (file instanceof File) {
            URL.revokeObjectURL(URL.createObjectURL(file));
          }
        });
      }
    };
  }, [form.images]);

  const steps = [
    { id: 1, name: 'Property Details', icon: 'home_work' },
    { id: 2, name: 'Location & Basics', icon: 'location_on' },
    { id: 3, name: 'Media', icon: 'image' },
    { id: 4, name: 'Pricing', icon: 'payments' },
    { id: 5, name: 'Review', icon: 'fact_check' },
  ];

  const handleNext = () => {
    if (step === 3 && form.images.length < MIN_PROPERTY_IMAGES) {
      setFeedback({
        type: 'error',
        message: `Please upload at least ${MIN_PROPERTY_IMAGES} property images before continuing.`,
      });
      return;
    }

    setFeedback((prev) => (prev.type === 'error' ? { type: '', message: '' } : prev));
    setStep((s) => Math.min(s + 1, 5));
  };
  
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleToggle = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImagesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const oversized = selectedFiles.filter((f) => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) {
      setFeedback({
        type: 'error',
        message: `${oversized.length > 1 ? `${oversized.length} images exceed` : `"${oversized[0].name}" exceeds`} the 2 MB limit. Please compress and re-upload.`,
      });
      event.target.value = '';
      return;
    }

    const existingFiles = Array.isArray(form.images) ? form.images : [];
    const mergedFiles = [...existingFiles];
    const seenKeys = new Set(existingFiles.map(toFileKey));

    selectedFiles.forEach((file) => {
      const key = toFileKey(file);
      if (seenKeys.has(key)) return;
      mergedFiles.push(file);
      seenKeys.add(key);
    });

    const exceededLimit = mergedFiles.length > MAX_PROPERTY_IMAGES;
    const nextImages = exceededLimit ? mergedFiles.slice(0, MAX_PROPERTY_IMAGES) : mergedFiles;

    setForm((prev) => ({ ...prev, images: nextImages }));
    setFeedback((prev) => {
      if (exceededLimit) {
        return {
          type: 'error',
          message: `You can upload up to ${MAX_PROPERTY_IMAGES} property images.`,
        };
      }

      if (nextImages.length >= MIN_PROPERTY_IMAGES && prev.type === 'error') {
        return { type: '', message: '' };
      }

      return prev;
    });

    event.target.value = '';
  };

  const clearSelectedImages = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setForm((prev) => ({ ...prev, images: [] }));
  };

  const handleFloorPlansSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const oversized = selectedFiles.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setFeedback({
        type: 'error',
        message: `${oversized.length > 1 ? `${oversized.length} files exceed` : `"${oversized[0].name}" exceeds`} the 5 MB limit.`,
      });
      event.target.value = '';
      return;
    }

    setForm((prev) => {
      const merged = [...(prev.floorPlans || []), ...selectedFiles];
      const limited = merged.length > 5 ? merged.slice(0, 5) : merged;
      return { ...prev, floorPlans: limited };
    });

    event.target.value = '';
  };

  const clearFloorPlans = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setForm((prev) => ({ ...prev, floorPlans: [] }));
  };

  const handleBrochureSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: `Brochure file exceeds the 5 MB limit.`,
      });
      event.target.value = '';
      return;
    }

    setForm((prev) => ({ ...prev, brochureFile: file }));
    event.target.value = '';
  };

  const submitListing = useCallback(async () => {
    if (form.images.length < MIN_PROPERTY_IMAGES) {
      setStep(3);
      setFeedback({
        type: 'error',
        message: `Please upload at least ${MIN_PROPERTY_IMAGES} property images before submitting.`,
      });
      return;
    }

    const phone = toIndianPhoneE164(form.phone);
    if (!phone) {
      setFeedback({ type: 'error', message: 'Please go back and enter a valid phone number.' });
      return;
    }

    setIsSubmitting(true);
    setUploadStage('Preparing assets...');
    setUploadProgress(15);

    try {
      const payload = new FormData();
      payload.append('ownerName', form.ownerName);
      payload.append('phone', phone);
      if (form.email) payload.append('email', form.email);
      payload.append('listingType', form.listingType);
      payload.append('buildingType', form.buildingType);
      payload.append('propertyType', form.propertyType);
      payload.append('city', form.city || 'Mumbai');
      payload.append('locality', form.locality);
      let possessionValue = form.possession;
      if (possessionValue === 'Available Now') possessionValue = 'Ready to Move';
      if (possessionValue === 'Available Soon') possessionValue = 'Under Construction';
      payload.append('possession', possessionValue);
      if (form.age) payload.append('age', form.age);
      payload.append('bathrooms', form.bathrooms);
      if (form.bhk) payload.append('bhk', form.bhk);
      if (form.balconies) payload.append('balconies', form.balconies);
      if (form.coveredParking) payload.append('coveredParking', form.coveredParking);
      if (form.openParking) payload.append('openParking', form.openParking);
      if (form.carpetArea) payload.append('carpetArea', form.carpetArea);
      if (form.totalArea) payload.append('totalArea', form.totalArea);

      if (form.listingType === 'Sale' && form.price) {
        const parsedPrice = parseInt(String(form.price).replace(/,/g, ''), 10);
        if (Number.isFinite(parsedPrice)) payload.append('price', String(parsedPrice));
      }

      if (form.listingType === 'Rent') {
        if (form.rentPerMonth) {
          const rentValue = parseInt(String(form.rentPerMonth).replace(/,/g, ''), 10);
          if (Number.isFinite(rentValue)) payload.append('rentPerMonth', String(rentValue));
        }
        if (form.deposit) {
          const depositValue = parseInt(String(form.deposit).replace(/,/g, ''), 10);
          if (Number.isFinite(depositValue)) payload.append('deposit', String(depositValue));
        }
        if (form.maintenanceCharges) {
          const maintenanceValue = parseInt(String(form.maintenanceCharges).replace(/,/g, ''), 10);
          if (Number.isFinite(maintenanceValue)) payload.append('maintenanceCharges', String(maintenanceValue));
        }
      }

      if (form.amenities.length > 0) {
        payload.append('amenities', JSON.stringify(form.amenities));
      }

      const features = parseFeatureLines(form.featureText);
      if (features.length > 0) {
        payload.append('feature', JSON.stringify(features));
      }

      if (form.reraUrl && form.reraUrl.trim()) {
        payload.append('reraUrl', form.reraUrl.trim());
      }

      if (form.reraNumber && form.reraNumber.trim()) {
        payload.append('reraNumber', form.reraNumber.trim());
      }

      if (form.floorPlans && form.floorPlans.length > 0) {
        form.floorPlans.forEach((file) => payload.append('floorPlans', file));
      }

      if (form.brochureFile) {
        payload.append('brochure', form.brochureFile);
      }

      if (form.title) payload.append('title', form.title);
      if (form.description) payload.append('description', form.description);
      payload.append('readyToProceed', String(Boolean(form.readyToProceed)));

      if (form.images.length > 0) {
        form.images.forEach((file) => payload.append('images', file));
      }

      if (form.videoFile) {
        payload.append('video', form.videoFile);
        payload.append(
          'videoMeta',
          JSON.stringify({
            name: form.videoFile.name,
            size: form.videoFile.size,
            type: form.videoFile.type,
          })
        );
      }

      setUploadStage(`Uploading ${form.images.length} property images...`);
      setUploadProgress(45);
      
      // Artificial delay for UX visibility of the loader
      await new Promise(r => setTimeout(r, 1000));
      setUploadProgress(75);

      await createPropertySubmission(payload);
      
      setUploadStage('Finalizing listing details...');
      setUploadProgress(95);
      
      invalidateMyListingsSummary(user);

      setIsSuccessModalOpen(true);
      setFeedback({ type: 'success', message: 'Property submitted for review successfully!' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Submission failed.') });
    } finally {
      setIsSubmitting(false);
      setUploadStage('');
      setUploadProgress(0);
    }
  }, [form, user]);

  useEffect(() => {
    if (!user || !queuedSubmit || isSubmitting) return;
    setQueuedSubmit(false);
    void submitListing();
  }, [user, queuedSubmit, isSubmitting, submitListing]);

  const handleSubmit = async () => {
    if (!user) {
      setQueuedSubmit(true);
      setFeedback({ type: 'error', message: 'Please login to submit your property.' });
      openModal('login');
      return;
    }

    await submitListing();
  };

  const progress = (step / 5) * 100;

  return (
    <>
    <div className="flex bg-white md:bg-slate-50 h-screen overflow-hidden">
      {/* 🧭 Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 sticky top-0 h-screen shadow-sm z-50">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">Bricks Listing</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">List Property</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 5</p>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Progress</span>
              <span className="text-[10px] font-black text-slate-900">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 py-10 overflow-y-auto custom-scrollbar">
          {steps.map((s) => (
            <div 
              key={s.id}
              className={`flex items-center gap-4 px-8 py-4 transition-all cursor-default ${
                step === s.id 
                  ? 'text-primary border-r-4 border-primary bg-primary/5 font-black' 
                  : step > s.id 
                    ? 'text-emerald-500 font-bold' 
                    : 'text-slate-400 font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {step > s.id ? 'check_circle' : s.icon}
              </span>
              <span className="text-sm tracking-tight">{s.name}</span>
            </div>
          ))}
        </nav>

        {/* <div className="p-8 border-t border-slate-50">
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
            Save Draft
          </button>
        </div> */}
      </aside>

      {/* 🏞️ Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 🆕 Sticky Mobile Header & Progress Bar */}
        <div className="flex-none bg-white/95 backdrop-blur-xl border-b border-slate-100 lg:hidden h-14 flex items-center px-6 relative z-50">
          <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
          <span className="text-lg font-black text-slate-900 tracking-tighter">Bricks</span>
          <div className="ml-auto flex items-center gap-3">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">Step {step}/5</span>
             <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
               <span className="material-symbols-outlined text-xs text-slate-400">person</span>
             </div>
          </div>
        </div>

        {/* 🆕 Scrollable Internal Content */}
        <div id="form-content-area" className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-4xl mx-auto w-full px-6 md:px-12 py-8 md:py-16">
            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4 ">Basic Information</h1>
                  <p className="text-slate-500 text-sm md:text-base font-bold">Start with the fundamental details of your Mumbai estate.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Listing Type</label>
                    <div className="grid grid-cols-2 p-1 bg-slate-50 md:bg-slate-100 rounded-2xl">
                      <button 
                        onClick={() => handleToggle('listingType', 'Sale')}
                        className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.listingType === 'Sale' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Sale
                      </button>
                      <button 
                        onClick={() => handleToggle('listingType', 'Rent')}
                        className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.listingType === 'Rent' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                  {/* <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Building Type</label>
                    <div className="grid grid-cols-1 p-1 bg-slate-50 md:bg-slate-100 rounded-2xl">
                      <button 
                        className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-white text-primary shadow-sm`}
                      >
                        Residential Only
                      </button>
                    </div>
                  </div> */}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Type</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {['Apartment', 'Penthouse', 'Villa', 'Bungalow', 'Commercial'].map(type => (
                      <button 
                        key={type}
                        onClick={() => handleToggle('propertyType', type)}
                        className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all ${form.propertyType === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 md:border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-3 md:space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner Name</label>
                      <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="Full Name" value={form.ownerName} onChange={handleChange('ownerName')} />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                      <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange('phone')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">BHK</label>
                  <div className="flex gap-2 flex-wrap">
                    {['1', '2', '3', '4', '5+'].map(bhk => (
                      <button
                        key={bhk}
                        onClick={() => handleToggle('bhk', bhk)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs transition-all ${form.bhk === bhk ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {bhk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Basics */}
            {step === 2 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4 ">Location & Config</h1>
                  <p className="text-slate-500 text-sm md:text-base font-bold">Specify the locality and fundamental property configurations.</p>
                </div>

                {/* 🆕 Enhanced Map/Locality Section */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pin Your Locality</label>
                  <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">location_on</span>
                      <input className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 pl-12 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="Locality or Building Name (e.g. Worli Sea Face)" value={form.locality} onChange={handleChange('locality')} />
                  </div>
                  {/* <div className="aspect-16/9 md:aspect-21/9 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-6 group cursor-pointer hover:border-primary/20 transition-all">
                      <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">map</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest  mb-1">Interactive Map Focus</span>
                      <p className="text-[9px] text-slate-400 font-bold max-w-xs text-center">Pin precisely for higher visibility. Mumbai Island & Suburbs Coverage.</p>
                  </div> */}
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Availability Status</label>
                  <div className="flex gap-4">
                    {(form.listingType === 'Rent' ? ['Available Now', 'Available Soon'] : ['Ready to Move', 'Under Construction']).map(stat => (
                      <button
                        key={stat}
                        onClick={() => handleToggle('possession', stat)}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all ${form.possession === stat ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-100'}`}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Age (Years)</label>
                    <div className="flex gap-2 flex-wrap">
                      {['0-1', '2-4', '5-7', '8-10', '10+'].map(age => (
                        <button 
                          key={age}
                          onClick={() => handleToggle('age', age)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs transition-all ${form.age === age ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bathrooms</label>
                    <div className="flex gap-2 flex-wrap">
                      {['1', '2', '3', '4', '5+'].map(count => (
                        <button
                          key={count}
                          onClick={() => handleToggle('bathrooms', count)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs transition-all ${form.bathrooms === count ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Carpet Area (sq.ft)</label>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. 650" value={form.carpetArea} onChange={handleChange('carpetArea')} type="number" />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Total Area (sq.ft)</label>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. 950" value={form.totalArea} onChange={handleChange('totalArea')} type="number" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Media */}
            {step === 3 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4 ">Visual Identity</h1>
                  <p className="text-slate-500 text-sm md:text-base font-bold">High-quality visuals significantly increase listing performance.</p>
                </div>
                
                <div
                  className="border-4 border-dashed border-slate-100 rounded-2xl p-10 md:p-20 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white"
                  onClick={() => document.getElementById('images-upload').click()}
                >
                  <input id="images-upload" type="file" className="hidden" accept="image/*" multiple onChange={handleImagesSelected} />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900  tracking-tight">Upload Gallery</h3>
                  <p className="text-slate-400 font-bold text-[10px] md:text-sm mt-2 max-w-xs mx-auto">Min 5, Max 10 photos. PNG, JPG up to 2MB.</p>
                  {form.images.length > 0 && (
                    <p className={`font-black text-[10px] mt-4 uppercase tracking-widest ${form.images.length >= MIN_PROPERTY_IMAGES ? 'text-emerald-600' : 'text-primary'}`}>
                      {form.images.length}/{MAX_PROPERTY_IMAGES} image{form.images.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                  {form.images.length > 0 && (
                    <div className="mt-8 flex flex-wrap justify-center gap-2 mb-8 animate-in fade-in zoom-in-95">
                      {form.images.map((file, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-col md:flex-row items-center gap-3 w-full max-w-sm">
                    <button className="w-full px-10 py-3.5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all">
                      {form.images.length > 0 ? 'Add More' : 'Select Media'}
                    </button>
                    {form.images.length > 0 && (
                      <button type="button" onClick={clearSelectedImages} className="w-full px-6 py-3.5 border-2 border-slate-200 text-slate-500 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all">
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Video (Optional)</label>
                  <div className="border-4 border-dashed border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white" onClick={() => document.getElementById('video-upload').click()}>
                    <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleToggle('videoFile', e.target.files[0])} />
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">videocam</span>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-900  tracking-tight uppercase truncate max-w-xs">{form.videoFile ? form.videoFile.name : 'Click to upload video'}</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Floor Plans (Optional)</label>
                  <div className="border-4 border-dashed border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white" onClick={() => document.getElementById('floor-plans-upload').click()}>
                    <input id="floor-plans-upload" type="file" className="hidden" accept="image/*,application/pdf" multiple onChange={handleFloorPlansSelected} />
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">grid_view</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Upload Floor Plans</h3>
                    <p className="text-slate-400 font-bold text-[10px] md:text-sm mt-2 max-w-xs mx-auto">Max 5 files. PNG, JPG, PDF up to 5MB each.</p>
                    {form.floorPlans.length > 0 && (
                      <p className={`font-black text-[10px] mt-4 uppercase tracking-widest ${form.floorPlans.length > 0 ? 'text-emerald-600' : 'text-primary'}`}>
                        {form.floorPlans.length} file{form.floorPlans.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                    {form.floorPlans.length > 0 && (
                      <button type="button" onClick={clearFloorPlans} className="mt-4 px-6 py-2.5 border-2 border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all">
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Brochure (Optional)</label>
                  <div className="border-4 border-dashed border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white" onClick={() => document.getElementById('brochure-upload').click()}>
                    <input id="brochure-upload" type="file" className="hidden" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleBrochureSelected} />
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">description</span>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-900 tracking-tight uppercase truncate max-w-xs">{form.brochureFile ? form.brochureFile.name : 'Click to upload brochure'}</h4>
                    <p className="text-slate-400 font-bold text-[9px] mt-1 max-w-xs mx-auto">PDF or DOC up to 5MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {step === 4 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4 ">Valuation & Assets</h1>
                  <p className="text-slate-500 text-sm md:text-base font-bold">{form.listingType === 'Rent' ? 'Define the rental terms and premium amenities.' : 'Define the market value and premium amenities.'}</p>
                </div>

                {form.listingType === 'Sale' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expected Price (₹)</label>
                    <div className="relative group max-w-md">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-300 group-focus-within:text-primary transition-colors">₹</span>
                        <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 md:p-8 pl-12 md:pl-14 font-black text-2xl md:text-4xl tracking-tighter placeholder:text-slate-100 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="0.00" value={form.price} onChange={handleChange('price')} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rent Per Month (₹)</label>
                      <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg text-slate-300 group-focus-within:text-primary transition-colors">₹</span>
                          <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 pl-10 font-black text-lg placeholder:text-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="0.00" value={form.rentPerMonth} onChange={handleChange('rentPerMonth')} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Deposit (₹)</label>
                      <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg text-slate-300 group-focus-within:text-primary transition-colors">₹</span>
                          <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 pl-10 font-black text-lg placeholder:text-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="0.00" value={form.deposit} onChange={handleChange('deposit')} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Maintenance (₹/month)</label>
                      <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg text-slate-300 group-focus-within:text-primary transition-colors">₹</span>
                          <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 pl-10 font-black text-lg placeholder:text-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="0.00" value={form.maintenanceCharges} onChange={handleChange('maintenanceCharges')} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Premium Amenities</label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {['Infinity Pool', 'Private Gym', 'Concierge', 'Home Automation', 'Vastu Compliant', 'Sea View'].map(amenity => (
                      <button 
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`flex items-center gap-3 px-4 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border-2 font-black text-[10px] md:text-xs transition-all ${form.amenities.includes(amenity) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-white text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {form.amenities.includes(amenity) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hero Feature Bullets</label>
                      <textarea rows="4" className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 font-bold placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none" placeholder={"One bullet per line..."} value={form.featureText} onChange={handleChange('featureText')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RERA Number</label>
                        <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. MahaRERA No." value={form.reraNumber} onChange={handleChange('reraNumber')} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RERA URL</label>
                        <input type="url" className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="MahaRERA link..." value={form.reraUrl} onChange={handleChange('reraUrl')} />
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4 ">Final Review</h1>
                  <p className="text-slate-500 text-sm md:text-base font-bold">Review and confirm your Mumbai Editorial feature.</p>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-50/50 rounded-2xl p-6 md:p-10 border border-slate-100 space-y-6 md:space-y-8 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                          <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Listing Info</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">{form.listingType} | {form.propertyType}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Locality</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">{form.locality}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {form.listingType === 'Rent' ? 'Rent/Month' : 'Price'}
                              </p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">
                                ₹ {form.listingType === 'Rent' ? (form.rentPerMonth || '0.00') : (form.price || '0.00')}
                              </p>
                          </div>
                          {form.listingType === 'Rent' && form.deposit && (
                            <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Deposit</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">₹ {form.deposit}</p>
                            </div>
                          )}
                          {form.listingType === 'Rent' && form.maintenanceCharges && (
                            <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Maintenance</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">₹ {form.maintenanceCharges}/month</p>
                            </div>
                          )}
                          <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Owner</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">{form.ownerName}</p>
                          </div>
                          {form.carpetArea && (
                            <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Carpet Area</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">{form.carpetArea} sq.ft</p>
                            </div>
                          )}
                          {form.totalArea && (
                            <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Area</p>
                              <p className="text-xs md:text-sm font-bold text-slate-900">{form.totalArea} sq.ft</p>
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Editorial Title</label>
                      <input className="w-full bg-white border-2 border-slate-50 rounded-xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. Luxury Sea-Facing Sky Villa" value={form.title} onChange={handleChange('title')} />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                      <textarea rows="5" className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 font-bold placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none" placeholder="Draft a high-end description..." value={form.description} onChange={handleChange('description')} />
                    </div>

                    <label className="flex items-center gap-4 group cursor-pointer p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer h-5 w-5 rounded border-2 border-slate-200 text-primary focus:ring-primary opacity-0 absolute" onChange={(e) => handleToggle('readyToProceed', e.target.checked)} />
                        <div className="h-5 w-5 rounded border-2 border-slate-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-white text-xs scale-0 peer-checked:scale-100 transition-transform">check</span>
                        </div>
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors  leading-relaxed uppercase tracking-tight">I confirm that all provided property details are accurate for review.</span>
                    </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🆕 Sticky Desktop/Mobile Navigation Container */}
        <div className="flex-none bg-white border-t border-slate-100 z-50">
          {/* 🆕 Sticky Desktop Navigation */}
          <div className="hidden md:flex p-6 md:px-12 justify-between items-center max-w-4xl mx-auto w-full">
            {step > 1 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-8 py-4 border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
            )}
            <div className={`flex gap-4 ${step === 1 ? 'ml-auto' : ''}`}>
                {step < 5 ? (
                  <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    Next Phase <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isSubmitting || !form.readyToProceed} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-30 transition-all active:scale-95">
                    {isSubmitting ? 'Submitting...' : 'Confirm'} <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                )}
            </div>
          </div>

          {/* 🆕 Sticky Mobile Navigation Bar */}
          <div className="p-4 flex gap-4 lg:hidden">
            {step > 1 && (
              <button onClick={handleBack} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 active:scale-95 transition-all">
                Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={handleNext} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting || !form.readyToProceed} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-30 active:scale-95 transition-all">
                {isSubmitting ? 'Submitting...' : 'Confirm'} <span className="material-symbols-outlined text-sm">send</span>
              </button>
            )}
          </div>
        </div>

        {feedback.message && (
          <div className="px-6 py-3 bg-white/95 backdrop-blur-md border-t border-slate-100 absolute bottom-20 md:bottom-24 left-0 right-0 z-40 animate-in slide-in-from-bottom-2 duration-300 shadow-lg">
              <p className={`text-center text-[10px] md:text-xs font-black uppercase tracking-widest ${feedback.type === 'error' ? 'text-primary' : 'text-emerald-600'}`}>
                {feedback.message}
              </p>
          </div>
        )}
      </main>

      {/* 🆕 High-Impact Upload Loader Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="text-center space-y-8 max-w-xs w-full px-6">
              <div className="relative">
                {/* Circular Progress SVG */}
                <svg className="w-32 h-32 mx-auto rotate-[-90deg]">
                   <circle cx="64" cy="64" r="60" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                   <circle cx="64" cy="64" r="60" fill="none" stroke="#B80049" strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * uploadProgress / 100)} strokeLinecap="round" className="transition-all duration-500 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-2xl font-black text-slate-900 tracking-tighter">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{uploadStage}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Please do not refresh the page.</p>
              </div>
              <div className="flex justify-center gap-1">
                 {[0, 1, 2].map(i => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full bg-primary animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>

    {/* ✨ Success Milestone Popup */}
    {isSuccessModalOpen && (
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => router.push('/')} />
        <div className="relative bg-white w-full max-w-lg rounded-2xl p-8 md:p-12 text-center shadow-2xl animate-in zoom-in-95 fade-in duration-500 border border-slate-100">
          <div className="mb-8 relative inline-block">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce duration-1000">
              <span className="material-symbols-outlined text-5xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 ">Listing Received!</h2>
          <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm md:text-base">Your Mumbai estate is now in review. We&apos;ll notify you within 24 hours.</p>
          <button onClick={() => router.push('/')} className="w-full py-5 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl">
            Continue Exploring
          </button>
        </div>
      </div>
    )}
    </>
  );
}
