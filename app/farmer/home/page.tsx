'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Building2, ClipboardList, Wallet, Mic } from 'lucide-react';
import WeatherWidget from '@/components/farmer/WeatherWidget';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

interface TokenData {
  tokenNo: string; centre: string; slot: string; ahead: number; wait: number;
}
interface FarmerData { name: string; }

const MOCK_TOKEN: TokenData | null = null; // No mock — use real data
const MOCK_FARMER: FarmerData = { name: '' };

export default function HomePage() {
  const { isEn } = useFarmerLang();
  const [farmer, setFarmer] = useState<FarmerData>(MOCK_FARMER);
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { icon: Building2, label: isEn ? 'Find Centre' : 'केंद्र खोजें', href: '/farmer/book', color: '#E8F5EC', iconColor: '#2A7A3B' },
    { icon: ClipboardList, label: isEn ? 'My Sales' : 'मेरी खरीद', href: '/farmer/status', color: '#EFF6FF', iconColor: '#2563EB' },
    { icon: Wallet, label: isEn ? 'Payments' : 'भुगतान', href: '/farmer/payment', color: '#FEF3C7', iconColor: '#D97706' },
    { icon: Mic, label: isEn ? 'Assistant' : 'सहायक', href: '/farmer/help', color: '#FDF2F8', iconColor: '#9333EA' },
  ];

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: `Bearer ${jwtToken}` } })
      .then(r => r.json()).then(d => { if (d.success) { setFarmer(d.data.farmer); if (d.data.activeToken) setToken(d.data.activeToken); } })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '24px' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: '16px' }} />)}
    </div>
  );

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#2A7A3B' }}>KisanSeva</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/farmer/profile">
            <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
            </div>
          </Link>
          <Link href="/farmer/notifications">
            <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
              <Bell size={22} color="#374151" />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', border: '2px solid white' }} />
            </div>
          </Link>
        </div>
      </div>

      <div className="px-[20px] pb-[24px] md:px-[40px] md:py-[32px] max-w-[1200px] mx-auto">
        {/* Greeting */}
        <h1 className="text-[26px] md:text-[36px] font-bold text-[#1A2E1A] mb-[16px] md:mb-[24px]">
          {isEn ? `Hello, ${farmer.name || '...'} 🙏` : `नमस्ते, ${farmer.name || '...'} 🙏`}
        </h1>

        {/* Live Weather — auto-detects nearest Mandi */}
        <div style={{ marginBottom: '20px' }}>
          <WeatherWidget centreId={token ? '1' : '1'} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-[20px] md:mb-[40px]">
          {/* Token card or CTA */}
          {token ? (
            <div className="farmer-card h-full flex flex-col justify-between" style={{ borderLeft: '4px solid #2A7A3B' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>{isEn ? 'Your Token' : 'आपका टोकन'}</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#2A7A3B', lineHeight: 1 }}>{token.tokenNo}</div>
                  </div>
                  <span className="badge-green">{isEn ? 'Active' : 'सक्रिय'}</span>
                </div>
                <div style={{ fontSize: '15px', color: '#374151', marginBottom: '4px' }}>🏛️ {token.centre}</div>
                <div style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>⏰ {isEn ? `Today ${token.slot}` : `आज ${token.slot}`}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '15px', color: '#374151' }}>
                    ⏳ <strong>{token.ahead}</strong> {isEn ? 'farmers ahead' : 'किसान आगे हैं'} &nbsp;·&nbsp; ~<strong>{token.wait}</strong> {isEn ? 'mins' : 'मिनट'}
                  </div>
                </div>
              </div>
              <Link href="/farmer/token">
                <button className="btn-farmer-secondary" style={{ width: '100%' }}>{isEn ? 'View Queue →' : 'Queue देखें →'}</button>
              </Link>
            </div>
          ) : (
            <Link href="/farmer/book" style={{ textDecoration: 'none' }}>
              <div className="farmer-card-primary h-full flex flex-col justify-between" style={{ cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>{isEn ? 'Book Now' : 'अभी बुक करें'}</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{isEn ? '📋 Book slot to sell crop' : '📋 फसल बेचने का समय बुक करें'}</div>
                  <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>{isEn ? 'Choose centre and time' : 'केंद्र और समय चुनें'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '600' }}>
                  {isEn ? 'Start Booking' : 'बुकिंग शुरू करें'} <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          )}

          {/* AI Alert */}
          <div className="farmer-card-alert h-full">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400E', marginBottom: '8px' }}>
                  {isEn ? 'High crowd at Panipat Mandi today' : 'आज Panipat Mandi पर भीड़ ज्यादा है'}
                </div>
                <div style={{ fontSize: '15px', color: '#B45309', marginBottom: '16px', lineHeight: 1.5 }}>
                  {isEn ? 'AI suggests arriving after 2 PM for a shorter wait time.' : 'AI के अनुसार दोपहर 2 बजे के बाद आने पर आपको कम इंतज़ार करना पड़ेगा।'}
                </div>
                <Link href="/farmer/book">
                  <span style={{ fontSize: '15px', color: '#2A7A3B', fontWeight: '600', textDecoration: 'underline' }}>
                    {isEn ? 'View better times →' : 'बेहतर समय देखें →'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[17px] font-semibold text-[#1A2E1A] mb-[14px] md:text-2xl md:mb-6">{isEn ? 'Quick Actions' : 'त्वरित कार्य (Quick Actions)'}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {quickActions.map(({ icon: Icon, label, href, color, iconColor }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div className="quick-action-card hover:scale-105 transition-transform" style={{ height: '100%', padding: '24px' }}>
                <div style={{ width: '64px', height: '64px', background: color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={32} color={iconColor} />
                </div>
                <span className="text-[15px] md:text-[18px]" style={{ fontWeight: '600', color: '#1A2E1A' }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
