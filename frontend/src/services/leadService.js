import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { mapLeadListToVM } from '@/lib/mappers/leadMapper';

export const createLead = async (payload) => {
  const res = await apiFetch('/api/leads', {
    method: 'POST',
    body: payload,
  });
  return res.data;
};

export const listLeads = async (query = {}, { map = true } = {}) => {
  const res = await authedApiFetch('/api/leads', { query });
  return {
    items: map ? mapLeadListToVM(res.data || []) : res.data || [],
    meta: res.meta,
    message: res.message,
  };
};

export const updateLeadStatus = async (leadId, status) => {
  const res = await authedApiFetch(`/api/leads/${leadId}/status`, {
    method: 'PUT',
    body: { status },
  });
  return res.data;
};

export const assignLead = async (leadId, adminId) => {
  const res = await authedApiFetch(`/api/leads/${leadId}/assign`, {
    method: 'PUT',
    body: { adminId },
  });
  return res.data;
};

export const addLeadNote = async (leadId, text) => {
  const res = await authedApiFetch(`/api/leads/${leadId}/notes`, {
    method: 'POST',
    body: { text },
  });
  return res.data;
};
