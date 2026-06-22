import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import CloudinaryImage from '@/components/CloudinaryImage';

import ProjectUnitGallery from '@/components/property/details/ProjectUnitGallery';
import PropertyBuilderProfile from '@/components/property/details/PropertyBuilderProfile';
import PropertyFloorPlans from '@/components/property/details/PropertyFloorPlans';
import LeadForm from '@/components/forms/LeadForm';
import { getProjectBySlug } from '@/services/projectService';
import { mapProjectToDetailVM } from '@/lib/mappers/projectMapper';

function getVideoEmbed(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1` };
  return { type: 'video', src: url };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const raw = await getProjectBySlug(slug);
    if (!raw) {
      return {
        title: 'Project Not Found',
        description: 'This project could not be found. Browse other verified new-launch and ongoing projects in Mumbai on GrihaNivas.',
      };
    }
    const project = mapProjectToDetailVM(raw);
    const fallbackDescription = `${project.name} — ${project.location || 'Mumbai'}. View pricing, floor plans, amenities, and availability.`;

    return {
      title: project.seoTitle || `${project.name} in ${project.location || 'Mumbai'}`,
      description: project.seoDescription || project.shortDescription || project.description?.slice(0, 160) || fallbackDescription,
      openGraph: {
        title: `${project.name} | GrihaNivas`,
        description: project.shortDescription || project.description?.slice(0, 160) || fallbackDescription,
        ...(project.image && { images: [{ url: project.image, width: 1200, height: 630, alt: project.name }] }),
      },
    };
  } catch {
    return {
      title: 'Project Details',
      description: 'View verified project details, pricing, floor plans, and availability on GrihaNivas — Mumbai real estate advisory.',
    };
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
  const reraQrDataUrl = project.reraUrl ? await QRCode.toDataURL(project.reraUrl, { width: 120, margin: 1 }) : null;
  const videoEmbed = getVideoEmbed(project.videoUrl);
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
                  <span className="material-symbols-outlined text-[12px]">verified</span> RERA: {project.reraNumber}
                </span>
              )}
              {reraQrDataUrl && (
                <a href={project.reraUrl} target="_blank" rel="noopener noreferrer" title="Scan to verify RERA" className="group relative flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors">
                  <span className="material-symbols-outlined text-[12px]">qr_code_2</span>
                  <span>RERA QR</span>
                  <span className="absolute left-0 top-full mt-2 z-20 hidden group-hover:block bg-white border border-emerald-100 rounded-xl shadow-xl p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reraQrDataUrl} alt="RERA QR Code" width={120} height={120} />
                    <p className="text-center text-[9px] text-slate-400 mt-1 font-medium">Scan to verify RERA</p>
                  </span>
                </a>
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
          <ProjectUnitGallery images={galleryImages} alt={project.name} />
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

          {/* Video */}
          {videoEmbed && (
            <section>
              <h2 className="text-2xl font-heading font-black mb-4 sm:mb-6 text-slate-900">Project Video</h2>
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-lg" style={{ aspectRatio: '16/9' }}>
                {videoEmbed.type === 'iframe' ? (
                  <iframe
                    src={videoEmbed.src}
                    title="Project Video"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <video
                    src={videoEmbed.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            </section>
          )}

          {/* Quick stats */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Configurations', value: project.bhkSummary.join(', ') || 'On request' },
                { label: 'Total Units', value: project.totalUnits || 'On request' },
                { label: 'Possession', value: project.possessionLabel || 'On request' },
                { label: 'Land Area', value: project.landArea ? `${Number(project.landArea).toLocaleString('en-IN')} sq.ft` : 'On request' },
                ...(project.totalTowers ? [{ label: 'Total Towers', value: project.totalTowers }] : []),
                ...(project.totalFloors ? [{ label: 'Total Floors', value: project.totalFloors }] : []),
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.configurations.map((config) => {
                  const thumb = config.gallery?.[0] || config.floorPlans?.[0] || project.image;
                  return (
                    <Link
                      key={config.id}
                      href={`/projects/${project.slug}/units/${config.id}`}
                      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/25 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-36 flex-none overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                        {thumb ? (
                          <CloudinaryImage
                            src={thumb}
                            alt={config.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-slate-200">apartment</span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-slate-700 shadow">
                          {config.title}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col grow gap-2">
                        <p className="text-primary font-black text-sm">
                          {config.priceMin > 0
                            ? `₹${config.priceMin.toLocaleString('en-IN')}${config.priceMax > config.priceMin ? ` - ₹${config.priceMax.toLocaleString('en-IN')}` : ''}`
                            : 'Price on Request'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-500">
                          {config.carpetAreaMin && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                              {config.carpetAreaMin}{config.carpetAreaMax && config.carpetAreaMax !== config.carpetAreaMin ? `-${config.carpetAreaMax}` : ''} sq.ft
                            </span>
                          )}
                          {config.bathrooms != null && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{config.bathrooms} Bath{config.bathrooms > 1 ? 's' : ''}</span>
                          )}
                          {config.balconies != null && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{config.balconies} {config.balconies > 1 ? 'Balconies' : 'Balcony'}</span>
                          )}
                          {config.availableUnits != null && (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{config.availableUnits} Available</span>
                          )}
                        </div>
                        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-xs font-bold text-primary group-hover:text-primary/80 transition-colors">View Unit Details</span>
                          <span className="material-symbols-outlined text-primary text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
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
          {project.whatsappCtaEnabled && project.contactPhone && (
            <a
              href={`https://wa.me/${project.contactPhone.replace(/\D/g, '').replace(/^0+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${project.name}. Please share more details.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl font-black text-sm transition-colors shadow-md shadow-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          )}
          <PropertyBuilderProfile builder={project.builder} />
        </div>
      </div>
    </main>
  );
}
