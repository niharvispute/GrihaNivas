import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';
import { downloadAuthedFile } from '@/lib/api/downloadFile';

// ── Public: Projects ────────────────────────────────────────────────────────

export const listProjects = async (params = {}) => {
  const res = await apiFetch('/api/projects', { query: params });
  return {
    items: Array.isArray(res.data) ? res.data : [],
    meta: res.meta,
    message: res.message,
  };
};

export const getProjectBySlug = async (slug) => {
  const res = await apiFetch(`/api/projects/slug/${slug}`);
  return res.data;
};

/**
 * Project / Bulk Unit Registration service.
 *
 * All admin project routes live under `/api/projects` (NOT `/api/admin/projects`):
 *   - list:    GET    /api/projects/admin
 *   - getOne:  GET    /api/projects/:id
 *   - create:  POST   /api/projects                 (multipart)
 *   - update:  PUT    /api/projects/:id             (multipart)
 *   - delete:  DELETE /api/projects/:id
 *   - status:  PATCH  /api/projects/:id/status
 *   - feature: PATCH  /api/projects/:id/featured
 *
 * Configurations: POST /api/projects/:id/configurations,
 *                 PUT/DELETE /api/projects/project-configurations/:configId
 * Units:          GET/POST /api/projects/:id/units,
 *                 PUT/DELETE /api/projects/project-units/:unitId,
 *                 POST /api/projects/:id/bulk-import-units,
 *                 GET /api/projects/:id/units/export
 *
 * NOTE: `listingStatus` label remap — UI "Published" maps to backend `'active'`.
 * Handle that remap in the service layer (helpers below), not in components.
 */

// ── listingStatus remap (UI label <-> backend enum) ─────────────────────────

const LISTING_STATUS_TO_BACKEND = {
  Draft: 'draft',
  Published: 'active',
  Inactive: 'inactive',
};

const LISTING_STATUS_TO_LABEL = {
  draft: 'Draft',
  active: 'Published',
  inactive: 'Inactive',
};

export const toBackendListingStatus = (label) =>
  LISTING_STATUS_TO_BACKEND[label] || String(label || '').toLowerCase();

export const toListingStatusLabel = (value) =>
  LISTING_STATUS_TO_LABEL[value] || value;

// ── bhkType mapping (UI label "1 BHK" <-> backend "1BHK") ───────────────────

export const toBackendBhkType = (label) =>
  typeof label === 'string' ? label.replace(/\s+/g, '') : label;

export const toBhkLabel = (value) =>
  typeof value === 'string' ? value.replace(/(\d)BHK/i, '$1 BHK') : value;

// ── Admin: Projects ─────────────────────────────────────────────────────────

export const adminListProjects = async (params = {}) => {
  const res = await authedApiFetch('/api/projects/admin', { query: params });
  return {
    items: Array.isArray(res.data) ? res.data : [],
    meta: res.meta,
    message: res.message,
  };
};

export const getProjectById = async (id) => {
  const res = await authedApiFetch(`/api/projects/${id}`);
  return res.data;
};

export const createProject = async (formData) => {
  const res = await authedApiFetch('/api/projects', {
    method: 'POST',
    body: formData,
  });
  return res.data;
};

export const updateProject = async (id, formData) => {
  const res = await authedApiFetch(`/api/projects/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await authedApiFetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};

export const setProjectStatus = async (id, listingStatus) => {
  const res = await authedApiFetch(`/api/projects/${id}/status`, {
    method: 'PATCH',
    body: { listingStatus: toBackendListingStatus(listingStatus) },
  });
  return res.data;
};

export const toggleFeatured = async (id, isFeatured) => {
  const res = await authedApiFetch(`/api/projects/${id}/featured`, {
    method: 'PATCH',
    body: { isFeatured: Boolean(isFeatured) },
  });
  return res.data;
};

// ── Configurations ──────────────────────────────────────────────────────────

export const createConfiguration = async (projectId, formData) => {
  const res = await authedApiFetch(`/api/projects/${projectId}/configurations`, {
    method: 'POST',
    body: formData,
  });
  return res.data;
};

export const updateConfiguration = async (configId, formData) => {
  const res = await authedApiFetch(
    `/api/projects/project-configurations/${configId}`,
    {
      method: 'PUT',
      body: formData,
    }
  );
  return res.data;
};

export const deleteConfiguration = async (configId) => {
  const res = await authedApiFetch(
    `/api/projects/project-configurations/${configId}`,
    {
      method: 'DELETE',
    }
  );
  return res.data;
};

export const listConfigurations = async (projectId) => {
  const res = await authedApiFetch(`/api/projects/${projectId}/configurations`);
  return Array.isArray(res.data) ? res.data : [];
};

// ── Units ─────────────────────────────────────────────────────────────────

export const listUnits = async (projectId, params = {}) => {
  const res = await authedApiFetch(`/api/projects/${projectId}/units`, {
    query: params,
  });
  return {
    items: Array.isArray(res.data) ? res.data : [],
    meta: res.meta,
    message: res.message,
  };
};

export const createUnit = async (projectId, data) => {
  const res = await authedApiFetch(`/api/projects/${projectId}/units`, {
    method: 'POST',
    body: data,
  });
  return res.data;
};

export const updateUnit = async (unitId, data) => {
  const res = await authedApiFetch(`/api/projects/project-units/${unitId}`, {
    method: 'PUT',
    body: data,
  });
  return res.data;
};

export const deleteUnit = async (unitId) => {
  const res = await authedApiFetch(`/api/projects/project-units/${unitId}`, {
    method: 'DELETE',
  });
  return res.data;
};

export const bulkImportUnits = async (projectId, units) => {
  const res = await authedApiFetch(
    `/api/projects/${projectId}/bulk-import-units`,
    {
      method: 'POST',
      body: { units },
    }
  );
  return res.data;
};

export const bulkImportUnitsFromFile = async (projectId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await authedApiFetch(
    `/api/projects/${projectId}/bulk-import-file`,
    {
      method: 'POST',
      body: fd,
    }
  );
  return res.data;
};

export const exportUnits = async (projectId, params = {}) => {
  return downloadAuthedFile(`/api/projects/${projectId}/units/export`, {
    query: params,
    fallbackName: 'project_units.xlsx',
  });
};
