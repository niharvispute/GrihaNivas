'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/services/propertyService';

const AMENITIES = [
  'Swimming Pool', 'Gymnasium', 'Club House', "Children's Play Area",
  '24×7 Security', 'CCTV Surveillance', 'Power Backup', 'Lift / Elevator',
  'Covered Parking', 'Visitor Parking', 'Landscaped Garden', 'Jogging Track',
  'Multipurpose Hall', 'Indoor Games Room', 'Intercom', 'Fire Safety Systems',
  'Vastu Compliant', 'Smart Home Automation', 'Concierge Service', 'EV Charging',
  'Rooftop Terrace', 'Yoga / Meditation Area', 'Squash Court', 'Badminton Court',
];

const EMPTY_FORM = {
  title: '', description: '', category: 'buy',
  price: '', rentPerMonth: '', deposit: '', maintenanceCharges: '',
  bhk: '', bathrooms: '', areaSqft: '', carpetArea: '', floor: '', totalFloors: '', parking: '0',
  furnishing: '', facing: '', age: '', possession: '',
  reraNumber: '', reraUrl: '',
  locationCity: 'Mumbai', locationArea: '', locationAddress: '', locationPincode: '',
  isFeatured: false, isNegotiable: false,
  amenities: [],
  feature: '',
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [floorPlanFiles, setFloorPlanFiles] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const heroRef = useRef();
  const galleryRef = useRef();
  const floorRef = useRef();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]);

  const handleHero = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeGallery = (idx) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFloorPlan = (e) => {
    const files = Array.from(e.target.files);
    setFloorPlanFiles((prev) => [...prev, ...files]);
    setFloorPlanPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeFloorPlan = (idx) => {
    setFloorPlanFiles((prev) => prev.filter((_, i) => i !== idx));
    setFloorPlanPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Min 5 characters';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Min 20 characters';
    if (!form.locationArea.trim()) e.locationArea = 'Required';
    if (form.price === '' || isNaN(Number(form.price))) e.price = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();

      const num = (v) => (v !== '' && !isNaN(Number(v)) ? Number(v) : undefined);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: num(form.price) ?? 0,
        ...(num(form.rentPerMonth) !== undefined && { rentPerMonth: num(form.rentPerMonth) }),
        ...(num(form.deposit) !== undefined && { deposit: num(form.deposit) }),
        ...(num(form.maintenanceCharges) !== undefined && { maintenanceCharges: num(form.maintenanceCharges) }),
        ...(num(form.bhk) !== undefined && { bhk: num(form.bhk) }),
        ...(num(form.bathrooms) !== undefined && { bathrooms: num(form.bathrooms) }),
        ...(num(form.areaSqft) !== undefined && { areaSqft: num(form.areaSqft) }),
        ...(num(form.carpetArea) !== undefined && { carpetArea: num(form.carpetArea) }),
        ...(num(form.floor) !== undefined && { floor: num(form.floor) }),
        ...(num(form.totalFloors) !== undefined && { totalFloors: num(form.totalFloors) }),
        parking: num(form.parking) ?? 0,
        ...(form.furnishing && { furnishing: form.furnishing }),
        ...(form.facing.trim() && { facing: form.facing.trim() }),
        ...(form.age.trim() && { age: form.age.trim() }),
        ...(form.possession.trim() && { possession: form.possession.trim() }),
        ...(form.reraNumber.trim() && { reraNumber: form.reraNumber.trim() }),
        ...(form.reraUrl.trim() && { reraUrl: form.reraUrl.trim() }),
        isFeatured: form.isFeatured,
        isNegotiable: form.isNegotiable,
        amenities: form.amenities,
        feature: form.feature.trim() ? form.feature.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        location: {
          city: form.locationCity.trim() || 'Mumbai',
          area: form.locationArea.trim(),
          address: form.locationAddress.trim() || undefined,
          pincode: form.locationPincode.trim() || undefined,
        },
      };

      fd.append('data', JSON.stringify(payload));
      if (heroFile) fd.append('heroImage', heroFile);
      galleryFiles.forEach((f) => fd.append('images', f));
      floorPlanFiles.forEach((f) => fd.append('floorPlans', f));

      await createProperty(fd);
      router.push('/admin/properties');
    } catch (err) {
      alert(err?.message || 'Failed to create property.');
    } finally {
      setSaving(false);
    }
  };

  const isRent = form.category === 'rent';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Add Property</h1>
          <p className="text-slate-500 font-bold text-sm mt-0.5">Published immediately as active listing.</p>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Title *" error={errors.title} full>
          <input
            className={input(errors.title)}
            placeholder="e.g. 3 BHK Sea View Apartment in Bandra West"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
        <Field label="Category *" >
          <select className={input()} value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="commercial">Commercial</option>
            <option value="new_launch">New Launch</option>
          </select>
        </Field>
        <Field label="Furnishing">
          <select className={input()} value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
            <option value="">— Select —</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi_furnished">Semi Furnished</option>
            <option value="furnished">Fully Furnished</option>
          </select>
        </Field>
        <Field label="Description *" error={errors.description} full>
          <textarea
            rows={5}
            className={input(errors.description) + ' resize-none'}
            placeholder="Describe the property in detail…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <Field label={isRent ? 'Price (₹) *' : 'Price (₹) *'} error={errors.price}>
          <input type="number" className={input(errors.price)} placeholder="e.g. 15000000" value={form.price} onChange={(e) => set('price', e.target.value)} />
        </Field>
        {isRent && (
          <Field label="Rent / Month (₹)">
            <input type="number" className={input()} placeholder="e.g. 45000" value={form.rentPerMonth} onChange={(e) => set('rentPerMonth', e.target.value)} />
          </Field>
        )}
        <Field label="Deposit (₹)">
          <input type="number" className={input()} placeholder="e.g. 200000" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} />
        </Field>
        <Field label="Maintenance (₹/mo)">
          <input type="number" className={input()} placeholder="e.g. 5000" value={form.maintenanceCharges} onChange={(e) => set('maintenanceCharges', e.target.value)} />
        </Field>
        <div className="flex items-center gap-6 md:col-span-2">
          <Toggle label="Negotiable" checked={form.isNegotiable} onChange={(v) => set('isNegotiable', v)} />
          <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} />
        </div>
      </Section>

      {/* Property Details */}
      <Section title="Property Details">
        <Field label="BHK">
          <input type="number" className={input()} placeholder="e.g. 3" value={form.bhk} onChange={(e) => set('bhk', e.target.value)} />
        </Field>
        <Field label="Bathrooms">
          <input type="number" className={input()} placeholder="e.g. 2" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
        </Field>
        <Field label="Total Area (sq.ft)">
          <input type="number" className={input()} placeholder="e.g. 1200" value={form.areaSqft} onChange={(e) => set('areaSqft', e.target.value)} />
        </Field>
        <Field label="Carpet Area (sq.ft)">
          <input type="number" className={input()} placeholder="e.g. 950" value={form.carpetArea} onChange={(e) => set('carpetArea', e.target.value)} />
        </Field>
        <Field label="Floor">
          <input type="number" className={input()} placeholder="e.g. 7" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
        </Field>
        <Field label="Total Floors">
          <input type="number" className={input()} placeholder="e.g. 22" value={form.totalFloors} onChange={(e) => set('totalFloors', e.target.value)} />
        </Field>
        <Field label="Parking">
          <input type="number" className={input()} placeholder="e.g. 1" value={form.parking} onChange={(e) => set('parking', e.target.value)} />
        </Field>
        <Field label="Facing">
          <input className={input()} placeholder="e.g. East" value={form.facing} onChange={(e) => set('facing', e.target.value)} />
        </Field>
        <Field label="Age of Property">
          <input className={input()} placeholder="e.g. 5 years" value={form.age} onChange={(e) => set('age', e.target.value)} />
        </Field>
        <Field label="Possession Date">
          <input className={input()} placeholder="e.g. Ready to Move" value={form.possession} onChange={(e) => set('possession', e.target.value)} />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location">
        <Field label="Area *" error={errors.locationArea}>
          <input className={input(errors.locationArea)} placeholder="e.g. Bandra West" value={form.locationArea} onChange={(e) => set('locationArea', e.target.value)} />
        </Field>
        <Field label="City">
          <input className={input()} value={form.locationCity} onChange={(e) => set('locationCity', e.target.value)} />
        </Field>
        <Field label="Pincode">
          <input className={input()} placeholder="e.g. 400050" value={form.locationPincode} onChange={(e) => set('locationPincode', e.target.value)} />
        </Field>
        <Field label="Address" full>
          <input className={input()} placeholder="Full address" value={form.locationAddress} onChange={(e) => set('locationAddress', e.target.value)} />
        </Field>
      </Section>

      {/* RERA */}
      <Section title="RERA">
        <Field label="RERA Number">
          <input className={input()} placeholder="e.g. P51800047062" value={form.reraNumber} onChange={(e) => set('reraNumber', e.target.value)} />
        </Field>
        <Field label="RERA URL">
          <input className={input()} placeholder="https://maharera.mahaonline.gov.in/…" value={form.reraUrl} onChange={(e) => set('reraUrl', e.target.value)} />
        </Field>
      </Section>

      {/* Amenities */}
      <Section title="Amenities">
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const selected = form.amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${selected ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'}`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Hero Features */}
      <Section title="Hero Features">
        <Field label="Features (one per line)" full>
          <textarea
            rows={4}
            className={input() + ' resize-none'}
            placeholder={'Sea View\nCorner Unit\nVastu Compliant'}
            value={form.feature}
            onChange={(e) => set('feature', e.target.value)}
          />
        </Field>
      </Section>

      {/* Media */}
      <Section title="Media">
        {/* Hero Image */}
        <div className="md:col-span-2 space-y-3">
          <label className={labelCls}>Hero Image</label>
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-primary/40 transition-colors flex flex-col items-center gap-3"
            onClick={() => heroRef.current?.click()}
          >
            {heroPreview ? (
              <img src={heroPreview} alt="Hero" className="h-48 object-cover rounded-xl" />
            ) : (
              <>
                <span className="material-symbols-outlined text-4xl text-slate-300">add_photo_alternate</span>
                <p className="text-sm font-bold text-slate-400">Click to upload hero image</p>
              </>
            )}
          </div>
          <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={handleHero} />
        </div>

        {/* Gallery */}
        <div className="md:col-span-2 space-y-3">
          <label className={labelCls}>Gallery Images</label>
          <div className="flex flex-wrap gap-3">
            {galleryPreviews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removeGallery(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
            <div
              className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-center"
              onClick={() => galleryRef.current?.click()}
            >
              <span className="material-symbols-outlined text-slate-300 text-2xl">add</span>
            </div>
          </div>
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
        </div>

        {/* Floor Plans */}
        <div className="md:col-span-2 space-y-3">
          <label className={labelCls}>Floor Plans</label>
          <div className="flex flex-wrap gap-3">
            {floorPlanPreviews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removeFloorPlan(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
            <div
              className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-center"
              onClick={() => floorRef.current?.click()}
            >
              <span className="material-symbols-outlined text-slate-300 text-2xl">add</span>
            </div>
          </div>
          <input ref={floorRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFloorPlan} />
        </div>
      </Section>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
          className="px-8 py-3 rounded-2xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-10 py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Publishing…' : 'Publish Property'}
        </button>
      </div>
    </div>
  );
}

const labelCls = 'block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2';
const input = (err) =>
  `w-full bg-slate-50 border ${err ? 'border-red-300 focus:ring-red-200' : 'border-slate-100 focus:ring-primary/20'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 outline-none`;

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, full = false, error }) {
  return (
    <div className={`${full ? 'md:col-span-2' : ''} space-y-1.5`}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all ${checked ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/30'}`}
    >
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: checked ? "'FILL' 1" : "'FILL' 0" }}>
        {checked ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {label}
    </button>
  );
}
