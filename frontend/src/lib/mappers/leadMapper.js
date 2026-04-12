import { formatDateLabel, titleCase } from '@/lib/mappers/formatters';

export const mapLeadToListVM = (lead) => ({
  id: lead?._id,
  name: lead?.name || '',
  phone: lead?.phone || '',
  email: lead?.email || '',
  leadType: titleCase(lead?.leadType),
  status: titleCase(lead?.status),
  message: lead?.message || '',
  createdAt: formatDateLabel(lead?.createdAt),
  assignedTo: lead?.assignedTo?.name || null,
  propertyTitle: lead?.propertyId?.title || null,
  raw: lead,
});

export const mapLeadListToVM = (leads = []) => leads.map(mapLeadToListVM);
