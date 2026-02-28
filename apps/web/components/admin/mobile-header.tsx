'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

function getTitle(pathname: string) {
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/admin/schedule')) return 'Agenda';
  if (pathname.startsWith('/admin/pos')) return 'PDV';
  if (pathname.startsWith('/admin/services')) return 'Serviços';
  if (pathname.startsWith('/admin/barbers')) return 'Equipe';
  if (pathname.startsWith('/admin/settings/billing')) return 'Assinatura';
  if (pathname.startsWith('/admin/settings')) return 'Configurações';
  return 'Painel';
}

export function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = useMemo(() => {
    const name = user.displayName?.trim();
    const email = user.email?.trim();
    const raw = name || email || 'FS';
    return raw.slice(0, 2).toUpperCase();
  }, [user.displayName, user.email]);

  const title = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">fadeShop</p>
          <h1 className={cn('text-lg font-semibold tracking-tight', 'truncate')}>
            {title}
          </h1>
        </div>

        <Avatar className="h-9 w-9">
          {user.photoURL ? <AvatarImage src={user.photoURL} /> : null}
          <AvatarFallback className="bg-amber-400/10 text-amber-400 font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

