'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

export default function LoginPage() {
  const router = useRouter();
  const { lang, isEn } = useFarmerLang();
  const [screen, setScreen] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = async () => {
    if (mobile.length !== 10) { setError(isEn ? 'Enter a 10-digit number' : '10 अंकों का नंबर डालें'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile }) });
      const data = await res.json();
      if (data.success) {
        
        setScreen('otp');
      } else {
        setError(data.error || (isEn ? 'Failed to send OTP' : 'OTP भेजने में विफल'));
      }
    } catch { setError(isEn ? 'Please try again' : 'कोशिश फिर से करें'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError(isEn ? 'Enter 6-digit OTP' : '6 अंकों का OTP डालें'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, code }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('kisanseva_token', data.token);
        localStorage.setItem('kisanseva_user', JSON.stringify(data.user));
        router.push(data.isNewUser ? '/farmer/register' : '/farmer/home');
      } else { setError(isEn ? 'Invalid OTP. Please try again.' : 'अमान्य OTP। कृपया पुनः प्रयास करें।'); }
    } catch { setError(isEn ? 'Please try again' : 'कोशिश फिर से करें'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) setTimeout(verifyOtp, 100);
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#FDFCF7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => screen === 'otp' ? setScreen('mobile') : router.push('/farmer')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
          <ArrowLeft size={24} color="#1A2E1A" />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px' }}>🌾</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2A7A3B', margin: '8px 0 4px' }}>KisanSeva</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{isEn ? 'Farmer Services' : 'किसान सेवा'}</p>
        </div>

        {screen === 'mobile' ? (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px', textAlign: 'center' }}>
              {isEn ? 'Login / Sign Up' : 'लॉगिन / साइन अप'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px', textAlign: 'center' }}>
              {isEn ? 'Enter mobile number for OTP — New users will be registered automatically' : 'OTP के लिए मोबाइल नंबर डालें — नए उपयोगकर्ता अपने आप रजिस्टर हो जाएंगे'}
            </p>


            {/* Input */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', border: '2px solid #E5E7EB', borderRadius: '12px', background: 'white', overflow: 'hidden', marginBottom: '24px' }}>
              <span style={{ padding: '0 16px', fontSize: '20px', color: '#374151', fontWeight: '600', borderRight: '2px solid #E5E7EB', lineHeight: '64px' }}>+91</span>
              <input
                type="tel" maxLength={10} value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder={isEn ? 'Enter 10 digits' : '10 अंक डालें'}
                style={{ flex: 1, padding: '0 16px', fontSize: '22px', border: 'none', outline: 'none', height: '64px', background: 'transparent', color: '#1A2E1A', fontWeight: '600' }}
              />
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: '15px', marginBottom: '16px' }}>{error}</p>}

            <button className="btn-farmer-primary" onClick={sendOtp} disabled={loading} style={{ width: '100%' }}>
              {loading ? (isEn ? 'Sending...' : 'भेज रहे हैं...') : (isEn ? 'Send OTP' : 'OTP भेजें')} {!loading && <ChevronRight size={20} />}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px', textAlign: 'center' }}>
              {isEn ? 'Enter OTP' : 'OTP डालें'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px', textAlign: 'center' }}>
              {isEn ? `Sent to +91 ${mobile}` : `+91 ${mobile} पर भेजा गया`}
            </p>

            {/* OTP Boxes */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  className={`otp-input${d ? ' filled' : ''}`}
                  type="tel" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: '15px', marginBottom: '16px' }}>{error}</p>}

            <button className="btn-farmer-primary" onClick={verifyOtp} disabled={loading} style={{ width: '100%' }}>
              {loading ? (isEn ? 'Verifying...' : 'जाँच रहे हैं...') : (isEn ? 'Verify ✓' : 'जाँचें ✓')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
