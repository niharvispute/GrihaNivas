const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bricksmumbai.com';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const [properties, blogs, builders] = await Promise.all([
    fetchJson('/api/properties?limit=500&status=active'),
    fetchJson('/api/blogs?limit=500'),
    fetchJson('/api/builders?limit=200'),
  ]);

  const staticRoutes = [
    { url: `${SITE_URL}/`,          changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/buy`,       changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE_URL}/rent`,      changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE_URL}/builders`,  changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/blogs`,     changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/home-loan`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`,   changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/about`,     changeFrequency: 'monthly', priority: 0.4 },
  ];

  const propertyRoutes = properties
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/property/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const blogRoutes = blogs
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${SITE_URL}/blogs/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const builderRoutes = builders
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${SITE_URL}/builders/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes, ...builderRoutes];
}
