'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, Phone, Scissors, User, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AppointmentStatus = 'confirmado' | 'pendente';

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  barber: string;
  status: AppointmentStatus;
  phone: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', time: '09:00', client: 'Marcos Silva', service: 'Corte Degradê', barber: 'João Silva', status: 'confirmado', phone: '(11) 98765-4321' },
  { id: 'a2', time: '09:45', client: 'Pedro Costa', service: 'Corte + Barba', barber: 'Carlos Santos', status: 'confirmado', phone: '(11) 91234-5678' },
  { id: 'a3', time: '10:45', client: 'José Oliveira', service: 'Barboterapia', barber: 'João Silva', status: 'pendente', phone: '(11) 99876-5432' },
  { id: 'a4', time: '11:25', client: 'André Mendes', service: 'Design de Barba', barber: 'Rafael Costa', status: 'confirmado', phone: '(11) 98765-1234' },
  { id: 'a5', time: '14:00', client: 'Ricardo Ferreira', service: 'Corte Infantil', barber: 'Lucas Martins', status: 'confirmado', phone: '(11) 97654-3210' },
  { id: 'a6', time: '14:30', client: 'Matheus Rocha', service: 'Corte + Barba', barber: 'João Silva', status: 'pendente', phone: '(11) 96543-2109' },
  { id: 'a7', time: '15:30', client: 'Bruno Alves', service: 'Tingimento', barber: 'Carlos Santos', status: 'confirmado', phone: '(11) 95432-1098' },
  { id: 'a8', time: '16:45', client: 'Felipe Gomes', service: 'Corte Degradê', barber: 'Rafael Costa', status: 'confirmado', phone: '(11) 94321-0987' },
];

type Filter = 'all' | AppointmentStatus;

function statusUi(status: AppointmentStatus) {
  if (status === 'confirmado') {
    return {
      label: 'Confirmado',
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  }
  return {
    label: 'Pendente',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    icon: <Clock className="h-4 w-4" />,
  };
}

function periodLabel(time: string) {
  const hour = Number(time.split(':')[0] ?? 0);
  if (hour < 12) return 'Manhã';
  if (hour < 18) return 'Tarde';
  return 'Noite';
}

function phoneDigits(phone: string) {
  return phone.replace(/\D/g, '');
}

export default function SchedulePage() {
  const today = new Date();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const total = MOCK_APPOINTMENTS.length;
    const confirmed = MOCK_APPOINTMENTS.filter((a) => a.status === 'confirmado').length;
    const pending = MOCK_APPOINTMENTS.filter((a) => a.status === 'pendente').length;
    return { total, confirmed, pending };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_APPOINTMENTS.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.client.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.barber.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of filtered) {
      const key = periodLabel(appt.time);
      const list = map.get(key) ?? [];
      list.push(appt);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Agenda</h2>
        <p className="text-sm text-muted-foreground">
          {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="mt-1 text-xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Confirmados</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="mt-1 text-xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente, serviço ou barbeiro..."
          className="h-12 rounded-2xl border-zinc-800 bg-zinc-900/40"
        />

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn('h-11 rounded-2xl border-zinc-800', filter === 'all' ? 'bg-amber-500/10 text-amber-200 border-amber-500/30' : 'bg-zinc-900/40')}
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('h-11 rounded-2xl border-zinc-800', filter === 'confirmado' ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30' : 'bg-zinc-900/40')}
            onClick={() => setFilter('confirmado')}
          >
            Confirmados
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('h-11 rounded-2xl border-zinc-800', filter === 'pendente' ? 'bg-amber-500/10 text-amber-200 border-amber-500/30' : 'bg-zinc-900/40')}
            onClick={() => setFilter('pendente')}
          >
            Pendentes
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {grouped.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardContent className="p-5">
              <p className="font-semibold">Nenhum agendamento encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste o filtro ou a busca para encontrar um cliente.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {grouped.map(([period, list]) => (
          <div key={period} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">{period}</p>
              <p className="text-xs text-zinc-500">{list.length} itens</p>
            </div>

            <div className="space-y-2">
              {list.map((appointment) => {
                const s = statusUi(appointment.status);
                const digits = phoneDigits(appointment.phone);
                return (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-amber-300 font-bold text-lg leading-none">
                          {appointment.time}
                        </p>
                        <div className="mt-2 flex items-center gap-2 min-w-0">
                          <User className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                          <p className="font-semibold truncate">{appointment.client}</p>
                        </div>
                      </div>

                      <Badge variant="outline" className={cn('gap-1.5', s.className)}>
                        {s.icon}
                        {s.label}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-200">
                        <Scissors className="h-4 w-4 text-amber-300" />
                        <span className="truncate">{appointment.service}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm text-zinc-300">
                        <span className="truncate">Profissional: {appointment.barber}</span>
                        <a
                          href={`tel:${digits}`}
                          className="text-amber-300 hover:text-amber-200"
                        >
                          {appointment.phone}
                        </a>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="h-11 rounded-2xl border-zinc-800 bg-zinc-950/40"
                      >
                        <a href={`tel:${digits}`} className="flex items-center justify-center gap-2">
                          <Phone className="h-4 w-4" />
                          Ligar
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                        onClick={() => {}}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>

                      <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15"
                        onClick={() => {}}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
