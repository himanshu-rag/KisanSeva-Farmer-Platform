'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, MapPin } from 'lucide-react';

export default function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const d = await res.json();
      if (d.success) setLocations(d.data);
    } catch (e) {}
    setLoading(false);
  };

  const addLocation = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem('kisanseva_admin_token');
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ state, district, village })
      });
      setState(''); setDistrict(''); setVillage('');
      await fetchLocations();
    } catch {}
    setAdding(false);
  };

  const deleteLocation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      const token = localStorage.getItem('kisanseva_admin_token');
      await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLocations();
    } catch {}
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '4px' }}>Service Locations</h1>
          <p style={{ color: '#6B7280' }}>Manage States, Districts, and Villages available in the app.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} color="#2A7A3B" /> Add New Location
        </h2>
        <form onSubmit={addLocation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: '600' }}>State</label>
            <input required type="text" value={state} onChange={e=>setState(e.target.value)} placeholder="e.g. Haryana" style={{ width: '100%', padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: '600' }}>District</label>
            <input required type="text" value={district} onChange={e=>setDistrict(e.target.value)} placeholder="e.g. Karnal" style={{ width: '100%', padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: '600' }}>Village</label>
            <input required type="text" value={village} onChange={e=>setVillage(e.target.value)} placeholder="e.g. Sirsali" style={{ width: '100%', padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
          </div>
          <button disabled={adding} type="submit" style={{ padding: '10px 24px', background: '#2A7A3B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '42px' }}>
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>State</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>District</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>Village</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading locations...</td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No locations added yet.</td></tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px 24px', color: '#111827' }}>{loc.state}</td>
                  <td style={{ padding: '16px 24px', color: '#374151' }}>{loc.district}</td>
                  <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#9CA3AF" /> {loc.village}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => deleteLocation(loc.id)} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
