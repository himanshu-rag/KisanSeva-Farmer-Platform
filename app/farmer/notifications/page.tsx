'use client';
import { useState, useEffect } from 'react';
import { Ticket, AlertTriangle, Info, CheckCircle, IndianRupee, Check, Bell } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

const ICON_MAP: Record<string, any> = {
  TOKEN: Ticket,
  ALERT: AlertTriangle,
  INFO: Info,
  SUCCESS: CheckCircle,
  PAYMENT: IndianRupee,
};

const COLOR_MAP: Record<string, string> = {
  TOKEN: '#2A7A3B',
  ALERT: '#DC2626',
  INFO: '#D97706',
  SUCCESS: '#16A34A',
  PAYMENT: '#2563EB',
};

const FALLBACK = [
  { id: 1, type: 'TOKEN', title: 'Token Confirmed', body: 'Your token A125 is created. Karnal Mandi, Today 10:00–11:00 AM.', time: '2h ago', read: false },
  { id: 2, type: 'ALERT', title: 'Crowd Alert', body: 'High crowd at Karnal Mandi. Arrive after 2 PM.', time: '3h ago', read: false },
  { id: 3, type: 'INFO', title: 'Queue Update', body: 'Queue is slow. You can arrive 20 mins late.', time: '5h ago', read: true },
  { id: 4, type: 'SUCCESS', title: 'Sale Complete', body: 'Your sale (50 Qtl Wheat) is complete.', time: 'Yesterday', read: true },
  { id: 5, type: 'PAYMENT', title: 'Payment Initiated', body: '₹1,13,750 payment has been initiated.', time: 'Yesterday', read: true },
];

export default function NotificationsPage() {
  const { isEn } = useFarmerLang();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) {
          setNotifications(d.data);
        } else {
          // Use localised fallback
          setNotifications(FALLBACK.map(n => ({
            ...n,
            title: isEn ? n.title : {
              TOKEN: 'टोकन पक्का हुआ', ALERT: 'भीड़ की चेतावनी', INFO: 'Queue की जानकारी',
              SUCCESS: 'खरीद पूरी', PAYMENT: 'भुगतान शुरू'
            }[n.type] || n.title,
            body: isEn ? n.body : {
              1: 'आपका टोकन A125 बन गया। Karnal Mandi, आज 10:00–11:00 AM।',
              2: 'Karnal Mandi पर आज भीड़ ज्यादा है। 2 बजे के बाद आएं।',
              3: 'Queue धीमी है। आप 20 मिनट देरी से आ सकते हैं।',
              4: 'आपकी फसल (50 क्विंटल गेहूँ) की खरीद पूरी हो गई।',
              5: '₹1,13,750 का भुगतान शुरू हो गया।',
            }[n.id] || n.body,
            time: isEn ? n.time : n.time.replace('h ago', ' घंटे पहले').replace('Yesterday', 'कल'),
          })));
        }
      })
      .catch(() => setNotifications(FALLBACK))
      .finally(() => setLoading(false));
  }, [isEn]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ background: '#FDFCF7', minHeight: '100dvh', paddingBottom: '90px' }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', margin: 0 }}>🔔 {isEn ? 'Notifications' : 'सूचनाएँ'}</h1>
            {unreadCount > 0 && (
              <span style={{ background: '#DC2626', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '13px', fontWeight: '700' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2A7A3B', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              <Check size={16} /> {isEn ? 'Mark all read' : 'सभी पढ़ें'}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Bell size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
            <div style={{ color: '#9CA3AF', fontSize: '16px' }}>{isEn ? 'No notifications yet' : 'अभी कोई सूचना नहीं'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => {
              const Icon = ICON_MAP[n.type] || Info;
              const color = COLOR_MAP[n.type] || '#6B7280';
              return (
                <div
                  key={n.id}
                  onClick={() => setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  style={{
                    background: n.read ? 'white' : '#FAFFFE',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    borderLeft: `4px solid ${n.read ? 'transparent' : color}`,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ fontSize: '16px', fontWeight: n.read ? '600' : '700', color: '#1A2E1A' }}>{n.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                        {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />}
                        <div style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{n.time}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.4 }}>{n.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
