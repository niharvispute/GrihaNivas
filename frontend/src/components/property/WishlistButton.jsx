'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getSavedProperties,
  saveProperty,
  unsaveProperty,
} from '@/services/userService';

let wishlistCacheUserId = null;
let wishlistIdCache = null;
let wishlistFetchPromise = null;
const wishlistListeners = new Set();

const toPropertyIdSet = (properties = []) => {
  const ids = new Set();
  properties.forEach((property) => {
    const id = property?._id || property?.id;
    if (id) ids.add(String(id));
  });
  return ids;
};

const notifyWishlistListeners = () => {
  const snapshot = new Set(wishlistIdCache || []);
  wishlistListeners.forEach((listener) => {
    listener(snapshot);
  });
};

const subscribeWishlist = (listener) => {
  wishlistListeners.add(listener);
  return () => wishlistListeners.delete(listener);
};

const resetWishlistCache = () => {
  wishlistCacheUserId = null;
  wishlistIdCache = null;
  wishlistFetchPromise = null;
  notifyWishlistListeners();
};

const getWishlistIdSet = async (userId) => {
  if (!userId) return new Set();

  if (wishlistIdCache && wishlistCacheUserId === userId) {
    return new Set(wishlistIdCache);
  }

  if (wishlistFetchPromise && wishlistCacheUserId === userId) {
    return new Set(await wishlistFetchPromise);
  }

  wishlistCacheUserId = userId;
  wishlistFetchPromise = getSavedProperties({ map: false })
    .then((properties) => {
      const ids = toPropertyIdSet(properties);
      wishlistIdCache = ids;
      notifyWishlistListeners();
      return ids;
    })
    .catch((error) => {
      resetWishlistCache();
      throw error;
    })
    .finally(() => {
      wishlistFetchPromise = null;
    });

  return new Set(await wishlistFetchPromise);
};

const patchWishlistCache = ({ userId, propertyId, add }) => {
  if (!userId || !propertyId) return;
  if (!wishlistIdCache || wishlistCacheUserId !== userId) return;

  if (add) {
    wishlistIdCache.add(String(propertyId));
  } else {
    wishlistIdCache.delete(String(propertyId));
  }

  notifyWishlistListeners();
};

/**
 * Heart button for saving / unsaving a property.
 *
 * Props:
 *  - propertyId    string          — MongoDB _id of the property
 *  - initialSaved  boolean         — initial status from backend
 *  - variant       'overlay'|'row' — 'overlay' = frosted glass for image overlays;
 *                                    'row' = bordered for use inside card/detail layouts
 *  - className     string          — extra classes on the wrapper
 */
export default function WishlistButton({ propertyId, initialSaved = false, variant = 'overlay', className = '' }) {
  const { user, openModal } = useAuth();
  const { addToast } = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const userId = user?.id || user?._id || null;
  const normalizedPropertyId = propertyId ? String(propertyId) : null;

  useEffect(() => {
    let active = true;

    if (!userId) {
      setSaved(false);
      resetWishlistCache();
      return () => {
        active = false;
      };
    }

    if (!normalizedPropertyId) {
      setSaved(false);
      return () => {
        active = false;
      };
    }

    setSaved(Boolean(initialSaved));

    getWishlistIdSet(userId)
      .then((ids) => {
        if (!active) return;
        setSaved(ids.has(normalizedPropertyId));
      })
      .catch(() => {
        if (!active) return;
        setSaved(Boolean(initialSaved));
      });

    return () => {
      active = false;
    };
  }, [userId, normalizedPropertyId, initialSaved]);

  useEffect(() => {
    if (!userId || !normalizedPropertyId) return undefined;

    const unsubscribe = subscribeWishlist((ids) => {
      setSaved(ids.has(normalizedPropertyId));
    });

    return unsubscribe;
  }, [userId, normalizedPropertyId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openModal('login');
      addToast('Please log in to save properties to your wishlist.', 'info');
      return;
    }

    if (!normalizedPropertyId) {
      addToast('Property is unavailable for wishlist right now.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await unsaveProperty(normalizedPropertyId);
        setSaved(false);
        patchWishlistCache({ userId, propertyId: normalizedPropertyId, add: false });
        addToast('Removed from your wishlist.', 'info');
      } else {
        await saveProperty(normalizedPropertyId);
        setSaved(true);
        patchWishlistCache({ userId, propertyId: normalizedPropertyId, add: true });
        addToast('Added to your wishlist! View it in Saved Properties.', 'success');
      }
    } catch {
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const heartIcon = (color = 'currentColor', size = 20) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={saved ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${loading ? 'scale-75' : saved ? 'scale-110' : 'scale-100'}`}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  // ── Overlay variant — frosted glass, for image corners ──────────────────────
  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !normalizedPropertyId}
        title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 ${
          saved
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/20 backdrop-blur-md text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30'
        } ${className}`}
      >
        {heartIcon('currentColor', 20)}
      </button>
    );
  }

  // ── Row variant — bordered pill, for sidebar / card action rows ─────────────
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !normalizedPropertyId}
      title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
      aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
      className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl transition-colors disabled:opacity-50 ${
        saved
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
      } ${className}`}
    >
      {heartIcon(saved ? '#ef4444' : 'currentColor', 18)}
      <span className="text-sm font-bold">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
