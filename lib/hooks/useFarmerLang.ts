'use client';
import { useState, useEffect } from 'react';

export type FarmerLang = 'hi' | 'en' | 'pa' | 'mr' | 'gu' | 'bn';

export function useFarmerLang() {
  const [lang, setLang] = useState<FarmerLang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('kisanseva_lang') as FarmerLang) || 'hi';
    }
    return 'hi';
  });

  useEffect(() => {
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
