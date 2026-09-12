'use client';
import { useState, useEffect } from 'react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';
import { useRouter } from 'next/navigation';
import { IndianRupee, Landmark, Clock, CheckCircle2, AlertCircle, Building2, Ticket, Wallet } from 'lucide-react';

export default function PaymentPage() {
  const { isEn } = useFarmerLang();
  const router = useRouter();
  const [farmer, setFarmer] = useState<any>(null);
  const [recentPayment, setRecentPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: 'Bearer ' + jwtToken } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          if (d.data.farmer) setFarmer(d.data.farmer);
          if (d.data.recentPayment) setRecentPayment(d.data.recentPayment);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const MSP_RATES: Record<string, { rate: number, name: string }> = {
    'Wheat': { rate: 2275, name: isEn ? 'Wheat' : 'गेहूँ' },
    'Paddy': { rate: 2183, name: isEn ? 'Paddy' : 'धान' },
    'Mustard': { rate: 5650, name: isEn ? 'Mustard' : 'सरसों' },
    'Maize': { rate: 2090, name: isEn ? 'Maize' : 'मक्का' },
  };

  const getPaymentValue = () => {
    if (!recentPayment) return 0;
    // If we have actual quantity and MSP from the procured token, use it exactly
    if (recentPayment.quantity && recentPayment.msp) {
      return (recentPayment.quantity * recentPayment.msp).toLocaleString('en-IN');
    }
    // Otherwise, estimate based on profile typical quantity
    if (!farmer || !farmer.primary_crop) return 0;
    const rate = MSP_RATES[farmer.primary_crop]?.rate || 2000;
    const qty = farmer.typical_qty || 0;
    return (rate * qty).toLocaleString('en-IN');
  };

  const isProcured = recentPayment?.status === 'PROCURED';

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100dvh', paddingBottom: '90px' }}>
      {/* Header Area */}
      <div style={{ background: '#1A2E1A', padding: '30px 20px 60px', color: 'white', borderRadius: '0 0 30px 30px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wallet size={28} color="#4ADE80" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {isEn ? 'Direct Benefit Transfer (DBT)' : 'प्रत्यक्ष लाभ अंतरण (DBT)'}
          </h1>
        </div>
        <p style={{ maxWidth: '800px', margin: '8px auto 0', color: '#9CA3AF', fontSize: '14px' }}>
          {isEn ? 'Secure government payments directly to your linked bank account.' : 'आपके लिंक किए गए बैंक खाते में सुरक्षित सरकारी भुगतान।'}
        </p>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '800px', margin: '-40px auto 20px' }}>
        {loading ? (
          <div className="skeleton" style={{ height: '220px', borderRadius: '24px' }} />
        ) : !recentPayment ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB' }}>
            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <IndianRupee size={40} color="#9CA3AF" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '8px' }}>
              {isEn ? 'No Payment History' : 'कोई भुगतान इतिहास नहीं'}
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
              {isEn ? 'Book a slot to sell your crop and track your payment here.' : 'अपनी फसल बेचने के लिए स्लॉट बुक करें और यहाँ अपने भुगतान को ट्रैक करें।'}
            </p>
            <button 
              onClick={() => router.push('/farmer/book')}
              style={{ background: '#2A7A3B', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(42, 122, 59, 0.2)' }}
            >
              <Ticket size={18} />
              {isEn ? 'Book a Slot' : 'स्लॉट बुक करें'}
            </button>
          </div>
        ) : (
          <>
            {/* DBT Bank Card Style */}
            <div style={{ background: isProcured ? 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)' : 'linear-gradient(135deg, #2A7A3B 0%, #166534 100%)', borderRadius: '24px', padding: '24px', color: 'white', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    {isProcured ? (isEn ? 'Final Payment Amount' : 'अंतिम भुगतान राशि') : (isEn ? 'Estimated Payment' : 'अनुमानित भुगतान')}
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <IndianRupee size={28} strokeWidth={3} />
                    {getPaymentValue()}
                  </div>
                </div>
                <Landmark size={32} opacity={0.8} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>{isEn ? 'Linked Account' : 'लिंक किया गया खाता'}</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', letterSpacing: '1px' }}>XXXX-XXXX-9842</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>{isEn ? 'Status' : 'स्थिति'}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px' }}>
                    {isProcured ? (isEn ? 'Payment Initiated' : 'भुगतान शुरू किया गया') : (isEn ? 'Pending Procurement' : 'खरीद बाकी है')}
                  </div>
                </div>
              </div>
            </div>

            {/* Token Info Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#E8F5EC', padding: '10px', borderRadius: '12px' }}>
                    <Ticket size={24} color="#2A7A3B" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Linked Token' : 'लिंक किया गया टोकन'}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>{recentPayment.tokenNo}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Crop' : 'फसल'}</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{recentPayment.crop_name || farmer?.primary_crop}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={20} color="#9CA3AF" />
                <div style={{ fontSize: '15px', color: '#4B5563' }}>{recentPayment.centre}</div>
              </div>
            </div>

            {/* Payment Process Timeline */}
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px', paddingLeft: '8px' }}>
              {isEn ? 'Payment Process' : 'भुगतान प्रक्रिया'}
            </h3>
            
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', position: 'relative' }}>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', opacity: isProcured ? 0.5 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle2 size={24} color="#2A7A3B" />
                  <div style={{ width: '2px', height: '30px', background: '#D1D5DB', margin: '4px 0' }} />
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1F2937' }}>{isEn ? 'Slot Booked' : 'स्लॉट बुक हो गया'}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Token generated successfully' : 'टोकन सफलतापूर्वक जनरेट हुआ'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', opacity: isProcured ? 0.5 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isProcured ? <CheckCircle2 size={24} color="#2A7A3B" /> : <Clock size={24} color="#D97706" />}
                  <div style={{ width: '2px', height: '30px', background: '#D1D5DB', margin: '4px 0' }} />
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: isProcured ? '#1F2937' : '#D97706' }}>
                    {isProcured ? (isEn ? 'Procurement Complete' : 'खरीद पूरी हुई') : (isEn ? 'Pending Procurement' : 'खरीद लंबित है')}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Visit the centre to sell your crop' : 'फसल बेचने के लिए केंद्र जाएँ'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', opacity: isProcured ? 1 : 0.4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isProcured ? <Clock size={24} color="#2563EB" /> : <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #9CA3AF' }} />}
                  <div style={{ width: '2px', height: '30px', background: '#D1D5DB', margin: '4px 0' }} />
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: isProcured ? '#2563EB' : '#4B5563' }}>{isEn ? 'Payment Initiated' : 'भुगतान शुरू किया गया'}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Processing via DBT' : 'DBT के माध्यम से प्रक्रिया में'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', opacity: 0.4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #9CA3AF' }} />
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#4B5563' }}>{isEn ? 'Amount Credited' : 'राशि जमा की गई'}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{isEn ? 'Sent to your linked bank account' : 'आपके लिंक बैंक खाते में भेजा गया'}</div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
