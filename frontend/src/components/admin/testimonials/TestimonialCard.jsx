'use client';

import React from 'react';

const TestimonialCard = ({ testimonial, onEdit }) => {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 hover:border-primary/20 transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-5">
            <div className="relative">
               <img 
                alt={testimonial.name} 
                className="w-16 h-16 rounded-[1.25rem] object-cover shadow-xl border-4 border-white group-hover:rotate-3 transition-transform duration-500" 
                src={testimonial.image} 
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h4 className="font-black text-slate-900 tracking-tight text-lg leading-none mb-2">{testimonial.name}</h4>
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: j < testimonial.rating ? "'FILL' 1" : "" }}>star</span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onEdit(testimonial)}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-white hover:shadow-lg transition-all flex items-center justify-center border border-transparent hover:border-slate-100"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
        </div>
        
        <p className="text-slate-500 font-medium leading-[1.7] italic text-lg line-clamp-4">
          "{testimonial.content}"
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${testimonial.role === 'Corporate Plan' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>
          {testimonial.role}
        </span>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{testimonial.date}</span>
      </div>
    </div>
  );
};

export default TestimonialCard;
