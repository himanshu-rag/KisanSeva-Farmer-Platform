'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

const crops = [
  { id: 'wheat', emoji: '🌾', hi: 'गेहूँ', en: 'Wheat' },
  { id: 'paddy', emoji: '🌾', hi: 'धान', en: 'Paddy' },
  { id: 'mustard', emoji: '🌿', hi: 'सरसों', en: 'Mustard' },
  { id: 'maize', emoji: '🌽', hi: 'मक्का', en: 'Maize' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { isEn } = useFarmerLang();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(d => { if(d.success) setLocations(d.data); }).catch(()=>{});
  }, []);
  const [village, setVillage] = useState('');
  const [crop, setCrop] = useState('');
  const [qty, setQty] = useState(50);
  const [farmerId, setFarmerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const next = () => setStep(s => Math.min(s + 1, 6));
  const back = () => { if (step > 1) setStep(s => s - 1); else router.back(); };

  const submit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('kisanseva_token');
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, village, state: selectedState, district: selectedDistrict, mainCrop: crop, typicalYield: qty, govtId: farmerId })
      });
      const data = await res.json();
      if (data.success) {
        setStep(6);
        setTimeout(() => router.push('/farmer/home'), 2000);
      } else {
        alert('Registration failed: ' + (data.error || 'Please try again'));
        setLoading(false);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      
      {step < 6 && (
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={24} color="#1A2E1A" />
            </button>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{isEn ? `Step ${step} / 5` : `चरण ${step} / 5`}</span>
          </div>
          <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#2A7A3B', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Your Full Name?' : 'आपका पूरा नाम?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>What is your name?</p>
            <input
              autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={isEn ? "e.g., Ramesh Kumar" : "जैसे: रमेश कुमार"}
              style={{ width: '100%', fontSize: '22px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', color: '#1A2E1A', background: 'white', marginBottom: '24px' }}
              onFocus={e => e.target.style.borderColor = '#2A7A3B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button className="btn-farmer-primary" onClick={next} disabled={!name.trim()}>{isEn ? 'Next →' : 'आगे →'}</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Your Location?' : 'आपका स्थान?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '16px' }}>{isEn ? 'Where is your farm?' : 'आपका खेत कहाँ है?'}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setVillage(''); }} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select State --' : '-- राज्य चुनें --'}</option>
                {Array.from(new Set(locations.map(l => l.state))).map((s: any) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select disabled={!selectedState} value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setVillage(''); }} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: !selectedState ? '#F3F4F6' : 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select District --' : '-- जिला चुनें --'}</option>
                {Array.from(new Set(locations.filter(l => l.state === selectedState).map(l => l.district))).map((d: any) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select disabled={!selectedDistrict} value={village} onChange={e => setVillage(e.target.value)} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: !selectedDistrict ? '#F3F4F6' : 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select Village --' : '-- गाँव चुनें --'}</option>
                {locations.filter(l => l.state === selectedState && l.district === selectedDistrict).map((v: any) => <option key={v.village} value={v.village}>{v.village}</option>)}
              </select>
            </div>

            <button className="btn-farmer-primary" onClick={next} disabled={!village.trim()}>{isEn ? 'Next →' : 'आगे →'}</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Your Main Crop?' : 'आपकी मुख्य फसल?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>Your main crop</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {crops.map(c => (
                <button key={c.id} onClick={() => { setCrop(c.id); setTimeout(next, 300); }}
                  style={{ background: crop === c.id ? '#2A7A3B' : 'white', color: crop === c.id ? 'white' : '#1A2E1A', border: `2px solid ${crop === c.id ? '#2A7A3B' : '#E5E7EB'}`, borderRadius: '16px', padding: '24px 16px', fontSize: '20px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '40px' }}>{c.emoji}</span>
                  <span>{isEn ? c.en : c.hi}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'How much crop?' : 'कितनी फसल है?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>How many quintals?</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 5))}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#E8F5EC', border: '2px solid #2A7A3B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={24} color="#2A7A3B" />
              </button>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '56px', fontWeight: '800', color: '#2A7A3B' }}>{qty}</span>
                <div style={{ fontSize: '18px', color: '#6B7280' }}>{isEn ? 'Quintal' : 'क्विंटल'}</div>
              </div>
              <button onClick={() => setQty(q => q + 5)}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#2A7A3B', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={24} color="white" />
              </button>
            </div>
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>{isEn ? '1 Quintal = 100 kg' : '1 क्विंटल = 100 किलो'}</div>
            <button className="btn-farmer-primary" onClick={next}>{isEn ? 'Next →' : 'आगे →'}</button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>
              {isEn ? 'Government Verification' : 'सरकारी सत्यापन'}
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
              {isEn ? 'Enter your Aadhaar or PM-Kisan ID to verify your identity with Govt. of India.' : 'भारत सरकार से पहचान सत्यापित करने के लिए अपना आधार या PM-Kisan ID डालें।'}
            </p>

            {!verified && (
              <>
                <input
                  type="text" value={farmerId} onChange={e => setFarmerId(e.target.value)}
                  placeholder={isEn ? "e.g., AADHAAR / PM-KISAN ID" : "जैसे: आधार / PM-Kisan ID"}
                  style={{ width: '100%', fontSize: '20px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', color: '#1A2E1A', background: 'white', marginBottom: '16px' }}
                />
                
                <button 
                  className="btn-farmer-primary" 
                  onClick={async () => {
                    setVerifying(true);
                    // Simulate API call to govt DB
                    await new Promise(r => setTimeout(r, 2000));
                    setVerifying(false);
                    setVerified(true);
                  }} 
                  disabled={verifying || !farmerId.trim()} 
                  style={{ marginBottom: '12px', width: '100%', background: verifying ? '#9CA3AF' : '#2A7A3B', borderColor: verifying ? '#9CA3AF' : '#2A7A3B' }}
                >
                  {verifying ? (isEn ? 'Verifying with Govt Database...' : 'सरकारी डेटाबेस से जाँच हो रही है...') : (isEn ? 'Verify Document ✓' : 'दस्तावेज़ सत्यापित करें ✓')}
                </button>
                
                <button className="btn-farmer-ghost" onClick={() => { setFarmerId(''); submit(); }} style={{ width: '100%' }}>
                  {isEn ? 'Skip — Do this later' : 'अभी नहीं — बाद में करें'}
                </button>
              </>
            )}

            {verified && (
              <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                   <Check size={32} color="#16A34A" strokeWidth={3} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#16A34A', marginBottom: '8px' }}>
                  {isEn ? 'Government ID Verified!' : 'सरकारी ID सत्यापित!'}
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                  {isEn ? 'Your identity has been confirmed.' : 'आपकी पहचान की पुष्टि हो गई है।'}
                </p>
                <button className="btn-farmer-primary" onClick={submit} disabled={loading} style={{ width: '100%' }}>
                  {loading ? (isEn ? 'Saving Profile...' : 'प्रोफाइल सेव हो रही है...') : (isEn ? 'Complete Registration →' : 'पंजीकरण पूरा करें →')}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '96px', height: '96px', background: '#E8F5EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 0 0 16px rgba(42,122,59,0.1)' }}>
              <Check size={48} color="#2A7A3B" strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#2A7A3B', marginBottom: '12px' }}>{isEn ? 'Registration Complete! 🎉' : '🎉 पंजीकरण पूरा!'}</h2>
            <p style={{ fontSize: '18px', color: '#6B7280' }}>{isEn ? 'Welcome to KisanSeva' : 'KisanSeva में आपका स्वागत है'}</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '24px' }}>{isEn ? 'Redirecting to home...' : 'होम पेज पर जा रहे हैं...'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
