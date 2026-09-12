'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Clock, ShieldAlert } from 'lucide-react';
import KPICard from '@/components/admin/KPICard';
import StatusBadge from '@/components/admin/StatusBadge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminLang } from '@/lib/hooks/useAdminLang';

const hourlyData = [
  { time: '8 AM', count: 5 }, { time: '9 AM', count: 12 }, { time: '10 AM', count: 28 },
  { time: '11 AM', count: 45 }, { time: '12 PM', count: 70 }, { time: '1 PM', count: 85 },
  { time: '2 PM', count: 70 }, { time: '3 PM', count: 65 }, { time: '4 PM', count: 52 },
  { time: '5 PM', count: 40 }, { time: '6 PM', count: 28 }, { time: '7 PM', count: 18 }
];

export default function CentreDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useAdminLang();
  const isEn = lang === 'en';

  const [centre, setCentre] = useState<any>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCentreData = async () => {
    try {
      const jwtToken = localStorage.getItem('kisanseva_admin_token');
      if (!jwtToken) return;
      
      const res = await fetch(`/api/admin/centres/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCentre(data.data.centre);
        setTokens(data.data.tokens);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCentreData();
  }, [id]);

  const updateTokenStatus = async (tokenId: number, newStatus: string) => {
    try {
      const jwtToken = localStorage.getItem('kisanseva_admin_token');
      await fetch(`/api/admin/tokens/${tokenId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchCentreData(); // refresh list
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const getNextAction = (status: string, tokenId: number) => {
    switch (status) {
      case 'BOOKED':
        return <button onClick={() => updateTokenStatus(tokenId, 'ARRIVED')} style={{ padding: '6px 12px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{isEn ? 'Mark Arrived' : 'पहुंच दर्ज करें'}</button>;
      case 'ARRIVED':
        return <button onClick={() => updateTokenStatus(tokenId, 'VERIFIED')} style={{ padding: '6px 12px', background: '#E0E7FF', color: '#3730A3', border: '1px solid #C7D2FE', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{isEn ? 'Verify Docs' : 'कागज़ात जांचें'}</button>;
      case 'VERIFIED':
        return <button onClick={() => updateTokenStatus(tokenId, 'WEIGHED')} style={{ padding: '6px 12px', background: '#E8F5EC', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{isEn ? 'Weighing Done' : 'वज़न दर्ज करें'}</button>;
      case 'WEIGHED':
        return <button onClick={() => updateTokenStatus(tokenId, 'PROCURED')} style={{ padding: '6px 12px', background: '#2A7A3B', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{isEn ? 'Mark Procured' : 'खरीद पूरी करें'}</button>;
      default:
        return <span style={{ fontSize: '13px', color: '#9CA3AF' }}>—</span>;
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (!centre) return <div style={{ padding: '24px' }}>Centre not found</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1A2E1A" />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>{centre.name}</h1>
            <StatusBadge status={centre.risk} />
          </div>
          <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
            {centre.district} • {isEn ? 'Today\'s Data' : 'आज का डेटा'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <KPICard title={isEn ? 'Waiting Queue' : 'प्रतीक्षारत'} value={centre.queue.toString()} subtitle={isEn ? 'Farmers waiting' : 'किसान लाइन में'} icon={<Clock />} color="#D97706" />
        <KPICard title={isEn ? 'Tokens Completed' : 'टोकन पूरे हुए'} value={centre.completed.toString()} subtitle={isEn ? 'Procured today' : 'आज की खरीद'} icon={<Check />} color="#2A7A3B" />
        <KPICard title={isEn ? 'Anomalies' : 'विसंगतियां'} value="0" subtitle={isEn ? 'Flagged by AI' : 'AI द्वारा चिन्हित'} icon={<ShieldAlert />} color="#DC2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', '@media (min-width: 1024px)': { gridTemplateColumns: '2fr 1fr' } } as any}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '16px' }}>{isEn ? 'Live Token Queue' : 'लाइव टोकन कतार'}</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px', color: '#6B7280', fontWeight: '600', fontSize: '14px' }}>Token No</th>
                <th style={{ padding: '12px', color: '#6B7280', fontWeight: '600', fontSize: '14px' }}>Farmer Name</th>
                <th style={{ padding: '12px', color: '#6B7280', fontWeight: '600', fontSize: '14px' }}>Time Slot</th>
                <th style={{ padding: '12px', color: '#6B7280', fontWeight: '600', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px', color: '#6B7280', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No tokens for today.</td></tr>
              ) : (
              tokens.map((t, i) => (
                <tr key={i} style={{ borderBottom: i < tokens.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#1A2E1A' }}>{t.token_no}</td>
                  <td style={{ padding: '16px 12px', color: '#4B5563' }}>{t.farmer_name}</td>
                  <td style={{ padding: '16px 12px', color: '#4B5563', fontSize: '14px' }}>{t.slot}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: t.status === 'COMPLETED' ? '#16A34A' : '#4B5563' }}>{t.status}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    {getNextAction(t.status, t.id)}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '24px' }}>{isEn ? 'Footfall Prediction' : 'फुटफॉल अनुमान'} (Mock)</h2>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#2A7A3B" strokeWidth={3} dot={{ r: 4, fill: '#2A7A3B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
