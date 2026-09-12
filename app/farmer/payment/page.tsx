'use client';
import { useState, useEffect } from 'react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { isEn } = useFarmerLang();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: 'Bearer ' + jwtToken } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          if (d.data.activeToken) setActiveToken(d.data.activeToken);
          if (d.data.payment) setPaymentData(d.data.payment);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Calculate estimated earnings from active token
  const MSP_RATES: Record<string, { rate: number, name: string }> = {
    'Wheat': { rate: 2275, name: isEn ? 'Wheat' : 'गेहूँ' },
    'Paddy': { rate: 2183, name: isEn ? 'Paddy' : 'धान' },
    'Mustard': { rate: 5650, name: isEn ? 'Mustard' : 'सरसों' },
    'Maize': { rate: 2090, name: isEn ? 'Maize' : 'मक्का' },
  };

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', marginBottom: '20px' }}>💰 {isEn ? 'Payment Status' : 'भुगतान की स्थिति'}</h1>

        {loading ? (
          <div className="skeleton" style={{ height: '200px', borderRadius: '16px', marginBottom: '16px' }} />
        ) : !activeToken ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'No Active Procurement' : 'कोई सक्रिय खरीद नहीं'}</div>
            <div style={{ color: '#6B7280', marginBottom: '20px', fontSize: '15px' }}>{isEn ? 'Book a slot to start selling your crop.' : 'फसल बेचने के लिए स्लॉट बुक करें।'}</div>
            <button className="btn-farmer-primary" onClick={() => router.push('/farmer/book')}>{isEn ? '📋 Book a Slot' : '📋 स्लॉट बुक करें'}</button>
          </div>
        ) : (
          <>
            <div className="farmer-card" style={{ marginBottom: '16px' }}>
              {[
                [isEn ? '🎫 Token' : '🎫 टोकन', activeToken.tokenNo],
                [isEn ? '🏛️ Centre' : '🏛️ केंद्र', activeToken.centre],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: '16px' }}>
                  <span style={{ color: '#6B7280' }}>{k}</span><span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
              <div style={{ padding: '16px 0 4px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{isEn ? 'Status' : 'स्थिति'}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#D97706' }}>{isEn ? '🟡 Processing — Payment pending after procurement' : '🟡 प्रक्रिया में — खरीद के बाद भुगतान होगा'}</div>
              </div>
            </div>

            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🟡</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#B45309', marginBottom: '8px' }}>{isEn ? 'Awaiting Procurement Completion' : 'खरीद पूरी होने का इंतज़ार'}</div>
              <div style={{ fontSize: '15px', color: '#92400E' }}>{isEn ? 'Payment will be processed within 24-48 hours after crop procurement.' : 'फसल खरीद के 24-48 घंटे में भुगतान होगा।'}</div>
            </div>

            <div className="farmer-card">
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A2E1A', marginBottom: '12px' }}>ℹ️ {isEn ? 'How Payment Works' : 'भुगतान कैसे होता है'}</div>
              {[
                isEn ? '✅ Crop is weighed & quality verified at centre' : '✅ केंद्र पर फसल तौली और जाँची जाती है',
                isEn ? '✅ Procurement approved by officer' : '✅ अधिकारी खरीद को मंजूरी देते हैं',
                isEn ? '🏦 Payment sent to your linked bank account (DBT)' : '🏦 आपके बैंक खाते में सीधे DBT भुगतान',
                isEn ? '⏱ Usually within 24-48 hours of procurement' : '⏱ आमतौर पर खरीद के 24-48 घंटे में',
              ].map((step, i) => (
                <div key={i} style={{ fontSize: '14px', color: '#374151', marginBottom: '8px', lineHeight: 1.5 }}>{step}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
