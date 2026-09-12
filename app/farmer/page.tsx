'use client';

import { useRouter } from 'next/navigation';

const languages = [
  { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
  { code: 'mr', label: 'मराठी', sub: 'Marathi' },
  { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
  { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
];

export default function LanguageSelect() {
  const router = useRouter();

  const select = (code: string) => {
    localStorage.setItem('kisanseva_lang', code);
    router.push('/farmer/login');
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #2A7A3B 0%, #1C5228 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>🌾</div>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>KisanSeva</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', margin: '4px 0 0' }}>किसान सेवा</p>
      </div>

      {/* Heading */}
      <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
        अपनी भाषा चुनें
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '28px', textAlign: 'center' }}>
        Choose your language
      </p>

      {/* Language Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {languages.map(({ code, label, sub }) => (
          <button
            key={code}
            onClick={() => select(code)}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A' }}>{label}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '40px', textAlign: 'center' }}>
        Govt. of India | भारत सरकार
      </p>
    </div>
  );
}
