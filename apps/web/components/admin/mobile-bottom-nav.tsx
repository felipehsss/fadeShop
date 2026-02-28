'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  ShoppingBag,
  Menu,
  Settings,
  Scissors,
  Users,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/providers/auth-provider';

type TabId = 'schedule' | 'pos' | 'dashboard' | 'menu';

const TABS: Array<{
  id: TabId;
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'schedule', href: '/admin/schedule', label: 'Agenda', icon: Calendar },
  { id: 'pos', href: '/admin/pos', label: 'PDV', icon: ShoppingBag },
  { id: 'dashboard', href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu', icon: Menu },
];

function getActiveTab(pathname: string): TabId {
  if (pathname.startsWith('/admin/schedule')) return 'schedule';
  if (pathname.startsWith('/admin/pos')) return 'pos';
  if (pathname.startsWith('/admin/dashboard')) return 'dashboard';
  return 'menu';
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const active = useMemo(() => getActiveTab(pathname), [pathname]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="bottom"
          className={cn(
            'rounded-t-3xl',
            'bg-zinc-950 text-zinc-100 border-zinc-800',
            'pb-[calc(env(safe-area-inset-bottom)_+_16px)]',
          )}
        >
          <SheetHeader className="px-5 pt-5 pb-2">
            <SheetTitle className="text-zinc-100">Menu</SheetTitle>
          </SheetHeader>

          <div className="px-5 pb-5 space-y-2">
            <Link
              href="/admin/services"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Scissors className="h-5 w-5 text-amber-300" />
                <span className="font-semibold">Serviços</span>
              </div>
              <span className="text-xs text-zinc-500">Gerir</span>
            </Link>

            <Link
              href="/admin/barbers"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-amber-300" />
                <span className="font-semibold">Equipe</span>
              </div>
              <span className="text-xs text-zinc-500">Gerir</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-amber-300" />
                <span className="font-semibold">Configurações</span>
              </div>
              <span className="text-xs text-zinc-500">Perfil</span>
            </Link>

            <Link
              href="/admin/settings/billing"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-amber-300" />
                <span className="font-semibold">Assinatura</span>
              </div>
              <span className="text-xs text-zinc-500">Stripe</span>
            </Link>

            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-zinc-700 bg-transparent justify-between px-4"
              onClick={async () => {
                setIsMenuOpen(false);
                await signOut();
              }}
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                Sair
              </span>
              <span className="text-xs text-zinc-500">Logout</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30',
          'border-t border-zinc-800 bg-zinc-950/90 backdrop-blur',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="mx-auto w-full max-w-3xl px-2 py-2 grid grid-cols-4 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;

            if (tab.id === 'menu') {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2',
                    isActive ? 'bg-amber-500/10 text-amber-200' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href!}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2',
                  isActive ? 'bg-amber-500/10 text-amber-200' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

