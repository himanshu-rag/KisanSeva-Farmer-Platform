'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

interface ActiveToken {
  id: number;
  tokenNo: string;
  centre: string;
  slot: string;
  ahead?: number;
}

export default function TokenPage() {
  const router = useRouter();
  const { isEn } = useFarmerLang();
  const [ahead, setAhead] = useState(12);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [showOperator, setShowOperator] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [activeToken, setActiveToken] = useState<ActiveToken | null>(null);
  const [tokenStatus, setTokenStatus] = useState('BOOKED');
  const [loading, setLoading] = useState(true);
  const [noToken, setNoToken] = useState(false);

  const STATUS_ORDER = ['BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED', 'PROCURED', 'PAID'];
  
  const steps = [
    { key: 'BOOKED', label: isEn ? 'Booking Confirmed' : 'बुकिंग पक्की' },
    { key: 'ARRIVED', label: isEn ? 'Reach the Centre' : 'केंद्र पर पहुँचें' },
    { key: 'VERIFIED', label: isEn ? 'Document Check' : 'दस्तावेज़ जाँच' },
    { key: 'WEIGHED', label: isEn ? 'Crop Weighing' : 'फसल तौल' },
    { key: 'PROCURED', label: isEn ? 'Procurement' : 'खरीद' },
    { key: 'PAID', label: isEn ? 'Payment' : 'भुगतान' },
  ].map(s => {
    const stepIdx = STATUS_ORDER.indexOf(s.key);
    const curIdx = STATUS_ORDER.indexOf(tokenStatus);
    return { ...s, done: stepIdx < curIdx, active: stepIdx === curIdx };
  });

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setNoToken(true); setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: 'Bearer ' + jwtToken } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.activeToken) {
          const t = d.data.activeToken;
          setActiveToken({ id: t.id, tokenNo: t.tokenNo, centre: t.centre, slot: t.slot });
          setTokenStatus(t.status || 'BOOKED');
          setAhead(t.ahead || 12);
        } else {
          setNoToken(true);
        }
      })
      .catch(() => setNoToken(true))
      .finally(() => setLoading(false));

    const interval = setInterval(() => setLastUpdate(t => t + 10), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      if (activeToken?.id) {
        const res = await fetch('/api/bookings/' + activeToken.id, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + localStorage.getItem('kisanseva_token') }
        });
        const data = await res.json();
        if (!data.success) {
          alert(isEn ? 'Failed to cancel: ' + data.error : 'रद्द करने में विफल: ' + data.error);
          setCancelling(false);
          setShowCancelModal(false);
          return;
        }
      }
    } catch {
      alert(isEn ? 'Network error. Please try again.' : 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
      setCancelling(false);
      setShowCancelModal(false);
      return;
    }
    setCancelling(false);
    setCancelled(true);
    setShowCancelModal(false);
    setTimeout(() => router.push('/farmer/home'), 2000);
  };

  const formatSlot = (slot: string) => {
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

  if (loading) return (
    <div style={{ padding: '24px' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: '16px' }} />)}
    </div>
  );

  if (noToken || cancelled) return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', paddingBottom: '90px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{cancelled ? '✅' : '🎫'}</div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px', textAlign: 'center' }}>
        {cancelled ? (isEn ? 'Booking Cancelled' : 'बुकिंग रद्द हो गई') : (isEn ? 'No Active Token' : 'कोई सक्रिय टोकन नहीं')}
      </h2>
      <p style={{ color: '#6B7280', marginBottom: '32px', textAlign: 'center' }}>
        {cancelled ? (isEn ? 'Redirecting to home...' : 'होम पर जा रहे हैं...') : (isEn ? 'You have no active booking. Book a slot to get a token.' : 'आपकी कोई सक्रिय बुकिंग नहीं है। टोकन पाने के लिए स्लॉट बुक करें।')}
      </p>
      {!cancelled && (
        <button className="btn-farmer-primary" onClick={() => router.push('/farmer/book')}>
          {isEn ? '📋 Book a Slot' : '📋 स्लॉट बुक करें'}
        </button>
      )}
    </div>
  );

  const tokenNo = activeToken?.tokenNo || '—';
  const centre = activeToken?.centre || '—';
  const slot = activeToken?.slot ? formatSlot(activeToken.slot) : '—';
  const todayStr = new Date().toLocaleDateString(isEn ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' });
  const serving = Math.max(100, parseInt(tokenNo.replace(/\D/g,'') || '100') - ahead - 1);

  return (
    <div style={{ background: '#FDFCF7', paddingBottom: '90px', minHeight: '100dvh' }}>
      {showOperator && (
        <div style={{ position: 'fixed', inset: 0, background: '#2A7A3B', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setShowOperator(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} color="white" />
          </button>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px' }}>{isEn ? 'Show this to the operator' : 'ऑपरेटर को दिखाएँ'}</div>
          <div style={{ color: 'white', fontSize: '120px', fontWeight: '900', lineHeight: 1, letterSpacing: '-4px' }}>{tokenNo}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22px', marginTop: '20px' }}>{centre}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginTop: '8px' }}>{slot}</div>
        </div>
      )}

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '20px' }}>🎫 {isEn ? 'My Token' : 'मेरा टोकन'}</h1>

        <div className="farmer-card" style={{ textAlign: 'center', marginBottom: '16px', padding: '32px 20px' }}>
          <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>{isEn ? 'Token Number' : 'टोकन नंबर'}</div>
          <div style={{ fontSize: '80px', fontWeight: '900', color: '#2A7A3B', lineHeight: 1, letterSpacing: '-4px' }}>{tokenNo}</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A2E1A', marginTop: '12px' }}>{centre}</div>
          <div style={{ fontSize: '15px', color: '#6B7280', marginTop: '4px' }}>{todayStr} · {slot}</div>
        </div>

        <div className="farmer-card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>{isEn ? 'Currently serving:' : 'अभी सेवा हो रही है:'} <strong style={{ color: '#2A7A3B' }}>A{serving}</strong></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '56px', fontWeight: '800', color: '#2A7A3B', lineHeight: 1 }}>{ahead}</span>
            <span style={{ fontSize: '18px', color: '#374151' }}>{isEn ? 'farmers ahead' : 'किसान आगे हैं'}</span>
          </div>
          <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ height: '100%', background: '#2A7A3B', borderRadius: '4px', width: Math.max(5, ((25 - ahead) / 25) * 100) + '%', transition: 'width 0.5s' }} />
          </div>
          <div style={{ fontSize: '15px', color: '#374151' }}>⏱ {isEn ? 'Estimated wait:' : 'अनुमानित प्रतीक्षा:'} <strong>~{ahead * 2} {isEn ? 'mins' : 'मिनट'}</strong></div>
        </div>

        <div style={{ background: '#E8F5EC', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📍</span>
          <div>
            <div style={{ fontSize: '14px', color: '#065F46' }}>{isEn ? 'Suggested Arrival' : 'सुझाया गया आगमन'}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#2A7A3B' }}>
              {isEn ? 'Arrive by ' + (slot.split('–')[0]?.trim() || '10:00 AM') : (slot.split('–')[0]?.trim() || '10:00 AM') + ' तक पहुँचें'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '16px' }}>{isEn ? 'Process Status' : 'प्रक्रिया की स्थिति'}</div>
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < steps.length - 1 ? '8px' : '0' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.done ? '#16A34A' : s.active ? '#2A7A3B' : '#E5E7EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                {s.done ? '✓' : s.active ? '●' : '○'}
              </div>
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div style={{ fontSize: '16px', fontWeight: s.active ? '700' : '500', color: s.done ? '#16A34A' : s.active ? '#2A7A3B' : '#9CA3AF' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-farmer-secondary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => setShowOperator(true)}>
          📱 {isEn ? 'Show to Operator' : 'ऑपरेटर को दिखाएँ'}
        </button>
        <button onClick={() => setShowCancelModal(true)} style={{ width: '100%', background: 'transparent', border: '1.5px solid #FCA5A5', borderRadius: '12px', padding: '14px', color: '#DC2626', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          🗑️ {isEn ? 'Cancel Booking' : 'बुकिंग रद्द करें'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginTop: '12px' }}>
          {lastUpdate === 0 ? (isEn ? 'Just updated' : 'अभी अपडेट हुआ') : (isEn ? 'Updated ' + lastUpdate + 's ago' : lastUpdate + ' सेकंड पहले अपडेट हुआ')}
        </div>
      </div>

      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '32px 24px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ background: '#FEF2F2', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <AlertTriangle size={32} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1A2E1A', margin: '0 0 8px' }}>{isEn ? 'Cancel Booking?' : 'बुकिंग रद्द करें?'}</h3>
              <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
                {isEn ? 'Token ' : 'टोकन '}<strong style={{ color: '#2A7A3B' }}>{tokenNo}</strong> {isEn ? 'will be cancelled.' : 'रद्द हो जाएगा।'}<br />
                {centre} · {slot}
              </p>
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#92400E' }}>
              ⚠️ {isEn ? 'You will need to book again. Finding a slot today might be difficult.' : 'रद्द करने के बाद दोबारा बुकिंग करनी होगी। आज का स्लॉट मिलना मुश्किल हो सकता है।'}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                {isEn ? 'Go Back' : 'वापस जाएँ'}
              </button>
              <button onClick={handleCancel} disabled={cancelling} style={{ flex: 1, background: '#DC2626', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '600', color: 'white', cursor: 'pointer', opacity: cancelling ? 0.7 : 1 }}>
                {cancelling ? (isEn ? 'Cancelling...' : 'रद्द हो रहा है...') : (isEn ? 'Yes, Cancel' : 'हाँ, रद्द करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
