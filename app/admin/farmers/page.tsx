'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, QrCode, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AdminFarmersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('en');
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

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

  useEffect(() => {
    if (showScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // If it's a full URL (like http://localhost:3000/admin/farmers/HR-123)
          if (decodedText.includes('/admin/farmers/')) {
            const parts = decodedText.split('/admin/farmers/');
            if (parts.length > 1) {
              router.push(`/admin/farmers/${parts[1]}`);
            } else {
              router.push(decodedText);
            }
          } else {
            // Assume it's just the ID
            router.push(`/admin/farmers/${decodedText}`);
          }
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
          setShowScanner(false);
        },
        (error) => {
          // Just ignore read errors, it throws them every frame it doesn't see a QR
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [showScanner, router]);

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
          <button 
            type="button"
            onClick={() => setShowScanner(true)}
            style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#EFF6FF'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <QrCode size={18} /> {isEn ? 'Open Camera Scanner' : 'कैमरा स्कैनर खोलें'}
          </button>
        </div>
      </div>

      {showScanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => setShowScanner(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} color="#4B5563" />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Scan QR Code</h3>
            <div id="qr-reader" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
