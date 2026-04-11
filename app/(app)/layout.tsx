import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import InstallBanner from '@/components/layout/InstallBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-dark">
      <Sidebar />
      <main className="pb-24 md:pb-6 md:pl-64">{children}</main>
      <BottomNav />
      <InstallBanner />
    </div>
  );
}
