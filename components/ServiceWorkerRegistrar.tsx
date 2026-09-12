'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[KisanSeva] SW registered, scope:', reg.scope))
        .catch((err) => console.warn('[KisanSeva] SW registration failed:', err));
    }
  }, []);

  return null;
}
