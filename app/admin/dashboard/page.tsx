'use client';
import { useState, useEffect } from 'react';
import KPICard from '@/components/admin/KPICard';
import StatusBadge from '@/components/admin/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Package, Clock, IndianRupee, AlertTriangle, Bot } from 'lucide-react';
import { adminTranslations } from '@/lib/i18n/admin';

// Static for now, could be dynamic later based on booked tokens
const hourlyData = [
  { time: '8 AM', count: 8 }, { time: '9 AM', count: 25 }, { time: '10 AM', count: 48 },
  { time: '11 AM', count: 72 }, { time: '12 PM', count: 90 }, { time: '1 PM', count: 85 },
  { time: '2 PM', count: 70 }, { time: '3 PM', count: 55 }, { time: '4 PM', count: 40 },
  { time: '5 PM', count: 28 }, { time: '6 PM', count: 18 }, { time: '7 PM', count: 10 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('hi');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setLang(localStorage.getItem('kisanseva_admin_lang') || 'hi');
    
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('kisanseva_admin_token');
        if (!token) return;
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    fetchStats();
  }, []);

  const t = adminTranslations[lang] || adminTranslations['en'];
  const locale = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

  if (loading || !stats) {
    return <div style={{ padding: '24px' }}>Loading live dashboard...</div>;
  }

  const activeTokens = stats.statusCounts.filter((s: any) => ['BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED'].includes(s.status)).reduce((a: number, c: any) => a + c.c, 0);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
          {t.dashboard}
        </h1>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          {new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <KPICard 
          title={t.farmers_today || 'Registered Farmers'} 
          value={stats.farmers.toString()} 
          subtitle="Total Platform Users"
          trend={t.trend_up} 
          icon={<Users />} 
        />
        <KPICard 
          title={t.procured_vol} 
          value={`${stats.procuredVol} ${t.quintals}`} 
          subtitle="Today's Total" 
          icon={<Package />} 
          color="#2563EB" 
        />
        <KPICard 
          title={t.active_queue || 'Active Queue'} 
          value={activeTokens.toString()} 
          subtitle={t.across_centres || 'Across All Centres'} 
          icon={<Clock />} 
          color="#D97706" 
        />
        <KPICard 
          title={t.pending_payments || 'Total Bookings'} 
          value={stats.tokensToday.toString()} 
          subtitle="Tokens Today" 
          icon={<IndianRupee />} 
          color="#9333EA" 
        />
        <KPICard 
          title={t.high_risk} 
          value="0" 
          subtitle={t.centres} 
          icon={<AlertTriangle />} 
          color="#DC2626" 
        />
        <KPICard 
          title={t.ai_alerts} 
          value="0" 
          subtitle={t.new} 
          icon={<Bot />} 
          color="#4F46E5" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px', '@media (min-width: 1024px)': { gridTemplateColumns: '2fr 1fr' } } as any}>
        
        {/* Hourly Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '24px' }}>
            {t.footfall} (Mocked Trends)
          </h2>
          <div style={{ height: '280px', width: '100%' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#2A7A3B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Status */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A2E1A', marginBottom: '20px' }}>केंद्र की स्थिति (Live)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.centreQueues.map((c: any, i: number) => {
              const r = c.queue > 400 ? 'CRITICAL' : c.queue > 200 ? 'BUSY' : 'NORMAL';
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i < stats.centreQueues.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A2E1A' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Queue: {c.queue}</div>
                </div>
                <StatusBadge status={r} />
              </div>
            )})}
            {stats.centreQueues.length === 0 && <div style={{ color: '#6B7280' }}>No active queues.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
