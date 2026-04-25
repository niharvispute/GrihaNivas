'use client';

import Image from 'next/image';
import { useState } from 'react';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';

function buildBlurUrl(src) {
  if (!src?.includes('res.cloudinary.com') || !src.includes('/upload/')) return null;
  return src.replace('/upload/', '/upload/w_20,h_20,e_blur:200/');
}

/**
 * Renders a Cloudinary image with automatic format/quality optimization and
 * a blurred low-res placeholder while the full image loads.
 *
 * Props mirror Next.js <Image>. Use eager={true} for hero/above-fold images.
 */
export default function CloudinaryImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = '',
  eager,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const isCloudinary = typeof src === 'string' && src.includes('res.cloudinary.com');
  const optimizedSrc = isCloudinary
    ? optimizeCloudinaryUrl(src, fill ? {} : { width, height })
    : src;
  const blurSrc = fill && isCloudinary ? buildBlurUrl(src) : null;

  const imgEl = (
    <Image
      src={optimizedSrc || src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      unoptimized={isCloudinary}
      loading={eager ? 'eager' : 'lazy'}
      priority={!!eager}
      className={className}
      onLoad={() => setLoaded(true)}
      {...rest}
    />
  );

  if (!blurSrc) return imgEl;

  return (
    <div className="contents">
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url("${blurSrc}")` }}
      />
      {imgEl}
    </div>
  );
}
