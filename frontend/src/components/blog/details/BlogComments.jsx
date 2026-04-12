'use client';

import React from 'react';

const BlogComments = ({ comments = [] }) => {
  return (
    <section className="mt-32 max-w-7xl mx-auto px-8">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-2/3">
          <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tighter">
            Discussions <span className="text-primary italic">({comments.length || 3})</span>
          </h3>
          
          <div className="space-y-16 mb-20">
            {/* Hardcoded Sample Comments for UI demo if array empty */}
            {(comments.length > 0 ? comments : [
              { name: "Ananya K.", date: "2 days ago", body: "Excellent analysis. The impact of the Coastal Road is definitely underestimated in current valuations and will likely pull more capital towards the Prabhadevi corridor." },
              { name: "Rahul Mehta", date: "5 days ago", body: "Are there any specific insights on the Lower Parel area? Many of the newer towers there seem to be competing directly with Worli for the same demographic." }
            ]).map((comment, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 font-black text-xl border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  {comment.name.charAt(0)}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900 tracking-tight text-lg">{comment.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{comment.date}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-medium text-lg">
                    {comment.body}
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Reply <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
            <h4 className="text-2xl font-black text-slate-900 mb-10 tracking-tighter flex items-center gap-3">
              <span className="material-symbols-outlined text-primary font-black">add_comment</span>
              Join the Dialogue
            </h4>
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Share your perspective</label>
                <textarea 
                  className="w-full bg-white border-none rounded-[2rem] p-8 focus:ring-2 focus:ring-primary/20 text-lg font-medium shadow-sm min-h-[160px] placeholder:text-slate-200" 
                  placeholder="What are your thoughts on this market outlook?" 
                  rows="4"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Your Identity</label>
                  <input className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary/20 text-sm font-bold shadow-sm" placeholder="Full Name" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Credential Email</label>
                  <input className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary/20 text-sm font-bold shadow-sm" placeholder="Email Address" type="email"/>
                </div>
              </div>
              <button className="bg-primary text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95" type="submit">
                Submit Comment
              </button>
            </form>
          </div>
        </div>
        <div className="lg:w-1/3">
          {/* Side spacing for alignment with Sidebar widgets */}
        </div>
      </div>
    </section>
  );
};

export default BlogComments;
