'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Phone, ShieldCheck, Ticket, IndianRupee } from 'lucide-react';
import { adminTranslations } from '@/lib/i18n/admin';

export default function AdminFarmerProfile() {
  const params = useParams();
  const router = useRouter();
  const [farmer, setFarmer] = useState<any>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [historyTokens, setHistoryTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang(localStorage.getItem('kisanseva_admin_lang') || 'en');
    const token = localStorage.getItem('kisanseva_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch(`/api/admin/farmers/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFarmer(d.data.farmer);
          setTokens(d.data.activeTokens);
          setHistoryTokens(d.data.historyTokens || []);
        } else {
          setError(d.error || 'Failed to load farmer');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [params.id, router]);


  const handleProcure = async (tokenId, defaultQty) => {
    const token = localStorage.getItem('kisanseva_admin_token');
    const qtyStr = window.prompt("Enter the exact procured quantity in Quintals (Qt):", defaultQty);
    if (!qtyStr) return;
    const qty = parseFloat(qtyStr);
    if (isNaN(qty) || qty <= 0) {
      alert("Invalid quantity!");
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/tokens/${tokenId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'PROCURED', quantity: qty })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload(); // Quick refresh to show in history
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error updating token');
    }
  };

  const t = adminTranslations[lang] || adminTranslations['en'];
  const isEn = lang === 'en';

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '24px', color: 'red' }}>{error}</div>;
  if (!farmer) return <div style={{ padding: '24px' }}>Not found</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#374151" />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
          {isEn ? 'Farmer Profile' : 'किसान प्रोफ़ाइल'}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Left Col - Identity */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {farmer.profile_photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={farmer.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={32} color="#4B5563" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{farmer.name}</h2>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>ID: {farmer.farmer_id}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={20} color="#6B7280" />
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Mobile</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{farmer.mobile || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} color="#6B7280" />
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Location</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{farmer.village}, {farmer.district}, {farmer.state}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={20} color={farmer.govt_id ? '#10B981' : '#F59E0B'} />
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Govt Verification</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: farmer.govt_id ? '#10B981' : '#F59E0B' }}>
                  {farmer.govt_id ? 'Verified' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Details & Tokens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Agricultural Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Primary Crop</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{farmer.primary_crop}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Typical Quantity</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{farmer.typical_qty} Quintals</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={20} color="#2A7A3B" /> Active Bookings
            </h3>
            {tokens.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: '14px', padding: '16px 0' }}>No active bookings found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tokens.map((tk: any) => {
                  const estimatedPayment = (farmer.typical_qty * tk.msp).toLocaleString('en-IN');
                  return (
                    <div key={tk.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1A2E1A' }}>{tk.tokenNo}</div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{tk.centre} • {tk.slot}</div>
                        <div style={{ fontSize: '13px', color: '#2563EB', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                          <IndianRupee size={12} /> {estimatedPayment} (Estimated)
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                          {tk.status}
                        </div>
                        <button 
                          onClick={() => handleProcure(tk.id, farmer.typical_qty)}
                          style={{ background: '#2A7A3B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Procure & Pay
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={20} color="#16A34A" /> Payment History (Procured)
            </h3>
            {historyTokens.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: '14px', padding: '16px 0' }}>No completed payments found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyTokens.map((tk: any) => {
                  if (tk.status !== 'PROCURED') return null;
                  const finalPayment = (tk.quantity * tk.msp).toLocaleString('en-IN');
                  return (
                    <div key={tk.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1A2E1A' }}>{tk.tokenNo}</div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{tk.quantity} Qt {tk.crop_name}</div>
                        <div style={{ fontSize: '14px', color: '#16A34A', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <IndianRupee size={14} /> {finalPayment} (Final)
                        </div>
                      </div>
                      <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                        INITIATED
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
