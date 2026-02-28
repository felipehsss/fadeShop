'use client';

import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-background flex items-center justify-between px-6">
      {/* Left side - Menu button (mobile) */}
      <button className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-zinc-900/50 transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Center - Title (hidden on mobile) */}
      <div className="hidden lg:block flex-1">
        <h2 className="text-sm font-semibold text-foreground">Painel de Controle</h2>
      </div>

      {/* Right side - Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=fade" />
        <AvatarFallback className="bg-amber-400/10 text-amber-400 font-bold">
          FS
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
