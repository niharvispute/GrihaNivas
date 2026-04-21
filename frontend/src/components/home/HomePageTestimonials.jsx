'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { listTestimonials } from '@/services/testimonialService';
import Link from 'next/link';

export default function HomePageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listTestimonials();
        setTestimonials(data.slice(0, 6));
      } catch {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return null;
  if (!testimonials.length) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Social Proof</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
            What Our Users Say
          </h2>
          <p className="text-slate-600 font-medium text-base md:text-lg max-w-2xl mx-auto">
            Join thousands of satisfied homeowners who found their perfect property through Mumbai Editorial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300 p-6 md:p-8 flex flex-col justify-between group"
            >
              {/* Rating */}
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

              {/* Testimonial Text */}
              <p className="text-slate-700 font-medium leading-relaxed mb-6 text-sm md:text-base line-clamp-4">
                "{testimonial.content}"
              </p>

              {/* Author */}
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
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-slate-600 font-medium mb-4">Ready to find your dream property?</p>
          <Link
            href="/search?isFeatured=true"
            className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 bg-primary text-white font-black text-sm md:text-base rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            Explore Properties
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
