import { authedApiFetch } from '@/lib/api/authedRequest';

export const getAdminDashboardStats = async () => {
  const res = await authedApiFetch('/api/dashboard');
  return res.data;
};
