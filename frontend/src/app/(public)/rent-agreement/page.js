'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RentAgreementPage() {
  const [role, setRole] = useState('landlord');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const steps = [
    { title: "Submit Details", desc: "Fill out a simple form with landlord, tenant, and property details securely on our portal.", icon: "1" },
    { title: "Drafting", desc: "Our legal experts draft a comprehensive agreement including all standard Mumbai rental clauses.", icon: "2" },
    { title: "Verification", desc: "Execute biometric verification through our doorstep executive or via Aadhaar OTP service.", icon: "3" },
    { title: "Delivery", desc: "Receive your government-registered PDF agreement directly in your inbox within 3-5 days.", icon: "4" }
  ];

  const benefits = [
    { title: "Legal Compliance", desc: "Fully valid in the court of law, adhering to Maharashtra registration norms.", icon: "gavel" },
    { title: "Fast Processing", desc: "Skip the long queues at the sub-registrar office. Digital filing in under 48 hours.", icon: "bolt" },
    { title: "Doorstep Service", desc: "Our executives visit your location for biometric authentication at your convenience.", icon: "home_pin" },
    { title: "Affordable Pricing", desc: "Transparent fee structure with no hidden charges. Starting from just ₹999.", icon: "payments" }
  ];

  const testimonials = [
    {
      name: "Mrs. Deshmukh",
      role: "Landlord, Prabhadevi",
      text: "The doorstep biometric service was a lifesaver. Being a senior citizen, going to the registrar office in Bandra was impossible. Mumbai Editorial team made it seamless.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoFVWF6zSrU7iMThWmg4KiqWfenH6_K6e-tO7uVcLsNJLYHHBNLcKNTmRA1wKVnxO-A3iUDTI0O16osJ-OpZ_12vMdAUYFON-qLlQQwnt2MypxflBPCz4ZgRvS62rdovYLPEzVrVwSNcRGA-i6Vj4L0qnmG05DlaqWemqz5s9B4sDmNrp6YAyTZbjYNwRQMkaSeabqrbI4rmTZro8SRqbkWhWHvoKNDDxZNclTVj4pByzxhmHeXMFI-ygw6xdHym_k4MyTFV7YUgY"
    },
    {
      name: "Aditya Verma",
      role: "IT Professional, Andheri West",
      text: "Quick, transparent, and completely digital. As a tenant moving from Bangalore, I was worried about Mumbai's legal hurdles, but they handled everything.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVr5yM8tN6MXqpTulX5p3olfHL6ywjMZBU3kfkug4EY1NaZwDMe4KGwI3-DdF5BR88XktrA07a2YIs67gvUNxS0XwfXImLkDLwPeq0dhc1MJ_KehvDeqO4l47nBq51XqrWjyrW8ffYWkkeXFX6KUwIxoWJEICP9mP-WDIpLeuf1WhKTYcVB1xwQ3n10KYal8MAMnQrVl1_gjFLx1H2j3y0YgrxErVqrEOEIKlRevYRvvAlTeqwY2rZR5ttGlIJDRmIGW3_4jPPjJg"
    },
    {
      name: "Rajesh Khanna",
      role: "Investor, South Mumbai",
      text: "Their drafting is top-notch. They included specific clauses for my penthouse that other portals missed. Highly recommended for premium properties.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfSIidxFh24GkqlI2BAoqacIuaHPjpwp49kq0rmoflZImoQkXhJjMLl_N4kX93mw4EsYDROy_jOsPA3TmIk2iq0UdGJrwzOhb5V4OTsufTaXWPF7h-Of58_B-no9gEYo8R2i6grtFvxydrMzvVe9C8Bu3UQGrsw8YaV-BR_swRFp-Z1COOQpZgg-dD98ym_gs5493u_-6omclcN1jmEHhczdzQHplOUVirP7bCfDdczONAYR8Dwq4q0HqeRBc6E5NneTunRJSqckM"
    }
  ];

  const faqs = [
    { q: "Is E-Registration as valid as offline registration?", a: "Yes, E-Registration is the official method promoted by the Government of Maharashtra. It carries the same legal weight as visiting a Sub-Registrar office and is actually more secure due to biometric verification." },
    { q: "How is the stamp duty calculated?", a: "Stamp duty is calculated based on the monthly rent, deposit amount, and the period of the agreement as per the prevailing government rates." },
    { q: "What documents do I need for registration?", a: "You primarily need the Aadhaar card and PAN card of both parties, along with the index-2 or electricity bill of the property." }
  ];

  return (
    <div className="w-full">
      {/* 🏙️ Hero Section */}
      <section className="relative px-8 pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50/50">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="z-10">
            <span className="inline-block px-5 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase text-primary bg-primary/10 rounded-full">
              PREMIUM LEGAL SERVICE
            </span>
            <h1 className="text-6xl lg:text-[5.5rem] font-black tracking-tight text-slate-900 mb-10 leading-none">
              Rent Agreement & <br /> <span className="text-primary italic">E-Registration</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mb-12 font-medium leading-relaxed">
              Secure your tenancy legally from the comfort of your home. We handle the biometric verification and registration with the Mumbai sub-registrar office.
            </p>
            <div className="flex flex-wrap gap-5">
              <button className="bg-primary text-white px-12 py-5 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                Start Now
              </button>
              <button className="flex items-center gap-3 px-10 py-5 rounded-full font-black text-xl text-slate-900 hover:bg-white hover:shadow-xl transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                How it works
              </button>
            </div>
            <div className="mt-16 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl">
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Trusted by <span className="text-slate-900">2,500+ Mumbai Landlords</span>
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-1000 group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtAgBF21oBzOLT0IoMjhM47yGEJ3jM6QiavPNUwBGvg-lY3PJP62_ksWoMeHHXpSqfMCeh5NIth9JMIVdRnHnEyy0GiYWi-3zdnaejc_xGsCx-m48KJwnlYLpeJmCv-Bbh1h68uGRdnj201QXM4FibsecNN0poQpJPZFMM4d2eS5kKXN39Z3nm7eFRyeN6UYnCelrdOJ8dQmQJ4BJJSZSe5RHvE62LdJI6DhH7uwJ2w8Cj5Limyrs6NSaL1hG3vWjqTctpjOCKBEo" 
                alt="Luxury Interior" 
                className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 translate-y-4 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-5">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg tracking-tight">Legal Compliance</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">MS Rent Control Act, 1999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📄 Legal Narrative */}
      <section className="px-8 py-32 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 tracking-tighter">Professional Real Estate Compliance</h2>
          <p className="text-xl leading-relaxed text-slate-500 font-medium">
            In the fast-paced Mumbai real estate market, a verbal agreement is a liability. Under Section 55 of the Maharashtra Rent Control Act, 1999, it is mandatory to have a registered written agreement. Our service bridges the gap between traditional legal complexities and modern convenience, offering a secure, government-approved e-registration platform for landlords and tenants across Mumbai and MMR.
          </p>
        </div>
      </section>

      {/* 🔄 Process steps */}
      <section className="px-8 py-32 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Streamlined Registration</h2>
              <p className="text-slate-500 font-bold text-lg">From drafting to delivery, we manage every step of your Mumbai rental agreement.</p>
            </div>
            <div className="hidden md:block">
              <span className="text-primary font-black text-xs tracking-[0.4em] uppercase">PROCESS FLOW</span>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="group">
                <div className="mb-10 relative">
                  <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-primary font-black text-3xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50">
                    {step.icon}
                  </div>
                  {i < 3 && <div className="hidden lg:block absolute top-10 left-28 right-0 h-[2px] bg-slate-100"></div>}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💎 Benefits Grid */}
      <section className="px-8 py-32 bg-white">
        <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="p-10 bg-slate-50 rounded-[3rem] hover:bg-primary hover:text-white transition-all duration-500 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight">{benefit.title}</h3>
              <p className={`text-sm font-medium leading-relaxed ${i % 2 === 0 ? 'text-slate-500' : 'text-slate-500'} group-hover:text-white/80`}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💰 Pricing & Form */}
      <section className="px-8 py-32 relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-24 items-start">
          <div>
            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Ready to register your agreement?</h2>
            <p className="text-slate-500 text-xl mb-16 font-medium leading-relaxed">Leave your details and our legal consultant will call you within 15 minutes to guide you through the process.</p>
            <div className="space-y-12">
              <div className="flex items-start gap-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 font-black text-[10px] rounded-full mb-3 uppercase tracking-widest">BEST VALUE</span>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter italic">₹999 <span className="text-lg font-black text-slate-400 not-italic uppercase tracking-widest ml-3">+ Stamp Duty</span></p>
                  <p className="text-sm text-slate-400 mt-2 font-bold tracking-tight uppercase">Starting service fee for E-Registration</p>
                </div>
              </div>
              <div className="p-12 rounded-[3.5rem] bg-slate-950 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px]"></div>
                <p className="font-black text-xs text-white/40 uppercase tracking-[0.3em] mb-8">INCLUDED IN ALL PLANS</p>
                <ul className="space-y-6">
                  {["Standard Legal Drafting", "E-filing with Sub-Registrar", "Police Verification Assistance"].map((li, i) => (
                    <li key={i} className="flex items-center gap-4 text-base font-black tracking-tight group-hover:translate-x-2 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-50 relative">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                  <input className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all" placeholder="John Doe" type="text"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone Number</label>
                  <input className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all" placeholder="+91 98XXX XXXXX" type="tel"/>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label>
                <input className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 font-bold transition-all" placeholder="john@example.com" type="email"/>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property Location</label>
                  <select className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-slate-900 font-bold appearance-none cursor-pointer">
                    <option>South Mumbai</option>
                    <option>Western Suburbs</option>
                    <option>Eastern Suburbs</option>
                    <option>Navi Mumbai / Thane</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">I am a...</label>
                  <div className="flex p-1.5 bg-slate-50 rounded-2xl">
                    <button 
                      type="button" 
                      onClick={() => setRole('landlord')}
                      className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === 'landlord' ? 'bg-white text-primary shadow-xl' : 'text-slate-400'}`}
                    >
                      Landlord
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRole('tenant')}
                      className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === 'tenant' ? 'bg-white text-primary shadow-xl' : 'text-slate-400'}`}
                    >
                      Tenant
                    </button>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                Submit Request
              </button>
              <p className="text-[9px] text-center text-slate-400 uppercase tracking-[0.2em] font-bold">
                By submitting, you agree to our privacy policy and terms.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ⭐ Trust & Testimonials */}
      <section className="px-8 py-32 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Trusted by Mumbai's Community</h2>
            <div className="flex flex-wrap justify-center gap-12 mt-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
              {["RERA REGISTERED", "LEGAL VERIFIED", "GOVT AUTHORIZED"].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="font-black tracking-[0.2em] text-xs">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <div key={i} className="p-12 bg-white rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 group">
                <div className="flex gap-1 text-primary mb-10">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="italic text-slate-500 mb-12 text-lg font-medium leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-5">
                  <img className="w-16 h-16 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-xl" src={t.image} alt={t.name} />
                  <div>
                    <p className="font-black text-slate-900 leading-none mb-2">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section className="px-8 py-32 bg-white pb-48">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 text-center mb-24 tracking-tighter">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className={`p-8 rounded-3xl transition-all cursor-pointer ${expandedFaq === i ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`} onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xl tracking-tight">{faq.q}</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-primary transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {expandedFaq === i && <p className="mt-8 text-white/70 font-medium leading-relaxed text-lg">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
