'use client';

import { useMemo, useState } from 'react';
import { Calendar, Clock, Scissors, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfirmFormProps {
  serviceName: string;
  barberName: string;
  date: Date;
  time: string;
  totalPriceCents: number;
  isSubmitting?: boolean;
  onConfirm: (payload: { name: string; phone: string; email?: string }) => void | Promise<void>;
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100);
}

export function ConfirmForm({
  serviceName,
  barberName,
  date,
  time,
  totalPriceCents,
  isSubmitting,
  onConfirm,
}: ConfirmFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const normalizedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const isPhoneValid = normalizedPhone.length >= 10;

  const summaryDate = useMemo(
    () => format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
    [date],
  );

  return (
    <div className="space-y-5">
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 text-amber-300">
              <Scissors className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-zinc-400">Serviço</p>
              <p className="font-semibold truncate">{serviceName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 text-amber-300">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-zinc-400">Barbeiro</p>
              <p className="font-semibold truncate">{barberName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 text-amber-300">
                <Calendar className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-zinc-400">Data</p>
                <p className="font-semibold truncate">{summaryDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 text-amber-300">
                <Clock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-zinc-400">Hora</p>
                <p className="font-semibold truncate">{time}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-zinc-300">Valor total</span>
            <span className="text-base font-bold text-amber-300">
              {formatPrice(totalPriceCents)}
            </span>
          </div>
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setHasTriedSubmit(true);
          if (!name.trim() || !normalizedPhone || !isPhoneValid) return;

          void onConfirm({
            name: name.trim(),
            phone: normalizedPhone,
            email: email.trim() ? email.trim() : undefined,
          });
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="client-name" className="text-zinc-200">
            Nome completo
          </Label>
          <Input
            id="client-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome e sobrenome"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
            autoComplete="name"
            required
          />
          {hasTriedSubmit && !name.trim() ? (
            <p className="text-xs text-red-400">Informe seu nome.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-phone" className="text-zinc-200">
            WhatsApp
          </Label>
          <Input
            id="client-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
            autoComplete="tel"
            required
          />
          <p className="text-xs text-zinc-500">Informe o DDD + número.</p>
          {hasTriedSubmit && (!normalizedPhone || !isPhoneValid) ? (
            <p className="text-xs text-red-400">
              Informe um WhatsApp válido (mín. 10 dígitos).
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-email" className="text-zinc-200">
            E-mail (opcional)
          </Label>
          <Input
            id="client-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="voce@email.com"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          className={cn(
            'w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold',
          )}
          disabled={Boolean(isSubmitting)}
        >
          {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
        </Button>
      </form>
    </div>
  );
}
