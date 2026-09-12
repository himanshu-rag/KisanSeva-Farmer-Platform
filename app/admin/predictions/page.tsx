'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Zap } from 'lucide-react';
import { useAdminLang } from '@/lib/hooks/useAdminLang';

const tomorrowData = [
  { centre: 'Karnal', expected: 350, capacity: 500 },
  { centre: 'Panipat', expected: 650, capacity: 500 },
  { centre: 'Ambala', expected: 280, capacity: 400 },
  { centre: 'Rohtak', expected: 120, capacity: 450 },
  { centre: 'Hisar', expected: 80, capacity: 400 },
];

const weekData = [
  { day: 'Mon', tonnes: 120 }, { day: 'Tue', tonnes: 160 }, { day: 'Wed', tonnes: 220 },
  { day: 'Thu', tonnes: 280 }, { day: 'Fri', tonnes: 190 }, { day: 'Sat', tonnes: 150 }, { day: 'Sun', tonnes: 110 }
];

export default function PredictionsPage() {
  const [mounted, setMounted] = useState(false);
  const { lang } = useAdminLang();
  const isEn = lang === 'en';

  useEffect(() => setMounted(true), []);

  const headers = isEn ? ['Centre', 'Expected', 'Capacity', 'Difference', 'Required Action'] : ['केंद्र', 'अपेक्षित', 'क्षमता', 'अंतर', 'आवश्यक कार्रवाई'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
          {isEn ? 'AI Predictions' : 'AI भविष्यवाणी'}
        </h1>
        <div style={{ background: '#E8F5EC', color: '#2A7A3B', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Brain size={16} /> AI Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Bar Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '20px' }}>
            {isEn ? "Tomorrow's Crowd Prediction (Farmer Count)" : "कल की भीड़ भविष्यवाणी (किसानों की संख्या)"}
          </h2>
          <div style={{ height: '260px', width: '100%' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tomorrowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="centre" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="expected" fill="#2A7A3B" name={isEn ? "Expected" : "अपेक्षित (Expected)"} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#E5E7EB" name={isEn ? "Capacity" : "क्षमता (Capacity)"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Area Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '20px' }}>
            {isEn ? "7-Day Crop Arrival Forecast (in Tons)" : "7 दिन फसल आगमन पूर्वानुमान (टन में)"}
          </h2>
          <div style={{ height: '260px', width: '100%' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTonnes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2A7A3B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2A7A3B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="tonnes" stroke="#2A7A3B" strokeWidth={3} fillOpacity={1} fill="url(#colorTonnes)" activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', '@media (min-width: 1024px)': { gridTemplateColumns: '2fr 1fr' } } as any}>
        
        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '20px' }}>
            {isEn ? "Capacity Analysis" : "क्षमता विश्लेषण"}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tomorrowData.map((d, i) => {
                const diff = d.capacity - d.expected;
                const isShort = diff < 0;
                return (
                  <tr key={i} style={{ borderBottom: i < tomorrowData.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1A2E1A' }}>{d.centre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{d.expected}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{d.capacity}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: isShort ? '#DC2626' : '#16A34A', fontWeight: '600' }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {isShort ? <span style={{ color: '#DC2626', fontWeight: '600' }}>{isEn ? 'Increase Counters' : 'काउन्टर बढ़ाएं'}</span> : <span style={{ color: '#16A34A' }}>{isEn ? 'Normal' : 'सामान्य'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Recommendations */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#92400E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} /> {isEn ? 'AI Suggestions' : 'AI सुझाव'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #DC2626' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A2E1A', marginBottom: '4px' }}>Panipat Mandi {isEn ? '(Overloaded)' : '(अतिभारित)'}</div>
              <div style={{ fontSize: '13px', color: '#4B5563' }}>
                {isEn ? '650 farmers expected tomorrow (Capacity 500). Deploy 2 extra operators between 9 AM - 12 PM.' : 'कल 650 किसान अपेक्षित हैं (क्षमता 500)। सुबह 9-12 के बीच 2 अतिरिक्त ऑपरेटर नियुक्त करें।'}
              </div>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A2E1A', marginBottom: '4px' }}>Karnal Mandi {isEn ? '(Balanced)' : '(संतुलित)'}</div>
              <div style={{ fontSize: '13px', color: '#4B5563' }}>
                {isEn ? 'Encourage farmers to book afternoon slots (after 2 PM) as AI Recommended slots.' : 'किसानों को दोपहर 2 बजे के बाद का समय (AI Recommended slots) चुनने के लिए प्रेरित करें।'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
