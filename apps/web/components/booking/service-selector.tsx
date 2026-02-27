'use client';

import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description?: string;
  durationMin: number;
  priceCents: number;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100);
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div className="space-y-3">
      {services.map((service) => {
        const isSelected = selectedServiceId === service.id;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={cn(
              'w-full text-left rounded-xl border bg-zinc-900/50 px-4 py-4 shadow-sm transition-colors',
              'hover:bg-zinc-900 hover:border-zinc-700 active:scale-[0.99]',
              isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-zinc-800',
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold leading-snug truncate">{service.name}</p>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 h-6 w-6 flex-shrink-0">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {service.description ? (
                  <p className="mt-1 text-sm text-zinc-400 leading-snug">
                    {service.description}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {service.durationMin} min
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-base font-bold text-amber-300">
                  {formatPrice(service.priceCents)}
                </span>
                <span className="text-xs text-zinc-500">por sessão</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
