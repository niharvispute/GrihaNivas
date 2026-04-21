'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listMyPropertySubmissions } from '@/services/propertySubmissionService';

export const MY_LISTINGS_SUMMARY_INVALIDATED_EVENT = 'my-listings-summary:invalidated';

const EMPTY_SUMMARY = {
  hasListings: false,
  latestListing: null,
  listingsCount: 0,
};

const summaryCache = new Map();
const inFlightRequests = new Map();

const getUserCacheKey = (user) => user?.id || user?._id || user?.email || null;

const toUserKey = (userOrKey) => {
  if (!userOrKey) return null;
  if (typeof userOrKey === 'string') return userOrKey;
  return getUserCacheKey(userOrKey);
};

const toSummary = (response) => {
  const items = Array.isArray(response?.items) ? response.items : [];
  const total = Number(response?.meta?.total) || items.length || 0;

  return {
    hasListings: total > 0,
    latestListing: items[0] || null,
    listingsCount: total,
  };
};

const fetchSummary = async (userKey) => {
  if (summaryCache.has(userKey)) {
    return summaryCache.get(userKey);
  }

  if (inFlightRequests.has(userKey)) {
    return inFlightRequests.get(userKey);
  }

  const request = listMyPropertySubmissions({ page: 1, limit: 1 })
    .then((response) => {
      const summary = toSummary(response);
      summaryCache.set(userKey, summary);
      return summary;
    })
    .finally(() => {
      inFlightRequests.delete(userKey);
    });

  inFlightRequests.set(userKey, request);
  return request;
};

export const invalidateMyListingsSummary = (userOrKey = null) => {
  const userKey = toUserKey(userOrKey);

  if (userKey) {
    summaryCache.delete(userKey);
    inFlightRequests.delete(userKey);
  } else {
    summaryCache.clear();
    inFlightRequests.clear();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(MY_LISTINGS_SUMMARY_INVALIDATED_EVENT, {
        detail: { userKey },
      })
    );
  }
};

export const useMyListingsSummary = (user, options = {}) => {
  const enabled = options.enabled ?? true;
  const userKey = useMemo(() => getUserCacheKey(user), [user]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!enabled || !userKey) {
      setSummary(EMPTY_SUMMARY);
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    if (summaryCache.has(userKey)) {
      setSummary(summaryCache.get(userKey));
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    setLoading(true);

    fetchSummary(userKey)
      .then((nextSummary) => {
        if (!isActive) return;
        setSummary(nextSummary);
      })
      .catch(() => {
        if (!isActive) return;
        setSummary(EMPTY_SUMMARY);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [enabled, userKey]);

  const refresh = useCallback(async () => {
    if (!enabled || !userKey) {
      setSummary(EMPTY_SUMMARY);
      return EMPTY_SUMMARY;
    }

    summaryCache.delete(userKey);
    setLoading(true);

    try {
      const nextSummary = await fetchSummary(userKey);
      setSummary(nextSummary);
      return nextSummary;
    } catch {
      setSummary(EMPTY_SUMMARY);
      return EMPTY_SUMMARY;
    } finally {
      setLoading(false);
    }
  }, [enabled, userKey]);

  useEffect(() => {
    if (!enabled || !userKey || typeof window === 'undefined') {
      return undefined;
    }

    const handleInvalidation = (event) => {
      const targetUserKey = event?.detail?.userKey || null;
      if (targetUserKey && targetUserKey !== userKey) return;
      void refresh();
    };

    window.addEventListener(MY_LISTINGS_SUMMARY_INVALIDATED_EVENT, handleInvalidation);
    return () => {
      window.removeEventListener(MY_LISTINGS_SUMMARY_INVALIDATED_EVENT, handleInvalidation);
    };
  }, [enabled, userKey, refresh]);

  return {
    ...summary,
    loading,
    refresh,
  };
};
