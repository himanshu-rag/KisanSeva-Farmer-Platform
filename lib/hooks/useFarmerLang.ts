'use client';
import { useState, useEffect } from 'react';

export type FarmerLang = 'hi' | 'en' | 'pa' | 'mr' | 'gu' | 'bn';

export function useFarmerLang() {
  // Always initialize to the same value on server and client to prevent Hydration Errors
  const [lang, setLang] = useState<FarmerLang>('hi');

  useEffect(() => {
    // Read from localStorage only after mounting on the client
    const stored = (localStorage.getItem('kisanseva_lang') as FarmerLang) || 'hi';
    setLang(stored);

    const handleStorage = () => {
      const stored = (localStorage.getItem('kisanseva_lang') as FarmerLang) || 'hi';
      setLang(stored);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { lang, isEn: lang === 'en' };
}

export function t(lang: FarmerLang, hi: string, en: string): string {
  return lang === 'en' ? en : hi;
}
