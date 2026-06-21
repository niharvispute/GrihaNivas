const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grihanivas.in';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/(dashboard)/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
