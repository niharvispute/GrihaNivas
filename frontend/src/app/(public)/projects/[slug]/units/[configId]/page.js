import Link from 'next/link';
import { notFound } from 'next/navigation';
import CloudinaryImage from '@/components/CloudinaryImage';
import PropertyBuilderProfile from '@/components/property/details/PropertyBuilderProfile';
import PropertyFloorPlans from '@/components/property/details/PropertyFloorPlans';
import LeadForm from '@/components/forms/LeadForm';
import { getProjectBySlug } from '@/services/projectService';
import { mapProjectToDetailVM } from '@/lib/mappers/projectMapper';

export async function generateMetadata({ params }) {
  const { slug, configId } = await params;
  try {
    const raw = await getProjectBySlug(slug);
    if (!raw) return { title: 'Unit Not Found' };
    const project = mapProjectToDetailVM(raw);
    const config = project.configurations.find((c) => c.id === configId);
    if (!config) return { title: 'Unit Not Found' };
    const title = `${config.title || config.bhkType} — ${project.name}`;
    return {
      title: `${title} in ${project.location || 'Mumbai'}`,
      description: `${config.title || config.bhkType} at ${project.name}, ${project.location || 'Mumbai'}. ${config.carpetAreaMin ? `Carpet area from ${config.carpetAreaMin} sq.ft.` : ''} ${config.priceMin > 0 ? `Starting ₹${config.priceMin.toLocaleString('en-IN')}.` : 'Price on Request.'}`.trim(),
      openGraph: {
        title: `${title} | GrihaNivas`,
        description: `${config.title || config.bhkType} at ${project.name}, ${project.location || 'Mumbai'}.`,
      },
    };
  } catch {
    return { title: 'Unit Details' };
  }
}

export default async function ProjectUnitPage({ params }) {
  const { slug, configId } = await params;

  let raw = null;
  try {
    raw = await getProjectBySlug(slug);
  } catch {
    raw = null;
  }

  if (!raw) notFound();

  const project = mapProjectToDetailVM(raw);
  const config = project.configurations.find((c) => c.id === configId);

  if (!config) notFound();

  // Config images take priority; fall back to project gallery
  const galleryImages = (config.gallery || []).length > 0 ? config.gallery : project.gallery;

  const priceLabel =
    config.priceMin > 0
      ? config.priceMax > config.priceMin
        ? `₹${config.priceMin.toLocaleString('en-IN')} – ₹${config.priceMax.toLocaleString('en-IN')}`
        : `₹${config.priceMin.toLocaleString('en-IN')}`
      : 'Price on Request';

  const stats = [
    config.carpetAreaMin && {
      label: 'Carpet Area',
      value: `${config.carpetAreaMin}${config.carpetAreaMax && config.carpetAreaMax !== config.carpetAreaMin ? `–${config.carpetAreaMax}` : ''} sq.ft`,
    },
    config.bathrooms != null && { label: 'Bathrooms', value: config.bathrooms },
    config.balconies != null && { label: 'Balconies', value: config.balconies },
    config.parking && { label: 'Parking', value: config.parking },
    config.availableUnits != null && { label: 'Available Units', value: config.availableUnits },
    project.possessionLabel && { label: 'Possession', value: project.possessionLabel },
    project.totalTowers && { label: 'Towers', value: project.totalTowers },
    project.totalFloors && { label: 'Floors', value: project.totalFloors },
  ].filter(Boolean);

  return (
    <main className="pt-2 sm:pt-7 lg:pt-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-8 px-1 overflow-x-auto no-scrollbar"
      >
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <Link href={`/projects/${project.slug}`} className="hover:text-primary transition-colors truncate max-w-32">
              {project.name}
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <span className="text-primary truncate max-w-32">{config.title || config.bhkType}</span>
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mb-8 sm:mb-16 lg:mb-20 space-y-5 sm:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
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
              {config.title || config.bhkType}
            </h1>
            <p className="text-slate-500 font-bold text-sm md:text-base">
              at <Link href={`/projects/${project.slug}`} className="hover:text-primary transition-colors">{project.name}</Link>
              {project.builder?.name && <span> · by {project.builder.name}</span>}
            </p>
            <p className="text-slate-500 flex items-center gap-2 font-bold text-sm md:text-base">
              <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{project.location || 'Mumbai'}</span>
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Price</p>
            <p className="text-3xl lg:text-4xl font-heading font-black text-slate-900 tracking-tighter">{priceLabel}</p>
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] gap-3 sm:gap-4 h-auto lg:h-120">
            <div className="relative min-h-72 sm:min-h-88 lg:h-full rounded-2xl overflow-hidden shadow-xl">
              <CloudinaryImage
                src={galleryImages[0]}
                alt={config.title || config.bhkType}
                fill
                eager
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-full">
              {[galleryImages[1], galleryImages[2]].map((img, idx) =>
                img ? (
                  <div key={idx} className="relative min-h-32 sm:min-h-44 lg:min-h-0 rounded-2xl overflow-hidden border border-slate-100">
                    <CloudinaryImage
                      src={img}
                      alt={`${config.title} ${idx + 2}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 30vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div key={idx} className="hidden lg:flex min-h-0 rounded-2xl bg-slate-50 border border-slate-100" />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="h-72 sm:h-96 rounded-2xl border border-slate-100 bg-linear-to-br from-slate-100 via-white to-slate-50 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-6xl">image_not_supported</span>
            <p className="mt-4 text-xs font-black uppercase tracking-widest">No photos uploaded yet</p>
          </div>
        )}
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8 sm:space-y-16 lg:space-y-20">

          {/* Unit stats */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((item) => (
                <div key={item.label} className="bg-white/30 backdrop-blur-2xl border border-white/40 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl shadow-lg">
                  <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{item.label}</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 break-all">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* About the project */}
          {(project.description || project.shortDescription) && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-4 sm:mb-6 text-slate-900">About the Project</h2>
              <p className="text-slate-500 leading-relaxed font-bold whitespace-pre-line">
                {project.description || project.shortDescription}
              </p>
            </section>
          )}

          {/* Amenities — inherited from project */}
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

          {/* Floor plans for this config */}
          {(config.floorPlans.length > 0 || project.brochureUrl) && (
            <PropertyFloorPlans
              floorPlans={config.floorPlans}
              brochureUrl={project.enableBrochureDownload ? project.brochureUrl : ''}
            />
          )}

          {/* Back to project */}
          <section>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to {project.name}
            </Link>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <LeadForm
            title={`Enquire About ${config.title || config.bhkType}`}
            leadType="project"
            projectId={project.id}
          />
          <PropertyBuilderProfile builder={project.builder} />
        </div>
      </div>
    </main>
  );
}
