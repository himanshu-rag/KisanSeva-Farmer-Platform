'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

const MSP: Record<number, number> = { 1: 2275, 2: 2183, 3: 5650, 4: 2090, 5: 1735, 6: 7020, 7: 6400 };

export default function BookPage() {
  const router = useRouter();
  const { isEn } = useFarmerLang();
  const [step, setStep] = useState<1|2|3|'confirm'|'success'>(1);

  // Fetched data
  const [allCrops, setAllCrops] = useState<any[]>([]);
  const [allCentres, setAllCentres] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Selected values
  const [crop, setCrop] = useState<any>(null);
  const [qty, setQty] = useState(50);
  const [centre, setCentre] = useState<any>(null);
  const [slot, setSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('kisanseva_token') : null;

  // Load crops and centres on mount
  useEffect(() => {
    fetch('/api/crops').then(r => r.json()).then(d => { if (d.success) setAllCrops(d.data); }).catch(() => {
      // fallback crops if API fails
      setAllCrops([
        { id: 1, name_en: 'Wheat', name_hi: 'गेहूँ', emoji: '🌾' },
        { id: 2, name_en: 'Paddy', name_hi: 'धान', emoji: '🌾' },
        { id: 3, name_en: 'Mustard', name_hi: 'सरसों', emoji: '🌿' },
        { id: 4, name_en: 'Maize', name_hi: 'मक्का', emoji: '🌽' },
      ]);
    });
    fetch('/api/centres').then(r => r.json()).then(d => { if (d.success) setAllCentres(d.data); }).catch(() => {});
  }, []);

  // Load slots when centre selected
  useEffect(() => {
    if (!centre) return;
    setFetchingSlots(true);
    const today = new Date().toISOString().split('T')[0];
    fetch('/api/centres/' + centre.id + '/slots?date=' + today)
      .then(r => r.json())
      .then(d => { if (d.success) setAllSlots(d.data); })
      .catch(() => {})
      .finally(() => setFetchingSlots(false));
  }, [centre]);

  const confirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('kisanseva_token');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ centreId: centre?.id, slotId: slot?.id, cropId: crop?.id, quantity: qty }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.token?.tokenNo) setGeneratedToken(data.token.tokenNo);
        else if (data.tokenNo) setGeneratedToken(data.tokenNo);
        setStep('success');
      } else {
        alert(isEn ? 'Failed to book slot: ' + data.error : 'स्लॉट बुक करने में विफल: ' + data.error);
      }
    } catch (e) {
      alert(isEn ? 'Network error. Please try again.' : 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
    }
    setLoading(false);
  };

  const slotStatusColor = (s: any, selected: boolean) => {
    if (selected) return { bg: '#2A7A3B', color: 'white', border: '#2A7A3B' };
    if (s.status === 'full') return { bg: '#F9FAFB', color: '#9CA3AF', border: '#E5E7EB' };
    if (s.status === 'recommended') return { bg: '#E8F5EC', color: '#1A2E1A', border: '#2A7A3B' };
    return { bg: 'white', color: '#1A2E1A', border: '#E5E7EB' };
  };

  const cropName = (c: any) => isEn ? c.name_en : c.name_hi;
  const centreName = (c: any) => isEn ? (c.nameEn || c.name) : c.name;
  const earnings = crop?.id ? (MSP[crop.id] || 0) * qty : 0;

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'white', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => step === 1 ? router.back() : setStep(s => typeof s === 'number' ? Math.max(1, s - 1) as any : 'confirm')} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} color="#374151" />
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A2E1A', margin: 0 }}>{isEn ? 'Book a Slot' : 'स्लॉट बुक करें'}</h1>
          {step !== 'success' && <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>{isEn ? `Step ${typeof step === 'number' ? step : 4} of 4` : `चरण ${typeof step === 'number' ? step : 4} / 4`}</p>}
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Step 1: Crop */}
        {step === 1 && <>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '6px' }}>{isEn ? 'Select Crop' : 'फसल चुनें'}</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>{isEn ? 'Step 1/4 — Which crop are you selling today?' : 'चरण 1/4 — आज कौन सी फसल बेच रहे हैं?'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {(allCrops.length ? allCrops : [{id:1,name_en:'Wheat',name_hi:'गेहूँ',emoji:'🌾'},{id:2,name_en:'Paddy',name_hi:'धान',emoji:'🌾'},{id:3,name_en:'Mustard',name_hi:'सरसों',emoji:'🌿'},{id:4,name_en:'Maize',name_hi:'मक्का',emoji:'🌽'}]).map((c: any) => (
              <button key={c.id} onClick={() => { setCrop(c); }}
                style={{ background: crop?.id === c.id ? '#2A7A3B' : 'white', color: crop?.id === c.id ? 'white' : '#1A2E1A', border: '2px solid ' + (crop?.id === c.id ? '#2A7A3B' : '#E5E7EB'), borderRadius: '16px', padding: '20px 12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>{c.emoji}</span>
                <span>{cropName(c)}</span>
                {MSP[c.id] && <span style={{ fontSize: '12px', opacity: 0.8 }}>₹{MSP[c.id].toLocaleString('en-IN')}/Qt</span>}
              </button>
            ))}
          </div>

          {crop && <>
            <div className="farmer-card" style={{ marginBottom: '16px', background: '#E8F5EC', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '13px', color: '#047857', fontWeight: '600', marginBottom: '8px' }}>{isEn ? 'Quantity (Quintals)' : 'मात्रा (क्विंटल)'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 5))} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #2A7A3B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={18} color="#2A7A3B" /></button>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#2A7A3B' }}>{qty}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Quintals' : 'क्विंटल'}</div>
                </div>
                <button onClick={() => setQty(q => Math.min(999, q + 5))} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A7A3B', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} color="white" /></button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px', padding: '8px', background: 'white', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>{isEn ? 'Est. Earnings: ' : 'अनुमानित कमाई: '}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#2A7A3B' }}>₹{earnings.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="btn-farmer-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>{isEn ? 'Next →' : 'आगे →'}</button>
          </>}
        </>}

        {/* Step 2: Centre */}
        {step === 2 && <>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '6px' }}>{isEn ? 'Choose Centre' : 'केंद्र चुनें'}</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>{isEn ? 'Step 2/4 — Select a procurement centre' : 'चरण 2/4 — खरीद केंद्र चुनें'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(allCentres.length ? allCentres : [{id:1,name:'करनाल मंडी',nameEn:'Karnal Mandi',district:'Karnal',crowd:'low',slots:8},{id:2,name:'पानीपत मंडी',nameEn:'Panipat Mandi',district:'Panipat',crowd:'high',slots:4}]).map((c: any) => {
              const crowdColor = c.crowd === 'high' ? '#DC2626' : c.crowd === 'medium' ? '#D97706' : '#16A34A';
              const crowdLabel = c.crowd === 'high' ? (isEn ? '🔴 High Crowd' : '🔴 ज्यादा भीड़') : c.crowd === 'medium' ? (isEn ? '🟡 Med Crowd' : '🟡 थोड़ी भीड़') : (isEn ? '🟢 Low Crowd' : '🟢 कम भीड़');
              return (
                <div key={c.id} className="farmer-card" onClick={() => { setCentre(c); setSlot(null); setTimeout(() => setStep(3), 200); }}
                  style={{ cursor: 'pointer', borderLeft: '4px solid ' + crowdColor }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '17px', fontWeight: '700' }}>{centreName(c)}</div>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{c.dist || c.district}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>{c.crowdLabel || crowdLabel}</span>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>{c.slots || '—'} {isEn ? 'slots' : 'स्लॉट'}</span>
                  </div>
                  {c.crowd === 'high' && <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px' }}>⚡ AI: {isEn ? 'Less crowd after 2 PM' : 'दोपहर 2 बजे के बाद कम भीड़'}</div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* Step 3: Slot */}
        {step === 3 && <>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '6px' }}>{isEn ? 'Choose Time' : 'समय चुनें'}</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>{isEn ? 'Step 3/4 — ' + (centre ? centreName(centre) : '') : 'चरण 3/4 — ' + (centre ? centreName(centre) : '')}</p>
          {fetchingSlots ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>{isEn ? 'Loading slots...' : 'स्लॉट लोड हो रहे हैं...'}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {allSlots.map((s: any) => {
                const sel = slot?.id === s.id;
                const { bg, color, border } = slotStatusColor(s, sel);
                return (
                  <div key={s.id} onClick={() => s.status !== 'full' && setSlot(s)}
                    style={{ background: bg, color, border: '2px solid ' + border, borderRadius: '12px', padding: '14px', cursor: s.status === 'full' ? 'not-allowed' : 'pointer', opacity: s.status === 'full' ? 0.5 : 1 }}>
                    {s.status === 'recommended' && <div style={{ fontSize: '11px', color: sel ? 'rgba(255,255,255,0.9)' : '#2A7A3B', fontWeight: '700', marginBottom: '2px' }}>⭐ AI</div>}
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>{s.label}</div>
                    {s.status === 'full' && <div style={{ fontSize: '12px', marginTop: '2px' }}>{isEn ? 'Full' : 'भरा'}</div>}
                    {s.status === 'recommended' && <div style={{ fontSize: '12px', marginTop: '2px', color: sel ? 'rgba(255,255,255,0.8)' : '#16A34A' }}>~{s.wait} {isEn ? 'min wait' : 'मिनट'}</div>}
                    <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.7 }}>{s.booked}/{s.cap} {isEn ? 'booked' : 'बुक्ड'}</div>
                  </div>
                );
              })}
            </div>
          )}
          {allSlots.length > 0 && <button className="btn-farmer-primary" style={{ width: '100%' }} onClick={() => setStep('confirm')} disabled={!slot}>{isEn ? 'Review Booking →' : 'बुकिंग देखें →'}</button>}
        </>}

        {/* Confirm */}
        {step === 'confirm' && <>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '20px' }}>{isEn ? 'Review Booking' : 'बुकिंग की जाँच करें'}</h2>
          <div className="farmer-card" style={{ marginBottom: '16px' }}>
            {[
              [isEn ? '🌾 Crop' : '🌾 फसल', crop ? cropName(crop) : '—'],
              [isEn ? '🏛️ Centre' : '🏛️ केंद्र', centre ? centreName(centre) : '—'],
              [isEn ? '⏰ Time' : '⏰ समय', slot?.label || '—'],
              [isEn ? '⚖️ Qty' : '⚖️ मात्रा', isEn ? qty + ' Quintal' : qty + ' क्विंटल'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: '15px' }}>
                <span style={{ color: '#6B7280' }}>{k}</span><span style={{ fontWeight: '600' }}>{v}</span>
              </div>
            ))}
          </div>
          {earnings > 0 && (
            <div style={{ background: '#E8F5EC', border: '1px solid #A7F3D0', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#047857', fontWeight: '600' }}>💰 {isEn ? 'Est. MSP Earnings' : 'अनुमानित MSP कमाई'}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{qty} Qt × ₹{(MSP[crop?.id] || 0).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#2A7A3B' }}>₹{earnings.toLocaleString('en-IN')}</div>
            </div>
          )}
          <button className="btn-farmer-primary" style={{ width: '100%' }} onClick={confirm} disabled={loading}>
            {loading ? (isEn ? 'Booking...' : 'बुक हो रहा है...') : (isEn ? '✅ Confirm & Book' : '✅ पक्का करें और बुक करें')}
          </button>
        </>}

        {/* Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#2A7A3B', marginBottom: '8px' }}>{isEn ? 'Booking Confirmed!' : 'बुकिंग पक्की हो गई!'}</h2>
            <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '8px' }}>
              {isEn ? 'Your Token: ' : 'आपका टोकन: '}<strong style={{ color: '#2A7A3B', fontSize: '24px' }}>{generatedToken || '—'}</strong>
            </p>
            <p style={{ color: '#9CA3AF', marginBottom: '32px', fontSize: '14px' }}>{isEn ? 'You will also receive an SMS confirmation.' : 'आपको SMS से भी पुष्टि मिलेगी।'}</p>
            <button className="btn-farmer-primary" onClick={() => router.push('/farmer/token')}>🎫 {isEn ? 'View My Token' : 'टोकन देखें'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
