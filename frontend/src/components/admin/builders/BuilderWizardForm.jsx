'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { SYSTEM_DEFAULT_CITY } from '@/lib/system/defaults';
import { getSystemBootstrap } from '@/services/systemService';
import {
  createAdminBuilder,
  getAdminBuilderById,
  updateAdminBuilder,
} from '@/services/builderService';

const STEPS = [
  { id: 1, name: 'Identity', icon: 'apartment' },
  { id: 2, name: 'Portfolio', icon: 'domain' },
  { id: 3, name: 'Media', icon: 'image' },
  { id: 4, name: 'Story', icon: 'article' },
  { id: 5, name: 'SEO & Publish', icon: 'publish' },
];

const createDefaultForm = () => ({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  headquarters: SYSTEM_DEFAULT_CITY,
  establishedYear: '',
  totalProjects: '',
  ongoingProjects: '',
  completedDeliveries: '',
  aboutHeadline: '',
  qualityStandards: '',
  innovation: '',
  isFeatured: false,
  isActive: true,
  logoFile: null,
  coverImageFile: null,
  featuredImagesText: '',
  faqs: [{ question: '', answer: '' }],
  testimonials: [{ author: '', role: '', content: '', rating: '5', avatar: '' }],
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoKeywordsText: '',
});

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMultiline(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function numberOrUndefined(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapBuilderToForm(builder) {
  const faqs = Array.isArray(builder?.faqs) && builder.faqs.length > 0
    ? builder.faqs.map((faq) => ({
        question: String(faq?.question || ''),
        answer: String(faq?.answer || ''),
      }))
    : [{ question: '', answer: '' }];

  const testimonials = Array.isArray(builder?.testimonials) && builder.testimonials.length > 0
    ? builder.testimonials.map((item) => ({
        author: String(item?.author || ''),
        role: String(item?.role || ''),
        content: String(item?.content || ''),
        rating: String(Number(item?.rating || 5)),
        avatar: String(item?.avatar || ''),
      }))
    : [{ author: '', role: '', content: '', rating: '5', avatar: '' }];

  return {
    ...createDefaultForm(),
    name: String(builder?.name || ''),
    slug: String(builder?.slug || ''),
    shortDescription: String(builder?.shortDescription || ''),
    description: String(builder?.description || ''),
    headquarters: String(builder?.headquarters || SYSTEM_DEFAULT_CITY),
    establishedYear: builder?.establishedYear ? String(builder.establishedYear) : '',
    totalProjects: Number.isFinite(Number(builder?.totalProjects)) ? String(builder.totalProjects) : '',
    ongoingProjects: Number.isFinite(Number(builder?.ongoingProjects)) ? String(builder.ongoingProjects) : '',
    completedDeliveries: Number.isFinite(Number(builder?.completedDeliveries))
      ? String(builder.completedDeliveries)
      : '',
    aboutHeadline: String(builder?.aboutHeadline || ''),
    qualityStandards: String(builder?.qualityStandards || ''),
    innovation: String(builder?.innovation || ''),
    isFeatured: Boolean(builder?.isFeatured),
    isActive: typeof builder?.isActive === 'boolean' ? builder.isActive : true,
    featuredImagesText: Array.isArray(builder?.featuredImages)
      ? builder.featuredImages.filter(Boolean).join('\n')
      : '',
    faqs,
    testimonials,
    seoMetaTitle: String(builder?.seo?.metaTitle || ''),
    seoMetaDescription: String(builder?.seo?.metaDescription || ''),
    seoKeywordsText: Array.isArray(builder?.seo?.keywords)
      ? builder.seo.keywords.filter(Boolean).join(', ')
      : '',
  };
}

export default function BuilderWizardForm({ mode = 'create', builderId = '' }) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBuilder, setLoadingBuilder] = useState(isEditMode);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [form, setForm] = useState(createDefaultForm());
  const [existingMedia, setExistingMedia] = useState({
    logoUrl: '',
    coverImageUrl: '',
  });

  const progress = useMemo(() => (step / STEPS.length) * 100, [step]);

  const patchForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateFaq = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  };

  const updateTestimonial = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const loadBuilder = useCallback(async () => {
    if (!isEditMode || !builderId) {
      setLoadingBuilder(false);
      return;
    }

    setLoadingBuilder(true);
    try {
      const builder = await getAdminBuilderById(builderId);
      setForm(mapBuilderToForm(builder));
      setExistingMedia({
        logoUrl: builder?.logo?.url || '',
        coverImageUrl: builder?.coverImage?.url || '',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load builder details for editing.'),
      });
    } finally {
      setLoadingBuilder(false);
    }
  }, [builderId, isEditMode]);

  useEffect(() => {
    loadBuilder();
  }, [loadBuilder]);

  useEffect(() => {
    if (isEditMode) return;

    let mounted = true;
    getSystemBootstrap()
      .then((bootstrap) => {
        if (!mounted) return;
        const city = String(bootstrap?.config?.city || '').trim();
        if (!city) return;

        setForm((prev) => {
          if (prev.headquarters && prev.headquarters !== SYSTEM_DEFAULT_CITY) {
            return prev;
          }

          return {
            ...prev,
            headquarters: city,
          };
        });
      })
      .catch(() => {
        // Keep static fallback when config API is not available.
      });

    return () => {
      mounted = false;
    };
  }, [isEditMode]);

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'Builder name is required.';
      if (!form.shortDescription.trim()) return 'Short description is required.';
    }

    if (step === 4) {
      if (!form.description.trim()) return 'Detailed builder description is required.';
    }

    return '';
  };

  const handleNext = () => {
    const message = validateStep();
    if (message) {
      setFeedback({ type: 'error', message });
      return;
    }
    setFeedback({ type: '', message: '' });
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setFeedback({ type: '', message: '' });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFeedback({ type: 'error', message: 'Builder name is required.' });
      return;
    }

    if (!form.shortDescription.trim() || !form.description.trim()) {
      setFeedback({
        type: 'error',
        message: 'Short description and full description are required to publish a builder profile.',
      });
      return;
    }

    if (isEditMode && !builderId) {
      setFeedback({ type: 'error', message: 'Missing builder ID for edit flow.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = new FormData();

      payload.append('name', form.name.trim());
      const finalSlug = toSlug(form.slug || form.name);
      if (finalSlug) payload.append('slug', finalSlug);
      payload.append('shortDescription', form.shortDescription.trim());
      payload.append('description', form.description.trim());
      if (form.headquarters.trim()) payload.append('headquarters', form.headquarters.trim());
      if (form.aboutHeadline.trim()) payload.append('aboutHeadline', form.aboutHeadline.trim());
      if (form.qualityStandards.trim()) payload.append('qualityStandards', form.qualityStandards.trim());
      if (form.innovation.trim()) payload.append('innovation', form.innovation.trim());

      const establishedYear = numberOrUndefined(form.establishedYear);
      const totalProjects = numberOrUndefined(form.totalProjects);
      const ongoingProjects = numberOrUndefined(form.ongoingProjects);
      const completedDeliveries = numberOrUndefined(form.completedDeliveries);

      if (establishedYear !== undefined) payload.append('establishedYear', String(establishedYear));
      if (totalProjects !== undefined) payload.append('totalProjects', String(totalProjects));
      if (ongoingProjects !== undefined) payload.append('ongoingProjects', String(ongoingProjects));
      if (completedDeliveries !== undefined) {
        payload.append('completedDeliveries', String(completedDeliveries));
      }

      payload.append('isFeatured', String(Boolean(form.isFeatured)));
      payload.append('isActive', String(Boolean(form.isActive)));

      if (form.logoFile) payload.append('logo', form.logoFile);
      if (form.coverImageFile) payload.append('coverImage', form.coverImageFile);

      const featuredImages = parseMultiline(form.featuredImagesText);
      payload.append('featuredImages', JSON.stringify(featuredImages));

      const faqs = form.faqs
        .map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter((faq) => faq.question && faq.answer);
      payload.append('faqs', JSON.stringify(faqs));

      const testimonials = form.testimonials
        .map((item) => ({
          author: item.author.trim(),
          role: item.role.trim(),
          content: item.content.trim(),
          rating: Number(item.rating || 5),
          avatar: item.avatar.trim(),
        }))
        .filter((item) => item.author && item.content)
        .map((item) => ({
          ...item,
          rating: Number.isFinite(item.rating) ? item.rating : 5,
          ...(item.role ? { role: item.role } : {}),
          ...(item.avatar ? { avatar: item.avatar } : {}),
        }));
      payload.append('testimonials', JSON.stringify(testimonials));

      const seoKeywords = parseCsv(form.seoKeywordsText);
      const seo = {
        ...(form.seoMetaTitle.trim() ? { metaTitle: form.seoMetaTitle.trim() } : {}),
        ...(form.seoMetaDescription.trim()
          ? { metaDescription: form.seoMetaDescription.trim() }
          : {}),
        ...(seoKeywords.length > 0 ? { keywords: seoKeywords } : {}),
      };
      payload.append('seo', JSON.stringify(seo));

      if (isEditMode) {
        await updateAdminBuilder(builderId, payload);
      } else {
        await createAdminBuilder(payload);
      }

      router.push('/admin/builders');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(
          error,
          isEditMode ? 'Unable to update builder profile.' : 'Unable to create builder profile.'
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden xl:flex flex-col w-80 bg-white border-r border-slate-100 sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100">
          <Link
            href="/admin/builders"
            className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Builders</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-5">
            {isEditMode ? 'Edit Builder' : 'Create Builder'}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Step {step} of {STEPS.length}
          </p>
          <div className="mt-5">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 py-8">
          {STEPS.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 px-8 py-4 transition-all ${
                step === entry.id
                  ? 'text-primary border-r-4 border-primary bg-primary/5 font-black'
                  : step > entry.id
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-400 font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {step > entry.id ? 'check_circle' : entry.icon}
              </span>
              <span className="text-sm tracking-tight">{entry.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-10 md:py-14 space-y-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Builder Wizard</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mt-2">
              {isEditMode ? 'Edit Builder Profile' : 'Create Builder Profile'}
            </h2>
            <p className="text-slate-500 font-bold mt-3 text-sm md:text-base">
              Fill details step-by-step. This profile powers the public builder listing and detail pages.
            </p>
          </div>
        </header>

        {feedback.message && (
          <div
            className={`rounded-2xl border px-5 py-4 text-sm font-bold ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-100 text-red-700'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {loadingBuilder ? (
          <div className="bg-white rounded-4xl border border-slate-100 p-8 space-y-4 animate-pulse">
            <div className="h-8 w-60 bg-slate-100 rounded-xl" />
            <div className="h-20 w-full bg-slate-100 rounded-2xl" />
            <div className="h-20 w-full bg-slate-100 rounded-2xl" />
            <div className="h-20 w-full bg-slate-100 rounded-2xl" />
          </div>
        ) : (
          <>
            {step === 1 && (
              <section className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Identity</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Builder Name *">
                    <input
                      value={form.name}
                      onChange={(e) => patchForm({ name: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Skyline Apex Group"
                    />
                  </Field>

                  <Field label="Slug (optional)">
                    <input
                      value={form.slug}
                      onChange={(e) => patchForm({ slug: toSlug(e.target.value) })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="skyline-apex-group"
                    />
                  </Field>

                  <Field label="Headquarters">
                    <input
                      value={form.headquarters}
                      onChange={(e) => patchForm({ headquarters: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Mumbai"
                    />
                  </Field>

                  <Field label="Established Year">
                    <input
                      type="number"
                      value={form.establishedYear}
                      onChange={(e) => patchForm({ establishedYear: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="2002"
                    />
                  </Field>
                </div>

                <Field label="Short Description *">
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) => patchForm({ shortDescription: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Trusted Mumbai developer with premium and mid-segment projects."
                  />
                </Field>
              </section>
            )}

            {step === 2 && (
              <section className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Portfolio</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Field label="Total Projects">
                    <input
                      type="number"
                      value={form.totalProjects}
                      onChange={(e) => patchForm({ totalProjects: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="26"
                    />
                  </Field>
                  <Field label="Ongoing Projects">
                    <input
                      type="number"
                      value={form.ongoingProjects}
                      onChange={(e) => patchForm({ ongoingProjects: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="8"
                    />
                  </Field>
                  <Field label="Completed Deliveries">
                    <input
                      type="number"
                      value={form.completedDeliveries}
                      onChange={(e) => patchForm({ completedDeliveries: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="18"
                    />
                  </Field>
                </div>

                <Field label="About Headline">
                  <input
                    value={form.aboutHeadline}
                    onChange={(e) => patchForm({ aboutHeadline: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Building Mumbai's Next Landmark Addresses"
                  />
                </Field>

                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Quality Standards">
                    <textarea
                      value={form.qualityStandards}
                      onChange={(e) => patchForm({ qualityStandards: e.target.value })}
                      rows={3}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>

                  <Field label="Innovation">
                    <textarea
                      value={form.innovation}
                      onChange={(e) => patchForm({ innovation: e.target.value })}
                      rows={3}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Media</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Logo Upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => patchForm({ logoFile: e.target.files?.[0] || null })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold"
                    />
                    {existingMedia.logoUrl && !form.logoFile && (
                      <p className="text-[11px] text-slate-500 font-semibold">Existing logo will be kept unless replaced.</p>
                    )}
                  </Field>

                  <Field label="Cover Image Upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => patchForm({ coverImageFile: e.target.files?.[0] || null })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold"
                    />
                    {existingMedia.coverImageUrl && !form.coverImageFile && (
                      <p className="text-[11px] text-slate-500 font-semibold">Existing cover image will be kept unless replaced.</p>
                    )}
                  </Field>
                </div>

                <Field label="Featured Image URLs (one per line)">
                  <textarea
                    rows={5}
                    value={form.featuredImagesText}
                    onChange={(e) => patchForm({ featuredImagesText: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://...\nhttps://..."
                  />
                </Field>
              </section>
            )}

            {step === 4 && (
              <section className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 space-y-8">
                <h3 className="text-xl font-black text-slate-900">Story, FAQs & Testimonials</h3>

                <Field label="Detailed Description *">
                  <textarea
                    rows={6}
                    value={form.description}
                    onChange={(e) => patchForm({ description: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Builder journey, vision, delivery quality, and differentiators..."
                  />
                </Field>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">FAQs</h4>
                    <button
                      type="button"
                      onClick={() =>
                        patchForm({ faqs: [...form.faqs, { question: '', answer: '' }] })
                      }
                      className="text-xs font-black uppercase tracking-widest text-primary"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  {form.faqs.map((faq, index) => (
                    <div
                      key={`faq-${index}`}
                      className="grid md:grid-cols-2 gap-4 rounded-2xl border border-slate-100 p-4 bg-slate-50"
                    >
                      <input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Question"
                      />
                      <div className="flex gap-2">
                        <input
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          className="flex-1 rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Answer"
                        />
                        {form.faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              patchForm({ faqs: form.faqs.filter((_, i) => i !== index) })
                            }
                            className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-red-600"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Testimonials</h4>
                    <button
                      type="button"
                      onClick={() =>
                        patchForm({
                          testimonials: [
                            ...form.testimonials,
                            { author: '', role: '', content: '', rating: '5', avatar: '' },
                          ],
                        })
                      }
                      className="text-xs font-black uppercase tracking-widest text-primary"
                    >
                      + Add Testimonial
                    </button>
                  </div>

                  {form.testimonials.map((item, index) => (
                    <div
                      key={`testimonial-${index}`}
                      className="grid md:grid-cols-2 gap-4 rounded-2xl border border-slate-100 p-4 bg-slate-50"
                    >
                      <input
                        value={item.author}
                        onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
                        className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Author"
                      />
                      <input
                        value={item.role}
                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Role"
                      />
                      <input
                        value={item.avatar}
                        onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                        className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Avatar URL (optional)"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={item.rating}
                        onChange={(e) => updateTestimonial(index, 'rating', e.target.value)}
                        className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Rating"
                      />
                      <div className="md:col-span-2 flex gap-2">
                        <textarea
                          value={item.content}
                          onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                          rows={3}
                          className="flex-1 rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Testimonial content"
                        />
                        {form.testimonials.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              patchForm({
                                testimonials: form.testimonials.filter((_, i) => i !== index),
                              })
                            }
                            className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-red-600"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              </section>
            )}

            {step === 5 && (
              <section className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900">SEO & Publish</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="SEO Meta Title">
                    <input
                      value={form.seoMetaTitle}
                      onChange={(e) => patchForm({ seoMetaTitle: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>

                  <Field label="SEO Meta Description">
                    <input
                      value={form.seoMetaDescription}
                      onChange={(e) => patchForm({ seoMetaDescription: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </div>

                <Field label="SEO Keywords (comma separated)">
                  <input
                    value={form.seoKeywordsText}
                    onChange={(e) => patchForm({ seoKeywordsText: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="mumbai builder, luxury homes, new launch"
                  />
                </Field>

                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleCard
                    title="Featured Builder"
                    description="Show this builder at top of public builders list."
                    checked={form.isFeatured}
                    onChange={(value) => patchForm({ isFeatured: value })}
                  />
                  <ToggleCard
                    title="Active Profile"
                    description="Keep profile visible in public builder APIs."
                    checked={form.isActive}
                    onChange={(value) => patchForm({ isActive: value })}
                  />
                </div>
              </section>
            )}

            <footer className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || submitting}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest disabled:opacity-40"
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/builders"
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </Link>

                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : isEditMode ? 'Update Builder' : 'Create Builder'}
                  </button>
                )}
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2.5">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">{label}</span>
      {children}
    </label>
  );
}

function ToggleCard({ title, description, checked, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition-all ${
          checked ? 'bg-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
