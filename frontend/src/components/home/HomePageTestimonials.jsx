'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { listTestimonials } from '@/services/testimonialService';
import Link from 'next/link';

export default function HomePageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await listTestimonials();
        if (mounted) setTestimonials(data.slice(0, 6));
      } catch {
        if (mounted) setTestimonials([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return null;

  const prev = () => setCurrentSlide((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setCurrentSlide((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <section className="py-6 md:py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10 space-y-3">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Social Proof</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            What Our Users Say
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
            Real conversations, cleaner shortlists, and calmer decisions.
          </p>
        </div>

        {/* Empty state */}
        {!testimonials.length && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">rate_review</span>
            <p className="text-slate-500 font-bold text-sm md:text-base">No testimonials yet — client reviews coming soon.</p>
          </div>
        )}

        {/* Mobile slider — single card with prev/next */}
        {testimonials.length > 0 && (
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="min-w-full">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nav buttons + dot indicators */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-9 h-9 rounded-full border-2 border-primary/20 bg-white flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-base">west</span>
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next"
                className="w-9 h-9 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-base">east</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop grid */}
        {testimonials.length > 0 && (
          <div
            className={`hidden md:grid gap-6 md:gap-8 mx-auto ${
              testimonials.length === 1
                ? 'max-w-md'
                : testimonials.length === 2
                  ? 'max-w-4xl md:grid-cols-2'
                  : 'max-w-7xl md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 md:mt-10 text-center">
          <p className="text-slate-600 font-bold mb-4">Ready to compare verified options?</p>
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-black text-sm rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            Explore Properties
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-200/80 hover:border-primary/20 transition-all duration-500 p-5 md:p-6 flex flex-col justify-between group">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="material-symbols-outlined text-lg"
            style={{
              color: i < testimonial.rating ? '#f59e0b' : '#e5e7eb',
              fontVariationSettings: i < testimonial.rating ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>

      <p className="text-slate-700 font-bold leading-relaxed mb-6 text-sm md:text-base line-clamp-4">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black text-sm border-2 border-primary/10 flex-shrink-0">
          {testimonial.image ? (
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span>
              {testimonial.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm tracking-tight truncate">{testimonial.name}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
            {testimonial.role || 'Customer'}
          </p>
        </div>
      </div>
    </div>
  );
}
