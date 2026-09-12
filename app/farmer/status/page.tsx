'use client';
import { useEffect, useState } from 'react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';
import { useRouter } from 'next/navigation';

export default function StatusPage() {
  const { isEn } = useFarmerLang();
  const router = useRouter();
  const [activeToken, setActiveToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const steps = [
    { label: isEn ? 'Booking Confirmed' : 'बुकिंग पक्की', sub: isEn ? 'Done' : 'पूरा', state: 'done' },
    { label: isEn ? 'Reach the Centre' : 'केंद्र पर पहुँचें', sub: isEn ? 'Next step' : 'अगला कदम', state: 'active' },
    { label: isEn ? 'Document Verified' : 'दस्तावेज़ जाँच', sub: '', state: 'pending' },
    { label: isEn ? 'Crop Weighed' : 'फसल तौल', sub: '', state: 'pending' },
    { label: isEn ? 'Procurement' : 'खरीद', sub: '', state: 'pending' },
    { label: isEn ? 'Payment Complete' : 'भुगतान पूरा', sub: '', state: 'pending' },
  ];

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: 'Bearer ' + jwtToken } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.activeToken) setActiveToken(d.data.activeToken);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatSlot = (slot: string) => {
    if (!slot) return '—';
    try {
      const [start, end] = slot.split('–');
      const fmt = (t: string) => {
        const [h, m] = t.trim().split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return h12 + ':' + m.toString().padStart(2,'0') + ' ' + ampm;
      };
      return fmt(start) + ' – ' + fmt(end);
    } catch { return slot; }
  };

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '16px' }}>📋 {isEn ? 'My Sale Status' : 'मेरी खरीद की स्थिति'}</h1>

        {loading ? (
          <div className="skeleton" style={{ height: '120px', borderRadius: '16px', marginBottom: '20px' }} />
        ) : activeToken ? (
          <div className="farmer-card" style={{ marginBottom: '20px' }}>
            {[
              [isEn ? '🎫 Token' : '🎫 टोकन', activeToken.tokenNo],
              [isEn ? '🏛️ Centre' : '🏛️ केंद्र', activeToken.centre],
              [isEn ? '⏰ Slot' : '⏰ स्लॉट', formatSlot(activeToken.slot)],
              [isEn ? '⏳ Queue' : '⏳ कतार', (activeToken.ahead || 12) + ' ' + (isEn ? 'farmers ahead' : 'किसान आगे')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: '15px' }}>
                <span style={{ color: '#6B7280' }}>{k}</span><span style={{ fontWeight: '600' }}>{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎫</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'No Active Booking' : 'कोई सक्रिय बुकिंग नहीं'}</div>
            <div style={{ color: '#6B7280', marginBottom: '20px', fontSize: '15px' }}>{isEn ? 'Book a slot to track your sale status.' : 'अपनी बिक्री की स्थिति ट्रैक करने के लिए स्लॉट बुक करें।'}</div>
            <button className="btn-farmer-primary" onClick={() => router.push('/farmer/book')}>{isEn ? '📋 Book Now' : '📋 अभी बुक करें'}</button>
          </div>
        )}

        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '16px' }}>{isEn ? 'Process Timeline' : 'प्रक्रिया टाइमलाइन'}</div>
        <div style={{ paddingLeft: '8px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '8px', position: 'relative' }}>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', left: '13px', top: '28px', width: '2px', height: '28px', background: s.state === 'done' ? '#16A34A' : '#E5E7EB' }} />
              )}
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', background: s.state === 'done' ? '#16A34A' : s.state === 'active' ? '#2A7A3B' : '#E5E7EB', color: s.state === 'pending' ? '#9CA3AF' : 'white' }}>
                {s.state === 'done' ? '✓' : s.state === 'active' ? '●' : '○'}
              </div>
              <div style={{ paddingTop: '4px', paddingBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: s.state === 'active' ? '700' : '500', color: s.state === 'done' ? '#16A34A' : s.state === 'active' ? '#2A7A3B' : '#9CA3AF' }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: '13px', color: '#9CA3AF' }}>{s.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
