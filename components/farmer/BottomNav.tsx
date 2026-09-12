'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Clock, HelpCircle, IndianRupee } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

export default function FarmerNav() {
  const pathname = usePathname();
  const { isEn } = useFarmerLang();

  const navItems = [
    { href: '/farmer/home', icon: Home, label: isEn ? 'Home' : 'होम' },
    { href: '/farmer/token', icon: Ticket, label: isEn ? 'Token' : 'टोकन' },
    { href: '/farmer/payment', icon: IndianRupee, label: isEn ? 'Payment' : 'भुगतान' },
    { href: '/farmer/help', icon: HelpCircle, label: isEn ? 'Help' : 'सहायता' },
  ];

  // Don't show nav on login/register
  if (pathname === '/farmer/login' || pathname === '/farmer/register' || pathname === '/farmer') {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[70px] px-2 z-50 pb-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} className="flex-1 flex flex-col items-center justify-center h-full gap-1">
              <item.icon size={22} color={active ? '#2A7A3B' : '#9CA3AF'} strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: '11px', fontWeight: active ? '700' : '500', color: active ? '#2A7A3B' : '#9CA3AF' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Side Nav */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-4 mb-10">
          <span className="text-3xl">🌾</span>
          <span className="text-2xl font-bold text-[#2A7A3B]">KisanSeva</span>
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors ${active ? 'bg-[#E8F5EC] text-[#2A7A3B]' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-lg ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
