import PropertyCard from '@/components/property/PropertyCard';
import PropertyFilters from '@/components/property/PropertyFilters';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertySortBar from '@/components/property/PropertySortBar';
import { properties } from '@/data/properties';

export default function PropertiesPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
      {/* Breadcrumbs & Header */}
      <header className="mb-12">
        <nav aria-label="Breadcrumb" className="flex text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
          <ol className="inline-flex items-center space-x-2">
            <li><a href="/" className="hover:text-primary transition-colors text-[10px]">Home</a></li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              <span className="text-primary">Properties for Rent</span>
            </li>
          </ol>
        </nav>
        <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-4">
          Mumbai Rental Properties
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
          Discover curated luxury residences across South Mumbai, Bandra, and beyond. 
          Refined living in India's most vibrant skyline.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <PropertyFilters />

        {/* Main Content */}
        <div className="flex-grow">
          <PropertySortBar />
          
          <PropertyGrid columns={2}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </PropertyGrid>

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600 transition-colors">2</button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600 transition-colors">3</button>
            <span className="px-2 text-slate-300">...</span>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600 transition-colors">12</button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Contact CTA */}
      <button className="fixed bottom-8 right-8 z-[60] bg-primary text-white flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-all font-bold active:scale-95 group">
        <svg className="group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Contact Expert
      </button>
    </main>
  );
}
