import { apiFetch } from '@/lib/api';

export const getHealth = async () => {
  const res = await apiFetch('/health');
  return res;
};

export const getReadiness = async () => {
  const res = await apiFetch('/health/ready');
  return res;
};
