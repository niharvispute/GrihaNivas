const asNonEmptyString = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed || '';
};

export const resolveImageSrc = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const src = asNonEmptyString(value);
    return src || null;
  }

  if (typeof value === 'object') {
    const urlSrc = asNonEmptyString(value.url);
    if (urlSrc) return urlSrc;

    const secureUrlSrc = asNonEmptyString(value.secure_url);
    if (secureUrlSrc) return secureUrlSrc;

    const src = asNonEmptyString(value.src);
    if (src) return src;
  }

  return null;
};

export const resolveFirstImageSrc = (collection) => {
  if (!collection) return null;

  const items = Array.isArray(collection) ? collection : [collection];
  for (const item of items) {
    const src = resolveImageSrc(item);
    if (src) return src;
  }

  return null;
};

export const resolveImageAlt = (value, fallback = 'Property image') => {
  const alt = asNonEmptyString(value);
  return alt || fallback;
};
