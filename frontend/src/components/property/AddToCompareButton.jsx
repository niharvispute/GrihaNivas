'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { addCompareProperty, removeCompareProperty } from '@/services/userService';
=======
import { useEffect, useState } from 'react';
>>>>>>> 2cb51e1cc3eb1d59797484fe89c1c995a4dcd1a8
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errors';
import {
  addCompareProperty,
  getCompareProperties,
  removeCompareProperty,
} from '@/services/userService';

<<<<<<< HEAD
export default function AddToCompareButton({ propertyId, initialAdded = false }) {
  const { user, openModal } = useAuth();
  const [added, setAdded] = useState(initialAdded);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdded(initialAdded);
  }, [initialAdded]);

  const handleClick = async () => {
=======
let compareCacheUserId = null;
let compareIdCache = null;
let compareFetchPromise = null;

const toPropertyIdSet = (properties = []) => {
  const ids = new Set();
  properties.forEach((property) => {
    const id = property?._id || property?.id;
    if (id) ids.add(String(id));
  });
  return ids;
};

const resetCompareCache = () => {
  compareCacheUserId = null;
  compareIdCache = null;
  compareFetchPromise = null;
};

const getCompareIdSet = async (userId) => {
  if (!userId) return new Set();

  if (compareIdCache && compareCacheUserId === userId) {
    return new Set(compareIdCache);
  }

  if (compareFetchPromise && compareCacheUserId === userId) {
    return new Set(await compareFetchPromise);
  }

  compareCacheUserId = userId;
  compareFetchPromise = getCompareProperties({ map: false })
    .then((properties) => {
      const ids = toPropertyIdSet(properties);
      compareIdCache = ids;
      return ids;
    })
    .catch((error) => {
      resetCompareCache();
      throw error;
    })
    .finally(() => {
      compareFetchPromise = null;
    });

  return new Set(await compareFetchPromise);
};

const patchCompareCache = ({ userId, propertyId, add }) => {
  if (!userId || !propertyId) return;
  if (!compareIdCache || compareCacheUserId !== userId) return;

  if (add) {
    compareIdCache.add(String(propertyId));
    return;
  }

  compareIdCache.delete(String(propertyId));
};

export default function AddToCompareButton({ propertyId, variant = 'icon', className = '' }) {
  const { user, openModal } = useAuth();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || user?._id || null;
  const normalizedPropertyId = propertyId ? String(propertyId) : null;

  useEffect(() => {
    let active = true;

    if (!userId) {
      setAdded(false);
      resetCompareCache();
      return () => {
        active = false;
      };
    }

    if (!normalizedPropertyId) {
      setAdded(false);
      return () => {
        active = false;
      };
    }

    getCompareIdSet(userId)
      .then((ids) => {
        if (!active) return;
        setAdded(ids.has(normalizedPropertyId));
      })
      .catch(() => {
        if (!active) return;
        setAdded(false);
      });

    return () => {
      active = false;
    };
  }, [userId, normalizedPropertyId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

>>>>>>> 2cb51e1cc3eb1d59797484fe89c1c995a4dcd1a8
    if (!user) {
      openModal('login');
      addToast('Please log in to compare properties.', 'info');
      return;
    }

    if (!normalizedPropertyId) {
      addToast('Property is unavailable for comparison right now.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (added) {
        await removeCompareProperty(normalizedPropertyId);
        setAdded(false);
        patchCompareCache({ userId, propertyId: normalizedPropertyId, add: false });
        addToast('Removed from comparison list.', 'info');
      } else {
        const response = await addCompareProperty(normalizedPropertyId);
        setAdded(true);
        patchCompareCache({ userId, propertyId: normalizedPropertyId, add: true });

        if (/already in compare list/i.test(response?.message || '')) {
          addToast('This property is already in your comparison list.', 'info');
        } else {
          addToast('Added to comparison list.', 'success');
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update compare list. Please try again.');
      if (/max 3|compare list is full|remove a property/i.test(message)) {
        addToast(message, 'info');
      } else {
        addToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title={added ? 'Remove from Compare' : 'Add to Compare'}
        aria-label={added ? 'Remove from Compare' : 'Add to Compare'}
        className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl transition-colors disabled:opacity-50 ${
          added
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'border-slate-200 text-slate-600 hover:bg-primary/5 hover:border-primary/20 hover:text-primary'
        } ${className}`}
      >
        {icon}
        <span className="text-sm font-semibold">{added ? 'Compared' : 'Compare'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !normalizedPropertyId}
      title={added ? 'Remove from Compare' : 'Add to Compare'}
      aria-label={added ? 'Remove from Compare' : 'Add to Compare'}
      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        added
          ? 'bg-primary border-primary text-white'
          : 'border-slate-200 text-primary hover:bg-primary/5'
      } ${className}`}
    >
      {icon}
    </button>
  );
}
