import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const FALLBACK_BANNERS = [
  {
    id: 1,
    title: 'Hero Banner',
    description: 'Primary homepage spotlight banner',
    status: 'Live',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADEZDvz2DM7rGZvV-JZ4l29bjVhlwmFyigtCQY07jJdgH2m7SFwySjJuuYzLjJ0M3_lp80XK6v1qke3HL5_E7sWL4FiUXelaMsrAy0BV-WBY0k7ZJFQW7ijnOTebU_vis8h8NcZ9opyG9SVq2rDtI9QbE6pKeujEa0lFFQuvGlQLlTA6Jcn6o3m-brMaXKjUS-uqOQrEjC8IaNw8MGcuZGyjo_YmquZeon6LoqopNCJpjz9_jnmrIFdj3rPn_w_WgJhfi7-Hggm_Q',
    lastUpdated: 'Oct 24, 2023 by Alex S.',
    recommendedSize: '1920x600px',
  },
  {
    id: 2,
    title: 'Home Banner 2',
    description: 'Secondary promotion area (Mid-page)',
    status: 'Scheduled',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPD9A1TJmt4eYPnWJkRuSMFECiv9f553B_YA4qOh_djSgcxcsUyIjziStRL_87iVyGloAGVcOX1GJNjxTHIfZ7xN_SfqQUDphbQG456JY_h5qbn7O_BMgpPikG3eHubdY5tMPu5p8Nx_Y5N5HVbIPz8VCrkCX2FU50IDrbYIIiowSyLXr-F3rCJFp_VKKUCpjNMQQ_CCbWHvRlvpYqRNzq9Q2L3RvBurM5cAcXsAefHnDDYCzQXkAkSZ5-GWOzmQ89_6LvafFIYWc',
    lastUpdated: 'Nov 01, 2023 (Scheduled)',
    recommendedSize: '1920x600px',
  },
  {
    id: 3,
    title: 'Home Banner 3',
    description: 'Footer call-to-action banner',
    status: 'Inactive',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASIQWQSoMInj0P9pFrehjeLOtOTqE6EodUWdMZTD9MiG91Pd5RPcsQuY4TSPSETOCUKxfsuc_Wte-fLNL8vg_TsiEIdUWAorf4Ai6jJQkv_KsS22R4OuXNY5DiBYPLtBhyrwJwb1uz9QAS6lKF8SssvLusCW7Vi1k0DO4O83EtYFD4xs9kycY9lHMKSJkrMwCD9VF0-u0ioTx7ck0QazgCldeqlblign-SKrGWEHFJMfQFWziF_FDnFpISTimMjhxoNVg0qiPVwzk',
    lastUpdated: 'N/A',
    recommendedSize: '1920x600px',
  },
];

const POSITION_LABELS = {
  home_hero: 'Hero Banner',
  home_secondary: 'Home Banner 2',
  listing_sidebar: 'Listing Sidebar Banner',
  blog_sidebar: 'Blog Sidebar Banner',
};

const toLastUpdatedText = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapBannerToAdminVM = (banner) => ({
  id: banner?._id,
  title: banner?.title || POSITION_LABELS[banner?.position] || 'Banner',
  description: banner?.position ? `Placement: ${banner.position}` : 'Promotional banner slot',
  status: banner?.isActive ? 'Live' : 'Inactive',
  image: banner?.image?.url || '',
  lastUpdated: toLastUpdatedText(banner?.updatedAt),
  recommendedSize: '1920x600px',
  raw: banner,
});

/**
 * Fetch all banner slots and their current configurations.
 */
export const listBanners = async () => {
  try {
    const res = await apiFetch('/api/banners');
    const items = Array.isArray(res.data) ? res.data.map(mapBannerToAdminVM) : [];
    return items.length ? items : FALLBACK_BANNERS;
  } catch {
    return FALLBACK_BANNERS;
  }
};

/**
 * Update a specific banner slot configuration.
 */
export const updateBanner = async (id, data) => {
  const res = await authedApiFetch(`/api/banners/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.data;
};

/**
 * Upload a banner image asset.
 */
export const uploadBannerImage = async (formData) => {
  const res = await authedApiFetch('/api/banners', {
    method: 'POST',
    body: formData,
  });
  return res.data;
};
