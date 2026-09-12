import BottomNav from '@/components/farmer/BottomNav';
import MainContentWrapper from '@/components/farmer/MainContentWrapper';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FDFCF7] min-h-[100dvh] flex">
      <BottomNav />
      <MainContentWrapper>
        {children}
      </MainContentWrapper>
    </div>
  );
}
