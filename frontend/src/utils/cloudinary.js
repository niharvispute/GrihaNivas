export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('f_auto') || url.includes('q_auto')) return url;

  const { width, height, crop = 'fill' } = options;
  let transformations = 'f_auto,q_auto';

  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (width || height) transformations += `,c_${crop}`;

  return url.replace('/upload/', `/upload/${transformations}/`);
}
