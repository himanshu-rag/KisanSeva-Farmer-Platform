'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Search, Download } from 'lucide-react';

export default function AdminTokensPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('en');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setLang(localStorage.getItem('kisanseva_admin_lang') || 'en');
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const jwtToken = localStorage.getItem('kisanseva_admin_token');
      if (!jwtToken) { router.push('/admin/login'); return; }
      
      const res = await fetch('/api/admin/tokens', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setTokens(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const isEn = lang === 'en';
  
  const filteredTokens = tokens.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.token_no.toLowerCase().includes(q) || 
             t.farmer_name.toLowerCase().includes(q) || 
             t.mobile?.includes(q) ||
             t.farmer_uid?.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'ARRIVED': return { bg: '#FEF3C7', text: '#92400E' };
      case 'VERIFIED': return { bg: '#E0E7FF', text: '#3730A3' };
      case 'WEIGHED': return { bg: '#E8F5EC', text: '#166534' };
      case 'PROCURED': return { bg: '#DCFCE7', text: '#15803D' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={24} />
          {isEn ? 'Token Management' : 'टोकन प्रबंधन'}
        </h1>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          <Download size={16} /> {isEn ? 'Export CSV' : 'CSV डाउनलोड करें'}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '10px' }}>
              <Search size={18} color="#9CA3AF" />
            </div>
            <input 
              type="text" 
              placeholder={isEn ? "Search by Token No, Name, Mobile, ID..." : "टोकन नं, नाम, मोबाइल, ID खोजें..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', background: 'white' }}
          >
            <option value="ALL">{isEn ? 'All Status' : 'सभी स्थिति'}</option>
            <option value="BOOKED">Booked</option>
            <option value="ARRIVED">Arrived</option>
            <option value="VERIFIED">Verified</option>
            <option value="WEIGHED">Weighed</option>
            <option value="PROCURED">Procured</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#4B5563', fontSize: '14px' }}>Token</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#4B5563', fontSize: '14px' }}>Farmer</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#4B5563', fontSize: '14px' }}>Crop & Qty</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#4B5563', fontSize: '14px' }}>Centre & Slot</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#4B5563', fontSize: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading...</td></tr>
              ) : filteredTokens.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No tokens found</td></tr>
              ) : (
                filteredTokens.map((t, i) => {
                  const colors = getStatusColor(t.status);
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#111827' }}>
                        {t.token_no}
                        <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal' }}>
                          {new Date(t.booked_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '500', color: '#1F2937' }}>{t.farmer_name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.mobile || t.farmer_uid}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#1F2937' }}>{t.crop_name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.quantity} Qt</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#1F2937' }}>{t.centre}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.slot_date} | {t.slot}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          background: colors.bg, color: colors.text, 
                          padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600'
                        }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
