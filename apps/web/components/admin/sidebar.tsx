'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Agenda',
    href: '/admin/schedule',
    icon: Calendar,
  },
  {
    name: 'Serviços',
    href: '/admin/services',
    icon: Scissors,
  },
  {
    name: 'Barbeiros',
    href: '/admin/barbers',
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-background flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-zinc-800 px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Fade Shop
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-zinc-900/50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 Fade Shop
        </p>
      </div>
    </aside>
  );
}
