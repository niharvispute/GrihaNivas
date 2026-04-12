import { apiFetch } from '@/lib/api';

/**
 * Fetch all banner slots and their current configurations.
 */
export const listBanners = async () => {
  // In a real app, this would be an API call
  // const res = await apiFetch('/api/admin/banners');
  // return res.data;
  
  // For demo, return mock data matching the reference designs
  return [
    {
      id: 1,
      title: 'Hero Banner',
      description: 'Primary homepage spotlight banner',
      status: 'Live',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADEZDvz2DM7rGZvV-JZ4l29bjVhlwmFyigtCQY07jJdgH2m7SFwySjJuuYzLjJ0M3_lp80XK6v1qke3HL5_E7sWL4FiUXelaMsrAy0BV-WBY0k7ZJFQW7ijnOTebU_vis8h8NcZ9opyG9SVq2rDtI9QbE6pKeujEa0lFFQuvGlQLlTA6Jcn6o3m-brMaXKjUS-uqOQrEjC8IaNw8MGcuZGyjo_YmquZeon6LoqopNCJpjz9_jnmrIFdj3rPn_w_WgJhfi7-Hggm_Q',
      lastUpdated: 'Oct 24, 2023 by Alex S.',
      recommendedSize: '1920x600px'
    },
    {
      id: 2,
      title: 'Home Banner 2',
      description: 'Secondary promotion area (Mid-page)',
      status: 'Scheduled',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPD9A1TJmt4eYPnWJkRuSMFECiv9f553B_YA4qOh_djSgcxcsUyIjziStRL_87iVyGloAGVcOX1GJNjxTHIfZ7xN_SfqQUDphbQG456JY_h5qbn7O_BMgpPikG3eHubdY5tMPu5p8Nx_Y5N5HVbIPz8VCrkCX2FU50IDrbYIIiowSyLXr-F3rCJFp_VKKUCpjNMQQ_CCbWHvRlvpYqRNzq9Q2L3RvBurM5cAcXsAefHnDDYCzQXkAkSZ5-GWOzmQ89_6LvafFIYWc',
      lastUpdated: 'Nov 01, 2023 (Scheduled)',
      recommendedSize: '1920x600px'
    },
    {
      id: 3,
      title: 'Home Banner 3',
      description: 'Footer call-to-action banner',
      status: 'Inactive',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASIQWQSoMInj0P9pFrehjeLOtOTqE6EodUWdMZTD9MiG91Pd5RPcsQuY4TSPSETOCUKxfsuc_Wte-fLNL8vg_TsiEIdUWAorf4Ai6jJQkv_KsS22R4OuXNY5DiBYPLtBhyrwJwb1uz9QAS6lKF8SssvLusCW7Vi1k0DO4O83EtYFD4xs9kycY9lHMKSJkrMwCD9VF0-u0ioTx7ck0QazgCldeqlblign-SKrGWEHFJMfQFWziF_FDnFpISTimMjhxoNVg0qiPVwzk',
      lastUpdated: 'N/A',
      recommendedSize: '1920x600px'
    }
  ];
};

/**
 * Update a specific banner slot configuration.
 */
export const updateBanner = async (id, data) => {
  const res = await apiFetch(`/api/admin/banners/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.data;
};

/**
 * Upload a banner image asset.
 */
export const uploadBannerImage = async (formData) => {
  // Typical multipart upload
  const res = await apiFetch('/api/admin/assets/upload', {
    method: 'POST',
    body: formData,
    headers: {
        // Content-Type is handled automatically by fetch for FormData
    }
  });
  return res.data;
};
