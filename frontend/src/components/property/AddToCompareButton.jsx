'use client';

import { useState } from 'react';
import { addCompareProperty, removeCompareProperty } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

export default function AddToCompareButton({ propertyId }) {
  const { user, openModal } = useAuth();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      openModal('login');
      return;
    }
    setLoading(true);
    try {
      if (added) {
        await removeCompareProperty(propertyId);
        setAdded(false);
      } else {
        await addCompareProperty(propertyId);
        setAdded(true);
      }
    } catch {
      // silently ignore — user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={added ? 'Remove from Compare' : 'Add to Compare'}
      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        added
          ? 'bg-primary border-primary text-white'
          : 'border-slate-200 text-primary hover:bg-primary/5'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    </button>
  );
}
