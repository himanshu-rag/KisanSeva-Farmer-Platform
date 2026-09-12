'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FDFCF7', padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1A2E1A', marginBottom: '10px' }}>🌾 FarmTech</h1>
        <p style={{ fontSize: '1.2rem', color: '#4B5563', maxWidth: '500px', margin: '0 auto' }}>
          Smart Procurement & Farmer Assistance Platform. Please select your portal to continue.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/farmer" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#2A7A3B', color: 'white', padding: '30px 40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(42, 122, 59, 0.2)', transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '250px' }}>
            <span style={{ fontSize: '3rem', marginBottom: '10px' }}>📱</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Farmer Portal</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>Book slots & track live queues</p>
          </div>
        </Link>

        <Link href="/admin/login" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#1F2937', color: 'white', padding: '30px 40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(31, 41, 55, 0.2)', transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '250px' }}>
            <span style={{ fontSize: '3rem', marginBottom: '10px' }}>💻</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Admin Portal</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>Govt dashboard & verification</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
