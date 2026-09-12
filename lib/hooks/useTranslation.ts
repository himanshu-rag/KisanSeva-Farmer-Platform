'use client';

import { useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

type Translations = typeof en;
type LangCode = 'en' | 'hi' | 'pa' | 'mr' | 'gu' | 'bn';

const translations: Record<string, Translations> = {
  en,
  hi,
  // Fallback to Hindi for other languages (architecture ready)
  pa: hi,
  mr: hi,
  gu: hi,
  bn: hi,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as object)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }
  return typeof current === 'string' ? current : path;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

export function useTranslation() {
  const getLang = useCallback((): LangCode => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('kisanseva_lang') as LangCode) || 'hi';
    }
    return 'hi';
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const lang = getLang();
      const dict = translations[lang] || translations.hi;
      const raw = getNestedValue(dict as unknown as Record<string, unknown>, key);
      return interpolate(raw, vars);
    },
    [getLang]
  );

  const lang = getLang();

  return { t, lang };
}

export type { LangCode };
