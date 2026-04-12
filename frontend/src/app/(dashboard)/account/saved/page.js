import { properties } from '@/data/properties';
import SavedPropertyCard from '@/components/dashboard/SavedPropertyCard';

export const metadata = {
  title: 'Saved Properties | Bricks',
  description: 'View and manage your saved property collection.',
};

export default function SavedPropertiesPage() {
  // Mocking saved properties by taking the first few from the data source
  const savedProperties = properties.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
            Saved <span className="text-primary italic">Collection</span>
          </h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">
            {savedProperties.length} properties curated for your consideration
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">sort</span>
            Recently Saved
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filtrer items
          </button>
        </div>
      </div>

      {/* Properties Grid/List */}
      <div className="space-y-8 pb-16">
        {savedProperties.length > 0 ? (
          savedProperties.map((property) => (
            <SavedPropertyCard key={property.id} property={property} />
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">favorite</span>
            </div>
            <h3 className="font-heading font-black text-slate-900 text-xl mb-2">No saved properties yet</h3>
            <p className="text-slate-400 font-medium mb-8">Start exploring and save the ones you love.</p>
            <a href="/buy" className="bg-primary text-white px-10 py-4 rounded-full font-heading font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all inline-block">
              Browse Listings
            </a>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      {savedProperties.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-0">
            Showing {savedProperties.length} of 12 saved items
          </span>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-white font-heading font-black shadow-lg shadow-primary/20">
              1
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-600 font-heading font-black hover:border-primary hover:text-primary transition-all shadow-sm">
              2
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-600 font-heading font-black hover:border-primary hover:text-primary transition-all shadow-sm">
              3
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
