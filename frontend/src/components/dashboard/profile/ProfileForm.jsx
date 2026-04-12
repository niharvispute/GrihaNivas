'use client';

import { useState } from 'react';

export default function ProfileForm() {
  const [lookingTo, setLookingTo] = useState('buy');

  return (
    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50">
        <h3 className="text-lg font-heading font-black text-slate-900">Personal Information</h3>
      </div>
      <div className="p-8">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name</label>
              <input 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-slate-50 focus:bg-white font-sans text-slate-700 font-bold" 
                placeholder="Enter your full name" 
                type="text" 
                defaultValue="Alex Sterling"
              />
            </div>

            {/* Mobile Number (Locked) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Mobile Number</label>
              <div className="relative group">
                <input 
                  className="w-full px-4 py-3.5 pr-10 rounded-xl border border-slate-50 bg-slate-50/50 text-slate-400 font-sans font-bold cursor-not-allowed" 
                  disabled 
                  type="text" 
                  defaultValue="+91 98765 43210"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">lock</span>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed z-20">
                  Mobile number is verified and locked for security.
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <input 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-slate-50 focus:bg-white font-sans text-slate-700 font-bold" 
                placeholder="Enter your email" 
                type="email" 
                defaultValue="alex.sterling@example.com"
              />
            </div>

            {/* Preferred Location */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Preferred Location</label>
              <select className="w-full px-4 py-3.5 rounded-xl border border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50 font-sans text-slate-700 font-bold appearance-none cursor-pointer">
                <option value="sobo">SoBo (South Mumbai)</option>
                <option value="bandra" selected>Bandra</option>
                <option value="juhu">Juhu</option>
                <option value="worli">Worli</option>
                <option value="andheri">Andheri West</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Budget Range</label>
              <select className="w-full px-4 py-3.5 rounded-xl border border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50 font-sans text-slate-700 font-bold appearance-none cursor-pointer">
                <option>₹50L - ₹1Cr</option>
                <option>₹1Cr - ₹2Cr</option>
                <option selected>₹2Cr - ₹5Cr</option>
                <option>₹5Cr - ₹10Cr</option>
                <option>₹10Cr+</option>
              </select>
            </div>

            {/* Looking To (Radio Buttons) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Looking To</label>
              <div className="flex gap-2">
                {['buy', 'rent', 'invest'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setLookingTo(option)}
                    type="button"
                    className={`flex-1 flex items-center justify-center py-3 rounded-xl font-heading font-black text-xs uppercase tracking-widest transition-all border-2 ${
                      lookingTo === option 
                        ? 'bg-primary/5 border-primary text-primary' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button className="px-12 py-4 bg-primary text-white font-heading font-black uppercase tracking-widest text-xs rounded-full shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all active:scale-95" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
