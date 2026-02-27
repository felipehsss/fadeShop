'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DayOption {
  date: Date;
  hasAvailability: boolean;
}

interface SlotOption {
  time: string;
  isAvailable: boolean;
}

interface SlotPickerProps {
  days: DayOption[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  slots: SlotOption[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

function formatWeekdayShort(date: Date) {
  const value = format(date, 'EEE', { locale: ptBR });
  return value.replace('.', '');
}

export function SlotPicker({
  days,
  selectedDate,
  onSelectDate,
  slots,
  selectedTime,
  onSelectTime,
}: SlotPickerProps) {
  return (
    <div className="space-y-5">
      <div className="-mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(({ date, hasAvailability }) => {
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={!hasAvailability}
                onClick={() => onSelectDate(date)}
                className={cn(
                  'min-w-[78px] rounded-xl border px-3 py-3 text-center transition-colors',
                  'active:scale-[0.99]',
                  hasAvailability
                    ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    : 'bg-zinc-950 border-zinc-900 opacity-50',
                  isSelected ? 'border-amber-500/70 bg-amber-500/5' : '',
                )}
              >
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  {formatWeekdayShort(date)}
                </p>
                <p className="mt-1 text-lg font-bold leading-none">
                  {format(date, 'd', { locale: ptBR })}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {selectedDate ? (
          slots.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
              Nenhum horário disponível nesta data.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isDisabled = !slot.isAvailable;

                return (
                  <Button
                    key={slot.time}
                    type="button"
                    variant="outline"
                    disabled={isDisabled}
                    onClick={() => onSelectTime(slot.time)}
                    className={cn(
                      'h-11 rounded-xl border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900 hover:text-zinc-50',
                      isSelected ? 'border-amber-500/70 bg-amber-500/10 text-amber-100' : '',
                      isDisabled ? 'opacity-50 line-through' : '',
                    )}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          )
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
            Selecione um dia para ver os horários.
          </div>
        )}
      </div>
    </div>
  );
}
