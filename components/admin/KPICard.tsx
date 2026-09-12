import React from 'react';

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: string | React.ReactNode;
  color?: string;
};

export default function KPICard({ title, value, subtitle, trend, icon, color = '#2A7A3B' }: KPICardProps) {
  const isUp = trend?.startsWith('↑');
  const isDown = trend?.startsWith('↓');
  const trendColor = isUp ? '#16A34A' : isDown ? '#DC2626' : '#6B7280';

  return (
    <div className="kpi-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          {icon}
        </div>
        {trend && (
          <div style={{ fontSize: '13px', fontWeight: '600', color: trendColor, background: `${trendColor}15`, padding: '4px 8px', borderRadius: '20px' }}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
