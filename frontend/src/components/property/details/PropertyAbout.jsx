'use client';

import { useState } from 'react';

export default function PropertyAbout({ description }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section>
      <h2 className="text-2xl font-heading font-black mb-6 text-slate-900">About the Property</h2>
      <div className="prose prose-slate lg:prose-lg max-w-none text-slate-600 leading-relaxed font-sans">
        <p className={`whitespace-pre-line transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {description}
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary font-bold inline-flex items-center gap-1 hover:underline decoration-2 underline-offset-4 mt-4 transition-colors"
        >
          {isExpanded ? 'Read Less' : 'Read More'} 
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
