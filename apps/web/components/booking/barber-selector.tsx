'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Barber {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
}

interface BarberSelectorProps {
  barbers: Barber[];
  selectedBarberId: string | null;
  onSelect: (barberId: string | null) => void;
}

function getFirstName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return fullName;
  return trimmed.split(/\s+/)[0] ?? fullName;
}

export function BarberSelector({
  barbers,
  selectedBarberId,
  onSelect,
}: BarberSelectorProps) {
  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'min-w-[152px] rounded-xl border bg-zinc-900/50 px-4 py-4 text-left shadow-sm transition-colors',
            'hover:bg-zinc-900 hover:border-zinc-700 active:scale-[0.99]',
            selectedBarberId === null
              ? 'border-amber-500/70 bg-amber-500/5'
              : 'border-zinc-800',
          )}
          aria-pressed={selectedBarberId === null}
        >
          <div className="flex items-center justify-between gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-zinc-950">
              <AvatarFallback className="bg-zinc-800 text-amber-300">
                <Sparkles className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-3">
            <p className="font-semibold leading-snug">Qualquer</p>
            <p className="text-xs text-zinc-400">Profissional disponível</p>
          </div>
        </button>

        {barbers.map((barber) => {
          const isSelected = selectedBarberId === barber.id;
          const firstName = getFirstName(barber.name);

          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => onSelect(barber.id)}
              className={cn(
                'min-w-[152px] rounded-xl border bg-zinc-900/50 px-4 py-4 text-left shadow-sm transition-colors',
                'hover:bg-zinc-900 hover:border-zinc-700 active:scale-[0.99]',
                isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-zinc-800',
              )}
              aria-pressed={isSelected}
            >
              <Avatar className="h-14 w-14 ring-2 ring-zinc-950">
                {barber.avatarUrl ? (
                  <AvatarImage src={barber.avatarUrl} alt={barber.name} />
                ) : null}
                <AvatarFallback className="bg-zinc-800 text-amber-300 font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="mt-3">
                <p className="font-semibold leading-snug truncate">{firstName}</p>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {barber.bio ?? 'Especialista'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
