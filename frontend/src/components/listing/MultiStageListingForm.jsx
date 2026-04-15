'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api/errors';
import { toIndianPhoneE164 } from '@/lib/validation/phone';
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuedSubmit, setQueuedSubmit] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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

    // Step 2: Basics
    possession: 'Ready to Move',
    age: '2-4',
    bathrooms: '2',
    balconies: 'Connected',
    coveredParking: '1',
    openParking: 'N/A',

    // Step 3: Media
    images: [],
    videoFile: null,

    // Step 4: Pricing & Features
    price: '',
    amenities: [],
    featureText: '',
    reraUrl: '',

    // Step 5: Review
    title: '',
    description: '',
    readyToProceed: false,
  });

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
      payload.append('possession', form.possession);
      payload.append('age', form.age);
      payload.append('bathrooms', form.bathrooms);
      if (form.balconies) payload.append('balconies', form.balconies);
      if (form.coveredParking) payload.append('coveredParking', form.coveredParking);
      if (form.openParking) payload.append('openParking', form.openParking);

      if (form.price) {
        const parsedPrice = parseInt(String(form.price).replace(/,/g, ''), 10);
        if (Number.isFinite(parsedPrice)) payload.append('price', String(parsedPrice));
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

      await createPropertySubmission(payload);

      setFeedback({ type: 'success', message: 'Property submitted for review successfully!' });
      // Reset or Redirect logic here
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Submission failed.') });
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

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
    <div className="flex bg-slate-50 min-h-screen">
      {/* 🧭 Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 sticky top-0 h-screen">
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

        <nav className="flex-1 py-10">
          {steps.map((s) => (
            <div 
              key={s.id}
              className={`flex items-center gap-4 px-8 py-4 transition-all ${
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

        <div className="p-8 border-t border-slate-50">
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
            Save Draft
          </button>
        </div>
      </aside>

      {/* 🏞️ Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="flex justify-between items-center px-10 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 lg:hidden">
           <span className="text-xl font-black text-slate-900 tracking-tighter">Bricks</span>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step}/5</span>
              <div className="w-8 h-8 rounded-full bg-slate-100"></div>
           </div>
        </header>

        <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-16">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">Basic Information</h1>
                <p className="text-slate-500 font-bold">Let&apos;s start with the fundamental details of your Mumbai estate.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Listing Type</label>
                  <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
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
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Building Type</label>
                  <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
                    <button 
                      onClick={() => handleToggle('buildingType', 'Residential')}
                      className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.buildingType === 'Residential' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Residential
                    </button>
                    <button 
                      onClick={() => handleToggle('buildingType', 'Commercial')}
                      className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.buildingType === 'Commercial' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Commercial
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Type</label>
                <div className="flex flex-wrap gap-3">
                  {['Apartment', 'Penthouse', 'Villa', 'Plot', 'Bungalow'].map(type => (
                    <button 
                      key={type}
                      onClick={() => handleToggle('propertyType', type)}
                      className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${form.propertyType === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner Name</label>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="Full Name" value={form.ownerName} onChange={handleChange('ownerName')} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange('phone')} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Locality/Building Name</label>
                 <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">location_on</span>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 pl-12 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. Worli Sea Face" value={form.locality} onChange={handleChange('locality')} />
                 </div>
              </div>
            </div>
          )}

          {/* Step 2: Basics */}
          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">Technical Config</h1>
                <p className="text-slate-500 font-bold">Provide fundamental property specifics for accurate evaluation.</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Possession Status</label>
                <div className="flex gap-4">
                  {['Ready to Move', 'Under Construction'].map(stat => (
                    <button 
                      key={stat}
                      onClick={() => handleToggle('possession', stat)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${form.possession === stat ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-100'}`}
                    >
                      {stat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Age (Years)</label>
                  <div className="flex gap-2 flex-wrap">
                    {['0-1', '2-4', '5-7', '8-10', '10+'].map(age => (
                      <button 
                        key={age}
                        onClick={() => handleToggle('age', age)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${form.age === age ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
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
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${form.bathrooms === count ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Covered Parking</label>
                  <div className="flex gap-2 flex-wrap">
                    {['N/A', '1', '2', '3', '4+'].map(count => (
                      <button 
                        key={count}
                        onClick={() => handleToggle('coveredParking', count)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${form.coveredParking === count ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Open Parking</label>
                  <div className="flex gap-2 flex-wrap">
                    {['N/A', '1', '2', '3', '4+'].map(count => (
                      <button 
                        key={count}
                        onClick={() => handleToggle('openParking', count)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${form.openParking === count ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">Visual Identity</h1>
                <p className="text-slate-500 font-bold">High-quality visuals significantly increase listing performance.</p>
              </div>
              
              <div
                className="border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white"
                onClick={() => document.getElementById('images-upload').click()}
              >
                <input
                  id="images-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelected}
                />
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 italic tracking-tight">Upload Property Gallery</h3>
                <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs mx-auto">PNG, JPG up to 10MB each. Add images in multiple selections. Minimum 5 and maximum 10 photos per listing.</p>
                {form.images.length > 0 && (
                  <p
                    className={`font-black text-xs mt-4 uppercase tracking-widest ${
                      form.images.length >= MIN_PROPERTY_IMAGES ? 'text-emerald-600' : 'text-primary'
                    }`}
                  >
                    {form.images.length}/{MAX_PROPERTY_IMAGES} image{form.images.length > 1 ? 's' : ''} selected
                    {form.images.length < MIN_PROPERTY_IMAGES
                      ? ` (${MIN_PROPERTY_IMAGES - form.images.length} more required)`
                      : ''}
                  </p>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    {form.images.length > 0 ? 'Add More Media' : 'Select Media'}
                  </button>
                  {form.images.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelectedImages}
                      className="px-6 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Video (Optional)</label>
                <div 
                  className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-10 text-center flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer bg-white"
                  onClick={() => document.getElementById('video-upload').click()}
                >
                  <input 
                    id="video-upload"
                    type="file" 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => handleToggle('videoFile', e.target.files[0])}
                  />
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">videocam</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 italic tracking-tight uppercase">
                    {form.videoFile ? form.videoFile.name : 'Click to upload video'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">MP4, MOV up to 50MB</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-8 rounded-4xl flex items-start gap-6 border border-emerald-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 italic tracking-tight uppercase text-xs mb-1">Editorial Tip</h4>
                  <p className="text-emerald-700/80 text-sm font-bold leading-relaxed">Ensure photos reach into the corners of the room for a sense of scale. Natural daylight at dusk provides the most premium &quot;Editorial&quot; look.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">Valuation & Assets</h1>
                <p className="text-slate-500 font-bold">Define the market value and premium amenities of your property.</p>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expected Price (₹)</label>
                 <div className="relative group max-w-md">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-300 group-focus-within:text-primary transition-colors">₹</span>
                    <input className="w-full bg-white border-2 border-slate-50 rounded-4xl p-8 pl-14 font-black text-4xl tracking-tighter placeholder:text-slate-100 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="0.00" value={form.price} onChange={handleChange('price')} />
                 </div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest px-6 italic">Price is negotiable for verified listings.</p>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Premium Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Infinity Pool', 'Private Gym', 'Concierge', 'High-Speed Elevators', 'Italian Marble', 'Home Automation', 'Vastu Compliant', 'Sea View'].map(amenity => (
                    <button 
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-black text-xs transition-all ${form.amenities.includes(amenity) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-white text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {form.amenities.includes(amenity) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hero Feature Bullets</label>
                  <textarea
                    rows="6"
                    className="w-full bg-white border-2 border-slate-50 rounded-3xl p-6 font-bold placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none"
                    placeholder={"One bullet per line\nZero Brokerage\nBest Price Guarantee\nPay 20% now and 80% on possession"}
                    value={form.featureText}
                    onChange={handleChange('featureText')}
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    These bullets will appear on the property hero image.
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RERA URL</label>
                  <input
                    type="url"
                    className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-300 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                    placeholder="https://maharera.mahaonline.gov.in/..."
                    value={form.reraUrl}
                    onChange={handleChange('reraUrl')}
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Add the official MahaRERA project detail link.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">Final Review</h1>
                <p className="text-slate-500 font-bold">Craft a compelling narrative for your Mumbai Editorial feature.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 📝 Summary & Inputs Column */}
                <div className="lg:col-span-8 space-y-10">
                   {/* Summary Section */}
                   <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 space-y-8 shadow-sm">
                      <h3 className="font-black text-slate-900 italic tracking-tight uppercase text-xs opacity-50">Data Integrity Summary</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listing Type</p>
                            <p className="text-sm font-bold text-slate-900">{form.listingType} - {form.buildingType}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Property Type</p>
                            <p className="text-sm font-bold text-slate-900">{form.propertyType}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ownership</p>
                            <p className="text-sm font-bold text-slate-900">{form.ownerName}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Information</p>
                            <p className="text-sm font-bold text-slate-900">{form.phone}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Locality</p>
                            <p className="text-sm font-bold text-slate-900">{form.locality}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
                            <p className="text-sm font-bold text-slate-900">{form.bathrooms} Bath | {form.balconies} Balcony</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Possession Lifecycle</p>
                            <p className="text-sm font-bold text-slate-900">{form.possession} ({form.age} years)</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valuations / Parking</p>
                            <p className="text-sm font-bold text-slate-900">₹{form.price} | C:{form.coveredParking} O:{form.openParking}</p>
                         </div>
                         <div className="md:col-span-2 space-y-1 pt-4 border-t border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Premium Amenities</p>
                            <p className="text-sm font-bold text-slate-900">{form.amenities.length > 0 ? form.amenities.join(', ') : 'No specific amenities selected'}</p>
                         </div>
                         <div className="md:col-span-2 space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hero Feature Bullets</p>
                           <p className="text-sm font-bold text-slate-900">
                            {parseFeatureLines(form.featureText).length > 0
                              ? parseFeatureLines(form.featureText).join(' | ')
                              : 'No hero bullets added'}
                           </p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RERA URL</p>
                           <p className="text-sm font-bold text-slate-900 break-all">{form.reraUrl || 'Not added'}</p>
                         </div>
                         {form.videoFile && (
                            <div className="md:col-span-2 space-y-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Video Engagement Attachment</p>
                               <p className="text-sm font-bold text-emerald-600 flex items-center gap-2 italic">
                                 <span className="material-symbols-outlined text-sm">check_circle</span>
                                 {form.videoFile.name} (Ready for upload)
                               </p>
                            </div>
                         )}
                      </div>
                   </div>

                  {/* Title & Description Inputs */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Editorial Title</label>
                     <input className="w-full bg-white border-2 border-slate-50 rounded-2xl p-4 font-black placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" placeholder="e.g. Luxury Sea-Facing Sky Villa" value={form.title} onChange={handleChange('title')} />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Description</label>
                     <textarea rows="8" className="w-full bg-white border-2 border-slate-50 rounded-4xl p-8 font-bold placeholder:text-slate-200 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none" placeholder="Draft a high-end description focusing on lifestyle and neighborhood..." value={form.description} onChange={handleChange('description')} />
                  </div>

                  {/* ✅ Readiness Checkbox */}
                  <label className="flex items-center gap-4 group cursor-pointer p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-6 w-6 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-all cursor-pointer opacity-0 absolute"
                        onChange={(e) => handleToggle('readyToProceed', e.target.checked)}
                      />
                      <div className="h-6 w-6 rounded-lg border-2 border-slate-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-white text-sm scale-0 peer-checked:scale-100 transition-transform">check</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors italic">I have gone through all the details and I am ready to proceed with the showcase submission.</span>
                  </label>
                </div>

                {/* 🖼️ Preview Card Column */}
                <div className="lg:col-span-4 flex justify-center lg:justify-start">
                  <div className="sticky top-24 space-y-6 w-full max-w-md">
                    <div className="bg-white rounded-moderate overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-slate-100">
                      <div className="aspect-4/3 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                         <span className="material-symbols-outlined text-4xl text-slate-200 group-hover:scale-110 transition-transform">image</span>
                         <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Verified</div>
                         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-primary tracking-widest uppercase shadow-sm">Preview</div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1 tracking-tight truncate italic">
                                 {form.title || 'Property Title'}
                              </h3>
                              <p className="text-slate-500 text-xs flex items-center gap-1">
                                 <span className="material-symbols-outlined text-xs">location_on</span>
                                 {form.locality || 'Mumbai Location'}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-primary font-black text-xl tracking-tighter italic">₹ {form.price || '0.00'}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Step 5 Complete</p>
                           </div>
                        </div>

                        <div className="flex gap-4 mb-6 text-[10px] text-slate-500 border-t border-slate-100 pt-4 mt-auto">
                           <div className="flex items-center gap-1 font-bold text-slate-900 uppercase tracking-widest">
                              <span className="material-symbols-outlined text-sm text-primary">apartment</span> {form.propertyType}
                           </div>
                           <div className="flex items-center gap-1 font-bold text-slate-900 uppercase tracking-widest">
                              <span className="material-symbols-outlined text-sm text-primary">bathtub</span> {form.bathrooms} Bath
                           </div>
                        </div>

                        <button className="w-full bg-primary text-white py-3 rounded-full font-bold text-xs tracking-tight hover:bg-primary/90 transition-all uppercase shadow-lg shadow-primary/20">
                           View Details
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-4xl shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                      <h4 className="font-black mb-3 flex items-center gap-2 italic uppercase text-xs text-primary">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        Editor&apos;s Note
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed font-bold">
                        High-quality descriptions focus on lifestyle benefits rather than just technical specifications. Mention neighborhood proximity and unique architectural features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🔘 Navigation Controls */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-3 px-10 py-5 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous Phase
              </button>
            )}
            
            <div className={`flex flex-col md:flex-row gap-4 w-full md:w-auto ${step === 1 ? 'ml-auto' : ''}`}>
               {step < 5 ? (
                 <button 
                   onClick={handleNext}
                   className="flex items-center justify-center gap-3 px-14 py-5 bg-primary text-white rounded-4xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/20"
                 >
                   Next Phase
                   <span className="material-symbols-outlined">arrow_forward</span>
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   disabled={isSubmitting || !form.readyToProceed}
                   className="flex items-center justify-center gap-3 px-14 py-5 bg-emerald-600 text-white rounded-4xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-2xl shadow-emerald-600/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                 >
                   {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                   <span className="material-symbols-outlined">send</span>
                 </button>
               )}
            </div>
          </div>
          {feedback.message && (
             <p className={`text-center mt-6 text-xs font-black uppercase tracking-widest ${feedback.type === 'error' ? 'text-primary' : 'text-emerald-600'}`}>
                {feedback.message}
             </p>
          )}
        </div>
      </main>
    </div>
  );
}
