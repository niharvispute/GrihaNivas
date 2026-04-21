import { authedApiFetch } from '@/lib/api/authedRequest';
import { downloadAuthedFile } from '@/lib/api/downloadFile';
import { mapLeadListToVM } from '@/lib/mappers/leadMapper';

export const createLead = async (payload) => {
  const res = await authedApiFetch('/api/leads', {
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

export const getLeadById = async (leadId) => {
  const res = await authedApiFetch(`/api/leads/${leadId}`);
  return res.data;
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

export const deleteLead = async (leadId) => {
  const res = await authedApiFetch(`/api/leads/${leadId}`, {
    method: 'DELETE',
  });
  return res.data;
};

export const exportLeads = async (query = {}) => {
  return downloadAuthedFile('/api/leads/export', {
    query,
    fallbackName: 'bricks_leads.xlsx',
  });
};
