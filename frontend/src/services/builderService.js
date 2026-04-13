import { apiFetch } from '@/lib/api';

/**
 * Mock data for builders following the reference design.
 */
const MOCK_BUILDERS = [
  {
    id: 1,
    slug: 'skyline-apex-group',
    name: 'Skyline Apex Group',
    tagline: 'Pioneering sustainable luxury for over 3 decades.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzVXA5ZYuqAqtkrqwUY1dIPIOM3YNSEcljeyR5r8OYfh2oJFhUeXeXke8SBX2E3FAeXpdkeZWjg1uMEPEjzlfMYKVHiQpieFQ4bvzCB4HK6ms41WHtHMAUT79PgLPnb5rztBL7vyyovC1kBM9sC8YUif5pESgPQnpiL94MKERzXu-DNS-_jOUeSIO5LAUi_UxdPwR9A62x20RZ1SHgsQnaXNeUMoPbbF0IzM5XPT9yaqyPVo5UWZN95r8AUyfE9F-cYjVteOoMusg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtroGLamOf-BOujXWJAw-LI3T7G0mYP3qe77JswpE-qNyDgvVgW1i0EomVw_VnQMK7zd9JzGyjhNFCcH1LZmoT1JD7Hiw6u8NB3uxsC5NetpsEoHAqXL4jJhFKwKDCPfxlgI527irJBrqGlSej_qGICwpmHOH48fk8p7UQTjfNRdyR7eNS3_GwPbtD20KbAu6NxzKE6HFMEG_RpkcEyDqFKTtbUK4ukd1TpJJ_uFowoeYXFTLJYEF8Homz9uXL9yRdnoxIeS84rSA',
    estYear: '1992',
    totalProjects: 142,
    ongoingProjects: 18,
    completedProjects: 124,
    hq: 'Dubai, UAE',
    tier: 'Partner of the Month',
    description: 'Pioneering sustainable luxury for over 3 decades. With 140+ completed landmarks, Skyline Apex continues to redefine the urban horizon with award-winning designs and uncompromising quality.',
    about: 'Skyline Apex Group represents the pinnacle of urban sophistication. Since our inception in 1992, we have been more than just builders; we have been architects of dreams, reshaping the skylines of global metropolises from Dubai to Mumbai.',
    qualityStandards: 'ISO 9001:2015 Certified',
    innovation: 'Green Building Leader',
    projects: [
      { id: 101, title: 'Skyline Sea View', location: 'Worli, Mumbai', price: '₹4.5 Cr+', status: 'New Launch', config: '3 & 4 BHK' },
      { id: 102, title: 'Apex Heights', location: 'Bandra West', price: '₹6.2 Cr+', status: 'Ready to Move', config: '4 BHK Only' },
      { id: 103, title: 'Skyline Enclave', location: 'Lower Parel', price: '₹3.8 Cr+', status: 'Under Construction', config: '2 & 3 BHK' }
    ]
  },
  {
    id: 2,
    slug: 'urban-oasis-devs',
    name: 'Urban Oasis Devs',
    tagline: 'Nature-integrated urban living.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDINJe0JMRzdgNS-OYvHGd9SMdedU5Gx570LhuqQtE7gKy4jG4vaU4pHw1PTDedKs5W8k9uHyDO-pGX6v2i6QhjmqMDnwZulwVOIo-asK4N_OD1QuWNAPR743Ahct7NZuoLzkJKhdzpUdteNzSa87pyLArxil84wlt_MaIZVaC415DFd6ttG3Njxxmez3yOeNpYQZi6_I5EYspUJ8TbEILUyCCj2gNYo5Z6r5wSvmeBnhMV1fnZmJZylTW-XOVukAVzkQxxEp7wReI',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDINJe0JMRzdgNS-OYvHGd9SMdedU5Gx570LhuqQtE7gKy4jG4vaU4pHw1PTDedKs5W8k9uHyDO-pGX6v2i6QhjmqMDnwZulwVOIo-asK4N_OD1QuWNAPR743Ahct7NZuoLzkJKhdzpUdteNzSa87pyLArxil84wlt_MaIZVaC415DFd6ttG3Njxxmez3yOeNpYQZi6_I5EYspUJ8TbEILUyCCj2gNYo5Z6r5wSvmeBnhMV1fnZmJZylTW-XOVukAVzkQxxEp7wReI',
    estYear: '2008',
    totalProjects: 48,
    hq: 'Singapore',
    tier: 'Premier Tier',
    description: 'Specializing in eco-friendly residential spaces and vertical gardens in the heart of metropolitan hubs.'
  },
  {
    id: 3,
    slug: 'vanguard-estates',
    name: 'Vanguard Estates',
    tagline: 'Luxury villas reimagined.',
    logo: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHl3DSTW4PdWbNUrlvjdVQuTjLs_OWuNu5fVvr_NKmPVc5w9c8IaedJZEAClXbVq_Q_Qv7iQXmWuWPYmj3xQJ-zqeEKxPUnRjhYAdv3Z5aEmPNrrd1OFA--z_fL4Vz17Zv-soOMh6ViS0m6kWWCS6EER5GnNAjMBMOtVzkoNI_ioXrPKFlbt1eElpyUwex0kA2gXwyZ_wxmvA4rL1dZtnHfeZzdgPFWQ93SnyM1c741UIprHar0FINTYeMS5MoEcdY-qKjyQb0Zgw',
    estYear: '1985',
    totalProjects: 120,
    hq: 'London, UK',
    description: 'Leading the market in high-end luxury villas and private gated communities globally.'
  }
];

/**
 * Fetch builders with optional filtering.
 */
export const listBuilders = async (params = {}) => {
  // Simulating API latency
  return { items: MOCK_BUILDERS, total: MOCK_BUILDERS.length };
};

/**
 * Get a builder profile by their slug.
 */
export const getBuilderBySlug = async (slug) => {
  const builder = MOCK_BUILDERS.find(b => b.slug === slug);
  if (!builder) throw new Error('Builder not found');
  return builder;
};
