import Link from 'next/link';
import ProjectCard from '@/components/project/ProjectCard';
import PropertyGrid from '@/components/property/PropertyGrid';
import { listProjects } from '@/services/projectService';
import { mapProjectListToCardVM } from '@/lib/mappers/projectMapper';

export const metadata = {
  title: 'Projects in Mumbai',
  description: 'Browse verified residential and commercial projects across Mumbai with configurations, pricing, and brochure access.',
  openGraph: {
    title: 'Projects in Mumbai | GrihaNivas',
    description: 'Explore new launches and ongoing projects from trusted Mumbai developers.',
  },
};

const PAGE_SIZE = 12;
const BASE_PATH = '/projects';

const getCurrentPage = (rawPage) => {
  const page = Number(rawPage);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
};

export default async function ProjectsPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params?.page);

  let projects = [];
  let meta = null;
  try {
    const response = await listProjects({ limit: PAGE_SIZE, page: currentPage, sortBy: 'newest' });
    projects = mapProjectListToCardVM(response.items || []);
    meta = response.meta || null;
  } catch {
    projects = [];
    meta = null;
  }

  const totalPages = Math.max(1, Number(meta?.totalPages || 1));
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <main className="w-full">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-4">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              <span className="text-primary truncate">Projects</span>
            </li>
          </ol>
        </nav>
        <h1 className="type-large-title-32 text-slate-950 sm:text-4xl">Projects in Mumbai</h1>
        <p className="text-slate-500 mt-2 max-w-2xl font-bold text-sm sm:text-base">
          Verified residential and commercial projects with configuration-wise pricing, floor plans, and direct builder details.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <PropertyGrid columns={3}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </PropertyGrid>

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 mt-6">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">domain</span>
            <p className="text-slate-500 font-bold text-sm md:text-base">No projects listed yet — check back shortly.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 sm:mt-16 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
            {prevPage ? (
              <Link href={`${BASE_PATH}?page=${prevPage}`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
            ) : (
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </span>
            )}
            <span className="px-3 text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
            {nextPage ? (
              <Link href={`${BASE_PATH}?page=${nextPage}`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            ) : (
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
