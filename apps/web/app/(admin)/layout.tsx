import { AuthProvider } from '@/providers/auth-provider';
import { MobileHeader } from '@/components/admin/mobile-header';
import { MobileBottomNav } from '@/components/admin/mobile-bottom-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-28">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </AuthProvider>
  );
}
