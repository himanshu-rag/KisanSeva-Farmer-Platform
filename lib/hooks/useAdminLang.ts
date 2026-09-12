'use client';
import { useState, useEffect } from 'react';

export function useAdminLang() {
  const [lang, setLang] = useState('hi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('kisanseva_admin_lang');
    if (saved) {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem('kisanseva_admin_lang', nextLang);
    // Reload page to apply changes across all disconnected components easily
    window.location.reload();
  };

  return { lang, toggleLang, mounted };
}
