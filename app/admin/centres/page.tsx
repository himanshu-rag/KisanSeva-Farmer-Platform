'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAdminLang } from '@/lib/hooks/useAdminLang';

export default function CentresPage() {
  const { lang } = useAdminLang();
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isEn = lang === 'en';

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const token = localStorage.getItem('kisanseva_admin_token');
        if (!token) return;
        const res = await fetch('/api/admin/centres', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCentres(data.data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    fetchCentres();
  }, []);

  const headers = isEn 
    ? ['Centre', 'District', 'Queue', 'Capacity', 'Usage', 'Tomorrow Forecast', 'Risk', 'Action'] 
    : ['केंद्र', 'जिला', 'Queue', 'क्षमता', 'उपयोग', 'कल की भविष्यवाणी', 'जोखिम', 'कार्रवाई'];

  const filteredCentres = centres.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.district.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading live centres...</div>;
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
          {isEn ? 'Centres Monitor' : 'केंद्र निगरानी'}
        </h1>
        <div style={{ display: 'flex', background: 'white', borderRadius: '8px', border: '1px solid #D1D5DB', padding: '8px 16px', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder={isEn ? "Search centres..." : "केंद्र खोजें..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '200px', fontSize: '14px' }} 
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#6B7280', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{h} <ChevronDown size={14} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCentres.length === 0 ? (
               <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No centres found.</td></tr>
            ) : (
            filteredCentres.map((c, i) => {
              const util = Math.round((c.queue / c.capacity) * 100);
              const color = util < 30 ? '#16A34A' : util <= 70 ? '#D97706' : '#DC2626';
              
              return (
                <tr key={c.id} style={{ borderBottom: i < filteredCentres.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1A2E1A' }}>{c.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>{c.district}</td>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1A2E1A' }}>{c.queue} <span style={{ color: '#9CA3AF', fontWeight: 'normal' }}>/ {c.capacity}</span></td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>{c.capacity}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${util}%`, height: '100%', background: color, borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#4B5563', width: '30px' }}>{util}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>{c.expected} {isEn ? 'Farmers' : 'किसान'}</td>
                  <td style={{ padding: '16px' }}><StatusBadge status={c.risk} /></td>
                  <td style={{ padding: '16px' }}>
                    <Link href={`/admin/centre/${c.id}`} style={{ color: '#2563EB', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                      {isEn ? 'View →' : 'देखें →'}
                    </Link>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
