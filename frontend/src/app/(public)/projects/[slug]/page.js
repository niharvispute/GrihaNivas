import Link from 'next/link';
import { notFound } from 'next/navigation';
import CloudinaryImage from '@/components/CloudinaryImage';
import PropertyBuilderProfile from '@/components/property/details/PropertyBuilderProfile';
import PropertyFloorPlans from '@/components/property/details/PropertyFloorPlans';
import LeadForm from '@/components/forms/LeadForm';
import { getProjectBySlug } from '@/services/projectService';
import { mapProjectToDetailVM } from '@/lib/mappers/projectMapper';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const raw = await getProjectBySlug(slug);
    if (!raw) return { title: 'Project Not Found' };
    const project = mapProjectToDetailVM(raw);

    return {
      title: project.seoTitle || `${project.name} in ${project.location || 'Mumbai'}`,
      description: project.seoDescription || project.shortDescription || project.description?.slice(0, 160),
      openGraph: {
        title: `${project.name} | GrihaNivas`,
        description: project.shortDescription || project.description?.slice(0, 160),
        ...(project.image && { images: [{ url: project.image, width: 1200, height: 630, alt: project.name }] }),
      },
    };
  } catch {
    return { title: 'Project Details' };
  }
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;

  let raw = null;
  try {
    raw = await getProjectBySlug(slug);
  } catch {
    raw = null;
  }

  if (!raw) notFound();

  const project = mapProjectToDetailVM(raw);
  const priceRangeLabel = project.priceMin > 0
    ? project.priceMax > project.priceMin
      ? `₹${project.priceMin.toLocaleString('en-IN')} - ₹${project.priceMax.toLocaleString('en-IN')}`
      : `₹${project.priceMin.toLocaleString('en-IN')}`
    : 'Price on Request';
  const galleryImages = project.gallery.length > 0 ? project.gallery : (project.image ? [project.image] : []);

  return (
    <main className="pt-2 sm:pt-7 lg:pt-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-8 px-1 overflow-x-auto no-scrollbar">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            <span className="text-primary truncate max-w-50">{project.name}</span>
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mb-8 sm:mb-16 lg:mb-20 space-y-5 sm:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2">
              {project.projectStatusLabel && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {project.projectStatusLabel}
                </span>
              )}
              {project.reraNumber && (
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span> RERA
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-slate-900 leading-tight">
              {project.name}
            </h1>
            {project.builder?.name && (
              <p className="text-slate-500 font-bold text-sm md:text-base">by {project.builder.name}</p>
            )}
            <p className="text-slate-500 flex items-center gap-2 font-bold text-sm md:text-base">
              <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{project.location || 'Mumbai'}</span>
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Price Range</p>
            <p className="text-3xl lg:text-4xl font-heading font-black text-slate-900 tracking-tighter">{priceRangeLabel}</p>
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] gap-3 sm:gap-4 h-auto lg:h-120">
            <div className="relative min-h-72 sm:min-h-88 lg:h-full rounded-2xl overflow-hidden shadow-xl">
              <CloudinaryImage src={galleryImages[0]} alt={project.name} fill eager sizes="(max-width: 1024px) 100vw, 70vw" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-full">
              {[galleryImages[1], galleryImages[2]].map((img, idx) => img ? (
                <div key={idx} className="relative min-h-32 sm:min-h-44 lg:min-h-0 rounded-2xl overflow-hidden border border-slate-100">
                  <CloudinaryImage src={img} alt={`${project.name} ${idx + 2}`} fill sizes="(max-width: 1024px) 50vw, 30vw" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div key={idx} className="hidden lg:flex min-h-0 rounded-2xl bg-slate-50 border border-slate-100" />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-72 sm:h-96 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-100 via-white to-slate-50 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-6xl">image_not_supported</span>
            <p className="mt-4 text-xs font-black uppercase tracking-widest">No gallery uploaded yet</p>
          </div>
        )}
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8 sm:space-y-16 lg:space-y-20">
          {/* About */}
          {(project.description || project.shortDescription) && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-4 sm:mb-6 text-slate-900">About the Project</h2>
              <p className="text-slate-500 leading-relaxed font-bold whitespace-pre-line">
                {project.description || project.shortDescription}
              </p>
            </section>
          )}

          {/* Quick stats */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Configurations', value: project.bhkSummary.join(', ') || 'On request' },
                { label: 'Total Units', value: project.totalUnits || 'On request' },
                { label: 'Possession', value: project.possessionLabel || 'On request' },
                { label: 'Land Area', value: project.landArea ? `${Number(project.landArea).toLocaleString('en-IN')} sq.ft` : 'On request' },
              ].map((item) => (
                <div key={item.label} className="bg-white/30 backdrop-blur-2xl border border-white/40 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl shadow-lg">
                  <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{item.label}</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 break-all">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Configurations */}
          {project.configurations.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Configurations &amp; Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {project.configurations.map((config) => (
                  <div key={config.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="font-black text-slate-900 text-lg mb-1">{config.title}</h3>
                    <p className="text-primary font-black text-sm mb-3">
                      {config.priceMin > 0
                        ? `₹${config.priceMin.toLocaleString('en-IN')}${config.priceMax > config.priceMin ? ` - ₹${config.priceMax.toLocaleString('en-IN')}` : ''}`
                        : 'Price on Request'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-bold">
                      {config.carpetAreaMin && <span>Carpet: {config.carpetAreaMin}{config.carpetAreaMax && config.carpetAreaMax !== config.carpetAreaMin ? `-${config.carpetAreaMax}` : ''} sq.ft</span>}
                      {config.bathrooms != null && <span>{config.bathrooms} Bathroom{config.bathrooms > 1 ? 's' : ''}</span>}
                      {config.balconies != null && <span>{config.balconies} Balcon{config.balconies > 1 ? 'ies' : 'y'}</span>}
                      {config.availableUnits != null && <span>{config.availableUnits} Available</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          {project.amenities.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {project.amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-tertiary text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Floor plans / brochure */}
          {(project.floorPlans.length > 0 || project.brochureUrl) && (
            <PropertyFloorPlans floorPlans={project.floorPlans} brochureUrl={project.enableBrochureDownload ? project.brochureUrl : ''} />
          )}

          {/* Master plan */}
          {project.masterPlanUrl && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-6 sm:mb-8 text-slate-900">Master Plan</h2>
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 min-h-72 sm:min-h-96">
                <CloudinaryImage src={project.masterPlanUrl} alt="Master Plan" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-contain bg-slate-50" />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <LeadForm title={`Enquire About ${project.name}`} leadType="project" projectId={project.id} />
          <PropertyBuilderProfile builder={project.builder} />
        </div>
      </div>
    </main>
  );
}
