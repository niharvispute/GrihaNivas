import Image from 'next/image';
import Link from 'next/link';
import { formatPriceShort } from '@/lib/mappers/formatters';
import { resolveFirstImageSrc, resolveImageAlt } from '@/lib/system/media';

const STATUS_STYLES = {
  new: { bg: 'bg-blue-50 text-blue-700', label: 'Under Review' },
  reviewing: { bg: 'bg-amber-50 text-amber-700', label: 'In Review' },
  approved: { bg: 'bg-emerald-50 text-emerald-700', label: 'Published' },
  rejected: { bg: 'bg-rose-50 text-rose-700', label: 'Rejected' },
  closed: { bg: 'bg-slate-100 text-slate-500', label: 'Closed' },
};

export default function ListedPropertyCard({ property }) {
  const status = STATUS_STYLES[property.status] || STATUS_STYLES.new;
  const imageSrc = resolveFirstImageSrc(property?.images);
  const imageAlt = resolveImageAlt(property?.title, 'Listed property image');

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden shrink-0 bg-slate-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-4xl">image</span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${status.bg}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight line-clamp-1">
                  {property.title || 'Untitled Property'}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                  <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                  {property.locality}, {property.city}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-black text-primary tracking-tighter ">
                  ₹{formatPriceShort(property.price)}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {property.listingType}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Building</p>
                <p className="text-xs font-bold text-slate-700">{property.buildingType}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <p className="text-xs font-bold text-slate-700">{property.propertyType}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                <p className="text-xs font-bold text-slate-700">
                  {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ref ID</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">#{property._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates Enabled</span>
            </div>
            <div className="flex gap-3">
               {/* Future actions like Edit could go here */}
               <Link 
                href={`/property/${property.slug}`}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  property.status === 'approved' 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                View Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
