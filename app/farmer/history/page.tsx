'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, IndianRupee, MapPin, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

export default function HistoryPage() {
  const router = useRouter();
  const { isEn } = useFarmerLang();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('kisanseva_token');
      if (!token) return router.push('/farmer/login');
      
      try {
        const res = await fetch('/api/farmers/me/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [router]);

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History color="#2A7A3B" />
          {isEn ? 'My Sales History' : 'मेरी बिक्री का इतिहास'}
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />)}
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '16px', border: '1px dashed #D1D5DB' }}>
            <History size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#4B5563' }}>{isEn ? 'No history found' : 'कोई इतिहास नहीं मिला'}</div>
            <p style={{ color: '#6B7280', marginTop: '8px' }}>{isEn ? 'You have no past sales or tokens.' : 'आपकी कोई पुरानी बिक्री या टोकन नहीं है।'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history.map((item) => {
              const amount = (item.quantity * item.msp).toLocaleString('en-IN');
              return (
                <div key={item.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A2E1A' }}>{item.token_no}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>{item.crop_name} • {item.quantity} {isEn ? 'Quintals' : 'क्विंटल'}</div>
                    </div>
                    {item.status === 'PROCURED' && <div style={{ background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> {isEn ? 'Procured & Paid' : 'खरीदा और भुगतान किया'}</div>}
                    {item.status === 'CANCELLED' && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14}/> {isEn ? 'Cancelled' : 'रद्द'}</div>}
                    {item.status !== 'PROCURED' && item.status !== 'CANCELLED' && <div style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{item.status}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} color="#9CA3AF" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Mandi' : 'मंडी'}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{item.centre}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IndianRupee size={18} color="#9CA3AF" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Total Value' : 'कुल मूल्य'}</div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#2A7A3B' }}>₹{amount}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="#9CA3AF" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Date' : 'तारीख'}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{item.date_str}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#9CA3AF" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Time Slot' : 'समय'}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{item.time_str}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
