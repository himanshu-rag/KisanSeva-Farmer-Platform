'use client';

import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/admin/LiveMap'), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
      <div style={{ color: '#6B7280', fontSize: '18px' }}>Loading Map...</div>
    </div>
  )
});

export default function MapPage() {
  return (
    <div style={{ height: 'calc(100vh - 48px)', paddingBottom: '24px' }}>
      <LiveMap />
    </div>
  );
}
