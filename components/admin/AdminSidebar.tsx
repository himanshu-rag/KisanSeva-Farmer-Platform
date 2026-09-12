'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Map, Brain, AlertTriangle, LogOut, MapPin, QrCode, Ticket } from 'lucide-react';
import { adminTranslations } from '@/lib/i18n/admin';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [lang, setLang] = useState('hi');

  useEffect(() => {
    setLang(localStorage.getItem('kisanseva_admin_lang') || 'hi');
  }, []);

  const t = adminTranslations[lang] || adminTranslations['en'];
  const isEn = lang === 'en'; // kept for the logout fallback below, but we can use t.logout

  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: t.dashboard },
    { href: '/admin/tokens', icon: Ticket, label: isEn ? 'Tokens' : 'टोकन' },
    { href: '/admin/farmers', icon: QrCode, label: isEn ? 'Verify Farmer' : 'किसान सत्यापन' },
    { href: '/admin/centres', icon: Building2, label: t.centres_monitor },
    { href: '/admin/map', icon: Map, label: t.live_map },
    { href: '/admin/predictions', icon: Brain, label: t.ai_predictions },
    { href: '/admin/anomalies', icon: AlertTriangle, label: t.anomalies },
    { href: '/admin/locations', icon: MapPin, label: isEn ? 'Locations' : 'स्थान' },
  ];

  return (
    <aside className="admin-sidebar" style={{ width: '240px', minHeight: '100vh', background: '#1A2E1A', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>KisanSeva</span>
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t.govt_dashboard}</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                background: active ? 'rgba(42,122,59,0.3)' : 'transparent',
                borderLeft: `4px solid ${active ? '#2A7A3B' : 'transparent'}`,
                color: active ? 'white' : '#D1D5DB',
                transition: 'all 0.2s'
              }}>
                <link.icon size={20} />
                <span style={{ fontSize: '15px', fontWeight: active ? '600' : '400' }}>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>🌐 Language / भाषा</div>
          <select 
            value={lang}
            onChange={(e) => {
              localStorage.setItem('kisanseva_admin_lang', e.target.value);
              window.location.reload();
            }}
            style={{ 
              background: 'transparent', border: 'none', color: 'white', 
              width: '100%', fontSize: '14px', outline: 'none', cursor: 'pointer' 
            }}
          >
            <option value="en" style={{ color: 'black' }}>English</option>
            <option value="hi" style={{ color: 'black' }}>हिन्दी (Hindi)</option>
            <option value="pa" style={{ color: 'black' }}>ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="mr" style={{ color: 'black' }}>मराठी (Marathi)</option>
          </select>
        </div>

        <button 
          onClick={() => { 
            localStorage.removeItem('kisanseva_admin_token'); 
            localStorage.removeItem('kisanseva_admin_lang');
            window.location.href = '/admin/login'; 
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FCA5A5', cursor: 'pointer', padding: '4px 12px' }}>
            <LogOut size={20} />
            <span style={{ fontSize: '15px' }}>{isEn ? 'Logout' : 'लॉग आउट'}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
