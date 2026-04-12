import { apiFetch } from '@/lib/api';

export const calculateEmi = async (payload) => {
  const res = await apiFetch('/api/calculators/emi', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

export const calculateStampDuty = async (payload) => {
  const res = await apiFetch('/api/calculators/stamp-duty', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};
