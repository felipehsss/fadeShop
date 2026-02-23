'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getOnlyAvailableSlots } from '@/lib/availability';
import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const DAYS_AHEAD = 14;
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
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const availableBarbers = selectedServiceId
    ? barbers.filter((b) => b.serviceIds.includes(selectedServiceId))
    : barbers;

  const formatPrice = (priceCents: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceCents / 100);

  // Mock: horário de trabalho do barbeiro (seg–sex 9h–18h)
  const mockWorkingHours = selectedBarberId && selectedDate
    ? {
        id: 'wh-1',
        barberId: selectedBarberId,
        dayOfWeek: selectedDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      }
    : null;

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !mockWorkingHours) return [];
    return getOnlyAvailableSlots({
      targetDate: selectedDate,
      workingHours: mockWorkingHours,
      existingAppointments: [],
      scheduleBlocks: [],
      serviceDurationMin: selectedService.durationMin,
      slotIntervalMin: SLOT_INTERVAL,
      timezone: tenant.settings.timezone,
      leadHours: 0,
    });
  }, [selectedDate, selectedService, mockWorkingHours, tenant.settings.timezone]);

  const dateOptions = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
  }, []);

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-6">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          {tenant.settings.logoUrl && (
            <Image
              src={tenant.settings.logoUrl}
              alt={tenant.name}
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">{tenant.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-zinc-400">
              {tenant.settings.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tenant.settings.address}
                </span>
              )}
              {tenant.settings.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {tenant.settings.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {(['service', 'barber', 'slot', 'confirm'] as BookingStep[]).map(
            (s, index) => {
              const steps: BookingStep[] = ['service', 'barber', 'slot', 'confirm'];
              const currentIndex = steps.indexOf(step);
              const stepIndex = index;
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'bg-amber-500 text-black'
                        : isCurrent
                          ? 'bg-zinc-100 text-black'
                          : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isCompleted ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>

        {step === 'service' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Escolha o serviço</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer border-zinc-800 bg-zinc-900 hover:border-amber-500 hover:bg-zinc-800/80 transition-all"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setStep('barber');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock size={10} />
                          {service.durationMin} min
                        </span>
                      </div>
                      <span className="text-amber-400 font-bold">
                        {formatPrice(service.priceCents)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'barber' && (
          <div>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
              onClick={() => setStep('service')}
            >
              ← Voltar
            </Button>
            <h2 className="text-lg font-semibold mb-4">Escolha o profissional</h2>
            <div className="space-y-3">
              {availableBarbers.map((barber) => (
                <Card
                  key={barber.id}
                  className="cursor-pointer border-zinc-800 bg-zinc-900 hover:border-amber-500 hover:bg-zinc-800/80 transition-all"
                  onClick={() => {
                    setSelectedBarberId(barber.id);
                    setStep('slot');
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {barber.avatarUrl ? (
                      <Image
                        src={barber.avatarUrl}
                        alt={barber.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-amber-400">
                        {barber.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{barber.name}</p>
                      {barber.bio && (
                        <p className="text-sm text-muted-foreground">{barber.bio}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'slot' && (
          <div>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
              onClick={() => setStep('barber')}
            >
              ← Voltar
            </Button>
            <h2 className="text-lg font-semibold mb-4">Escolha data e horário</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar size={14} />
                  Data
                </Label>
                <div className="flex flex-wrap gap-2">
                  {dateOptions.map((date) => {
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <Button
                        key={date.toISOString()}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={
                          isSelected
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                        }
                        disabled={isWeekend}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                      >
                        {format(date, 'EEE d/MM', { locale: ptBR })}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Horários disponíveis
                  </Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível nesta data.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className={
                              isSelected
                                ? 'bg-amber-500 text-black hover:bg-amber-400'
                                : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                            }
                            onClick={() => setSelectedSlot(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full bg-amber-500 text-black hover:bg-amber-400"
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setStep('confirm')}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
              onClick={() => setStep('slot')}
            >
              ← Voltar
            </Button>
            <h2 className="text-lg font-semibold mb-4">Confirme seus dados</h2>

            <Card className="border-zinc-800 bg-zinc-900 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resumo do agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">Serviço:</span>{' '}
                  {selectedService?.name} —{' '}
                  {selectedService && formatPrice(selectedService.priceCents)}
                </p>
                <p>
                  <span className="text-foreground font-medium">Data:</span>{' '}
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}{' '}
                  às {selectedSlot}
                </p>
              </CardContent>
            </Card>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome completo</Label>
                <Input
                  id="clientName"
                  placeholder="Seu nome"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">WhatsApp (somente números)</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="11999999999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 text-black hover:bg-amber-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar agendamento'}
              </Button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <Card className="border-emerald-800 bg-emerald-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-emerald-400 mb-2">
                Agendamento confirmado!
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Enviamos os detalhes para o seu WhatsApp. Até lá!
              </p>
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={() => {
                  setStep('service');
                  setSelectedServiceId(null);
                  setSelectedBarberId(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setClientName('');
                  setClientPhone('');
                }}
              >
                Fazer outro agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
