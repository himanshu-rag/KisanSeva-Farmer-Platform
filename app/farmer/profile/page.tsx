'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Phone, Hash, Camera } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';


export default function ProfilePage() {
  const router = useRouter();
  const { isEn } = useFarmerLang();
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;

      setUploading(true);
      const jwtToken = localStorage.getItem('kisanseva_token');
      try {
        const res = await fetch('/api/farmers/me', {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + (jwtToken || ''),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profile_photo: base64 })
        });
        const data = await res.json();
        if (data.success) {
          setFarmer((prev: any) => ({ ...prev, profile_photo: base64 }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('kisanseva_token');
    if (!jwtToken) { setLoading(false); return; }
    fetch('/api/farmers/me', { headers: { Authorization: 'Bearer ' + jwtToken } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.farmer) {
          setFarmer(d.data.farmer);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (!farmer) {
    return <div style={{ padding: '24px' }}>Profile not found</div>;
  }

  // Create the URL that an admin would scan
  // Assuming the host is the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrValue = `${origin}/admin/farmers/${farmer.farmer_id}`;

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'white', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} color="#374151" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A2E1A', margin: 0 }}>{isEn ? 'Digital ID Card' : 'डिजिटल आईडी कार्ड'}</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden' }}>
          {/* Header of ID Card */}
          <div style={{ background: '#1A2E1A', color: 'white', padding: '16px 24px', margin: '-24px -24px 24px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🌾</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>KisanSeva</span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'right' }}>
              {isEn ? 'Govt. of India' : 'भारत सरकार'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ cursor: 'pointer', position: 'relative', marginBottom: '16px' }}>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploading} />
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: uploading ? 0.5 : 1 }}>
                {farmer.profile_photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={farmer.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={40} color="#2A7A3B" />
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#2A7A3B', borderRadius: '50%', padding: '6px', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={14} color="white" />
              </div>
            </label>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A2E1A', margin: 0 }}>{farmer.name}</h2>
            <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={14} /> {farmer.farmer_id}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
              <MapPin size={20} color="#2A7A3B" />
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Village & District' : 'गाँव और ज़िला'}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A2E1A' }}>{farmer.village}, {farmer.district}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
              <Phone size={20} color="#2A7A3B" />
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Mobile Number' : 'मोबाइल नंबर'}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A2E1A' }}>
                  {farmer.mobile || '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px' }}>🌾</div>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{isEn ? 'Primary Crop' : 'मुख्य फसल'}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A2E1A' }}>{farmer.primary_crop} ({farmer.typical_qty} Qt)</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
              {isEn ? 'Show this QR code at the procurement centre for fast verification.' : 'तेज़ सत्यापन के लिए खरीद केंद्र पर यह QR कोड दिखाएँ।'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}`} alt="QR Code" width={150} height={150} style={{ display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
