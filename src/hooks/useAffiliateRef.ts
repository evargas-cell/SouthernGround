'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'sgc_affiliate_ref';

/**
 * Reads ?ref= from the URL on first visit and persists it to localStorage.
 * Returns the affiliate ref code for the current session.
 */
export function useAffiliateRef(): string {
  const [ref, setRef] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get('ref');
    if (urlRef) {
      localStorage.setItem(STORAGE_KEY, urlRef);
      setRef(urlRef);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRef(stored);
    }
  }, []);

  return ref;
}
