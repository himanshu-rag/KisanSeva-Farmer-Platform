'use client';
import { usePathname } from 'next/navigation';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/farmer/login' || pathname === '/farmer/register' || pathname === '/farmer';
  
  return (
    <div className={`flex-1 w-full ${isAuthPage ? '' : 'md:ml-64'}`}>
      {children}
    </div>
  );
}
