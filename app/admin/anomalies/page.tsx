'use client';
import { useState } from 'react';
import React from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAdminLang } from '@/lib/hooks/useAdminLang';

export default function AnomaliesPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { lang } = useAdminLang();
  const isEn = lang === 'en';

  const anomalies = [
    { id: 1, type: isEn ? 'Double Booking' : 'दोहरी बुकिंग', farmer: 'Harpal Singh', detail: isEn ? '2 tokens same day, Karnal' : 'एक ही दिन 2 टोकन, Karnal', risk: 'MEDIUM', status: 'OPEN', action: isEn ? 'Review' : 'समीक्षा करें' },
    { id: 2, type: isEn ? 'Abnormal Quantity' : 'असामान्य मात्रा', farmer: 'Balwinder Singh', detail: isEn ? '520 Quintals (Avg: 45)' : '520 क्विंटल (औसत: 45)', risk: 'HIGH', status: 'OPEN', action: isEn ? 'Review' : 'समीक्षा करें' },
    { id: 3, type: isEn ? 'Multi-Centre Booking' : 'बहु-केंद्र बुकिंग', farmer: 'Gurpreet Kaur', detail: isEn ? 'Simultaneous booking at 3 centres' : '3 केंद्रों पर एक साथ सक्रिय बुकिंग', risk: 'MEDIUM', status: 'OPEN', action: isEn ? 'Review' : 'समीक्षा करें' },
    { id: 4, type: isEn ? 'Frequent Booking' : 'बार-बार बुकिंग', farmer: 'Ramji Lal', detail: isEn ? '4th booking this week (Prev: Normal)' : 'इस सप्ताह 4थी बुकिंग (पिछली सामान्य)', risk: 'LOW', status: 'RESOLVED', action: isEn ? '✅ Resolved' : '✅ समाधान' },
  ];

  const tabs = isEn ? ['All', 'High Risk', 'Medium', 'Low', 'Resolved'] : ['सभी', 'उच्च जोखिम', 'मध्यम', 'कम', 'समाधान हुए'];
  const headers = isEn ? ['Type', 'Farmer', 'Details', 'Risk', 'Status', 'Action'] : ['प्रकार', 'किसान', 'विवरण', 'जोखिम', 'स्थिति', 'कार्रवाई'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle color="#DC2626" /> {isEn ? 'Suspicious Activities — Review Required' : 'संदिग्ध गतिविधियाँ — जाँच आवश्यक'}
        </h1>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
          <strong>{isEn ? 'Important:' : 'महत्वपूर्ण:'}</strong> {isEn ? 'Do not assume fraud. Take action only after proper verification.' : 'इन्हें अपराध न मानें। जाँच और सत्यापन के बाद ही कोई कार्रवाई करें।'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {tabs.map((tab, i) => (
          <button key={i} style={{ 
            background: i === 0 ? '#1A2E1A' : 'white', 
            color: i === 0 ? 'white' : '#4B5563', 
            border: '1px solid #D1D5DB', borderRadius: '20px', padding: '6px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' 
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <React.Fragment key={a.id}>
                <tr 
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: expanded === a.id ? '#F9FAFB' : 'white' }}
                >
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1A2E1A' }}>{a.type}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>{a.farmer}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>{a.detail}</td>
                  <td style={{ padding: '16px' }}><StatusBadge status={a.risk} /></td>
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: a.status === 'OPEN' ? '#D97706' : '#16A34A' }}>{a.status}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{ background: 'white', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                        {a.action}
                      </button>
                      {expanded === a.id ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
                    </div>
                  </td>
                </tr>
                {expanded === a.id && (
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <td colSpan={6} style={{ padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Details' : 'विवरण'}</h4>
                          <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                            {a.detail} {isEn ? 'This deviates from normal activity and requires verification. Please contact the farmer or alert the centre operator.' : '। यह सामान्य गतिविधि से अलग है और इसमें सत्यापन की आवश्यकता है। कृपया किसान से संपर्क करें या केंद्र ऑपरेटर को सतर्क करें।'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', justifyContent: 'flex-end' }}>
                          <button style={{ background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                            {isEn ? 'Dismiss' : 'खारिज करें'}
                          </button>
                          <button style={{ background: '#2A7A3B', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
                            {isEn ? 'Send for Review' : 'जाँच के लिए भेजें'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
