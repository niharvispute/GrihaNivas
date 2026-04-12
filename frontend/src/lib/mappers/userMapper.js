import { formatDateLabel, titleCase } from '@/lib/mappers/formatters';

export const mapUserProfileVM = (user) => ({
  id: user?._id,
  name: user?.name || '',
  phone: user?.phone || '',
  email: user?.email || '',
  role: titleCase(user?.role),
  isVerified: Boolean(user?.isVerified),
  isActive: Boolean(user?.isActive),
  profilePictureUrl: user?.profilePicture?.url || null,
  savedProperties: user?.savedProperties || [],
  comparedProperties: user?.comparedProperties || [],
  preferredLocations: user?.preferredLocations || [],
  lastLogin: formatDateLabel(user?.lastLogin),
  raw: user,
});

export const mapAdminUserListItemVM = (user) => ({
  id: user?._id,
  name: user?.name || '',
  phone: user?.phone || '',
  email: user?.email || '',
  role: titleCase(user?.role),
  isActive: Boolean(user?.isActive),
  isVerified: Boolean(user?.isVerified),
  createdAt: formatDateLabel(user?.createdAt),
  lastLogin: formatDateLabel(user?.lastLogin),
  raw: user,
});

export const mapAdminUserListToVM = (users = []) => users.map(mapAdminUserListItemVM);
