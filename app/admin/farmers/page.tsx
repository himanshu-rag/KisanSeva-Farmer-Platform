'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, QrCode } from 'lucide-react';

export default function AdminFarmersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang(localStorage.getItem('kisanseva_admin_lang') || 'en');
  }, []);

  const isEn = lang === 'en';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/admin/farmers/${search.trim()}`);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A2E1A', margin: 0 }}>
          {isEn ? 'Verify Farmer' : 'किसान सत्यापन'}
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={40} color="#4B5563" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            {isEn ? 'Scan or Enter Farmer ID' : 'स्कैन करें या किसान ID दर्ज करें'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            {isEn ? 'Scan the QR code on the farmer\'s digital ID card or manually enter their ID number.' : 'किसान के डिजिटल आईडी कार्ड पर QR कोड स्कैन करें या मैन्युअल रूप से ID दर्ज करें।'}
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '16px', top: '14px' }}>
              <Search size={20} color="#9CA3AF" />
            </div>
            <input 
              type="text" 
              placeholder="e.g. HR-KRNL-2847" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', outline: 'none' }}
              required
            />
          </div>
          <button type="submit" style={{ background: '#2A7A3B', color: 'white', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isEn ? 'Verify' : 'सत्यापित करें'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <QrCode size={18} /> {isEn ? 'Open Camera Scanner' : 'कैमरा स्कैनर खोलें'}
          </button>
        </div>
      </div>
    </div>
  );
}
