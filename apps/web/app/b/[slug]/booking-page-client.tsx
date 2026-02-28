'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ServiceSelector } from '@/components/booking/service-selector';
import { BarberSelector } from '@/components/booking/barber-selector';
import { SlotPicker } from '@/components/booking/slot-picker';
import { ConfirmForm } from '@/components/booking/confirm-form';
import { getAvailableSlots } from '@/lib/availability';
import { addDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

interface BookingPageClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings: {
      logoUrl?: string;
      address?: string;
      phone?: string;
      timezone: string;
    };
  };
  services: {
    id: string;
    name: string;
    description?: string;
    durationMin: number;
    priceCents: number;
  }[];
  barbers: {
    id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    serviceIds: string[];
  }[];
}

type BookingStep = 'service' | 'barber' | 'slot' | 'confirm' | 'success';

const DAYS_AHEAD = 7;
const SLOT_INTERVAL = 30;

export function BookingPageClient({
  tenant,
  services,
  barbers,
}: BookingPageClientProps) {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);
  const availableBarbers = selectedServiceId
    ? barbers.filter((b) => b.serviceIds.includes(selectedServiceId))
    : barbers;

  const effectiveBarber = selectedBarber ?? availableBarbers[0] ?? null;

  const openNow = useMemo(() => {
    const now = toZonedTime(new Date(), tenant.settings.timezone);
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekday = day >= 1 && day <= 5;
    return isWeekday && hour >= 9 && hour < 18;
  }, [tenant.settings.timezone]);

  function getMockWorkingHours(date: Date, barberId: string | null) {
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (!barberId || isWeekend) return null;
    return {
      id: `wh-${barberId}-${dayOfWeek}`,
      barberId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
    };
  }

  function getMockScheduleBlocks(date: Date, barberId: string) {
    const startsAt = new Date(date);
    startsAt.setHours(12, 0, 0, 0);
    const endsAt = new Date(date);
    endsAt.setHours(13, 0, 0, 0);
    return [
      {
        id: `block-${barberId}-${date.toISOString()}`,
        barberId,
        startsAt,
        endsAt,
        reason: 'Pausa',
        status: 'approved' as const,
      },
    ];
  }

  const dateOptions = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
  }, []);

  const dayOptions = useMemo(() => {
    if (!selectedService || !effectiveBarber) {
      return dateOptions.map((date) => ({ date, hasAvailability: false }));
    }

    return dateOptions.map((date) => {
      const workingHours = getMockWorkingHours(date, effectiveBarber.id);
      const slots = getAvailableSlots({
        targetDate: date,
        workingHours,
        existingAppointments: [],
        scheduleBlocks: workingHours ? getMockScheduleBlocks(date, effectiveBarber.id) : [],
        serviceDurationMin: selectedService.durationMin,
        slotIntervalMin: SLOT_INTERVAL,
        timezone: tenant.settings.timezone,
        leadHours: 0,
      });

      return { date, hasAvailability: slots.some((s) => s.isAvailable) };
    });
  }, [dateOptions, effectiveBarber, selectedService, tenant.settings.timezone]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedService || !selectedDate || !effectiveBarber) return [];
    const workingHours = getMockWorkingHours(selectedDate, effectiveBarber.id);
    return getAvailableSlots({
      targetDate: selectedDate,
      workingHours,
      existingAppointments: [],
      scheduleBlocks: workingHours ? getMockScheduleBlocks(selectedDate, effectiveBarber.id) : [],
      serviceDurationMin: selectedService.durationMin,
      slotIntervalMin: SLOT_INTERVAL,
      timezone: tenant.settings.timezone,
      leadHours: 0,
    });
  }, [effectiveBarber, selectedDate, selectedService, tenant.settings.timezone]);

  const totalPriceCents = selectedService?.priceCents ?? 0;

  const handleConfirmSubmit = async (payload: {
    name: string;
    phone: string;
    email?: string;
  }) => {
    void payload;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="relative border-b border-zinc-800">
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-zinc-950 shadow-xl">
              {tenant.settings.logoUrl ? (
                <AvatarImage src={tenant.settings.logoUrl} alt={tenant.name} />
              ) : null}
              <AvatarFallback className="bg-zinc-900 text-amber-300 text-xl font-bold">
                {tenant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Badge
              className={
                openNow
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                  : 'border-zinc-700 bg-zinc-900/60 text-zinc-300'
              }
              variant="outline"
            >
              {openNow ? 'Aberto agora' : 'Fechado agora'}
            </Badge>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold leading-tight">{tenant.name}</h1>
            {tenant.settings.address ? (
              <div className="mt-2 flex items-start gap-2 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="leading-snug">{tenant.settings.address}</p>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          {(['service', 'barber', 'slot', 'confirm'] as BookingStep[]).map(
            (s, idx) => {
              const stepsOrder: BookingStep[] = ['service', 'barber', 'slot', 'confirm'];
              const currentIndex = stepsOrder.indexOf(step);
              const index = stepsOrder.indexOf(s);
              const isCompleted = index !== -1 && index < currentIndex;
              const isCurrent = index !== -1 && index === currentIndex;

              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={
                      isCompleted
                        ? 'h-8 w-8 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-bold'
                        : isCurrent
                          ? 'h-8 w-8 rounded-full bg-zinc-100 text-black flex items-center justify-center text-sm font-bold'
                          : 'h-8 w-8 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800 flex items-center justify-center text-sm font-bold'
                    }
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={
                      isCurrent
                        ? 'text-sm font-semibold text-zinc-100'
                        : 'text-sm text-zinc-500'
                    }
                  >
                    {s === 'service'
                      ? 'Serviço'
                      : s === 'barber'
                        ? 'Barbeiro'
                        : s === 'slot'
                          ? 'Data/Hora'
                          : 'Confirmar'}
                  </span>
                  {idx < 3 ? (
                    <span className="mx-1 h-px w-6 bg-zinc-800" />
                  ) : null}
                </div>
              );
            },
          )}
        </div>

        {step === 'service' ? (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Step 1: Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                Escolha o serviço para ver os profissionais e horários disponíveis.
              </p>
              <ServiceSelector
                services={services}
                selectedServiceId={selectedServiceId}
                onSelect={(serviceId) => {
                  setSelectedServiceId(serviceId);
                  setSelectedBarberId(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setStep('barber');
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        {step === 'barber' ? (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Step 2: Barbeiro</CardTitle>
                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-3 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setStep('service')}
                >
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedService ? (
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
                    {selectedService.name}
                  </Badge>
                ) : null}
              </div>
              <BarberSelector
                barbers={availableBarbers.map((b) => ({
                  id: b.id,
                  name: b.name,
                  bio: b.bio,
                  avatarUrl: b.avatarUrl,
                }))}
                selectedBarberId={selectedBarberId}
                onSelect={(barberId) => {
                  setSelectedBarberId(barberId);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setStep('slot');
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        {step === 'slot' ? (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Step 3: Data/Hora</CardTitle>
                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-3 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setStep('barber')}
                >
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {selectedService ? (
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
                    {selectedService.name}
                  </Badge>
                ) : null}
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
                  {selectedBarber ? selectedBarber.name : 'Qualquer profissional'}
                </Badge>
              </div>

              <SlotPicker
                days={dayOptions}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                slots={slotsForSelectedDate.map((s) => ({
                  time: s.time,
                  isAvailable: s.isAvailable,
                }))}
                selectedTime={selectedSlot}
                onSelectTime={(time) => setSelectedSlot(time)}
              />

              <Button
                className="w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold"
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setStep('confirm')}
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 'confirm' && selectedService && selectedDate && selectedSlot ? (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Step 4: Confirmar</CardTitle>
                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-3 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setStep('slot')}
                >
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ConfirmForm
                serviceName={selectedService.name}
                barberName={selectedBarber ? selectedBarber.name : 'Qualquer profissional'}
                date={selectedDate}
                time={selectedSlot}
                totalPriceCents={totalPriceCents}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmSubmit}
              />
            </CardContent>
          </Card>
        ) : null}

        {step === 'success' ? (
          <Card className="border-emerald-800/50 bg-emerald-950/30">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-200 mb-1">
                Agendamento confirmado!
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Pronto. Agora é só aparecer no horário combinado.
              </p>

              <div className="mx-auto mb-6 max-w-md rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-left text-sm text-zinc-300">
                <p className="flex items-center justify-between gap-2">
                  <span className="text-zinc-400">Serviço</span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </p>
                <p className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-zinc-400">Profissional</span>
                  <span className="font-semibold">
                    {selectedBarber ? selectedBarber.name : 'Qualquer profissional'}
                  </span>
                </p>
                <p className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-zinc-400">Quando</span>
                  <span className="font-semibold">
                    {selectedDate ? format(selectedDate, "EEE d/MM", { locale: ptBR }) : ''} às{' '}
                    {selectedSlot ?? ''}
                  </span>
                </p>
              </div>

              <Button
                variant="outline"
                className="border-zinc-700 rounded-xl"
                onClick={() => {
                  setStep('service');
                  setSelectedServiceId(null);
                  setSelectedBarberId(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                }}
              >
                Fazer outro agendamento
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
