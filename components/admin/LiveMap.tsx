'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import Link from 'next/link';
import { useAdminLang } from '@/lib/hooks/useAdminLang';
import { adminTranslations } from '@/lib/i18n/admin';

// Real coordinates for Haryana cities
const centres = [
  { id: 1, name: 'Karnal Mandi', lat: 29.6857, lng: 76.9905, status: 'NORMAL', color: '#16A34A', queue: 120 },
  { id: 2, name: 'Panipat Mandi', lat: 29.3909, lng: 76.9708, status: 'CRITICAL', color: '#DC2626', queue: 480 },
  { id: 3, name: 'Ambala Mandi', lat: 30.3782, lng: 76.7767, status: 'BUSY', color: '#D97706', queue: 200 },
  { id: 4, name: 'Rohtak Mandi', lat: 28.8955, lng: 76.5892, status: 'NORMAL', color: '#16A34A', queue: 80 },
  { id: 5, name: 'Hisar Mandi', lat: 29.1492, lng: 75.7115, status: 'NORMAL', color: '#16A34A', queue: 45 },
];

export default function LiveMap() {
  const { lang } = useAdminLang();
  const t = adminTranslations[lang] || adminTranslations['en'];
  const [selected, setSelected] = useState<number | null>(null);

  const activeCentre = selected ? centres.find(c => c.id === selected) : null;

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        
        {/* Map Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
            {t.live_map} — Haryana
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16A34A' }}></div> Normal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#D97706' }}></div> Busy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#DC2626' }}></div> Critical</span>
          </div>
        </div>

        {/* Real Leaflet Map */}
        <div style={{ flex: 1, position: 'relative', zIndex: 0 }}>
          <MapContainer center={[29.4, 76.5]} zoom={7.5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {centres.map((c) => (
              <CircleMarker
                key={c.id}
                center={[c.lat, c.lng]}
                pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.8 }}
                radius={12}
                eventHandlers={{
                  click: () => setSelected(c.id),
                }}
              >
                <Popup>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {c.name}<br/>
                    Queue: {c.queue}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Side Panel */}
      {selected && activeCentre && (
        <div style={{ width: '320px', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>{activeCentre.name}</h2>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
          </div>
          
          <div style={{ background: `${activeCentre.color}15`, color: activeCentre.color, padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
            {activeCentre.status}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 'auto' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>{t.active_queue}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A' }}>{activeCentre.queue}</div>
            </div>
          </div>

          <Link href={`/admin/centre/${activeCentre.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'block', textAlign: 'center', background: '#2A7A3B', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
              View Details →
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
