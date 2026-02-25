'use client';

import { Clock, CheckCircle, AlertCircle, User, Scissors } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MOCK_APPOINTMENTS = [
  {
    id: 'a1',
    time: '09:00',
    client: 'Marcos Silva',
    service: 'Corte Degradê',
    barber: 'João Silva',
    status: 'confirmado' as const,
    phone: '(11) 98765-4321',
  },
  {
    id: 'a2',
    time: '09:45',
    client: 'Pedro Costa',
    service: 'Corte + Barba',
    barber: 'Carlos Santos',
    status: 'confirmado' as const,
    phone: '(11) 91234-5678',
  },
  {
    id: 'a3',
    time: '10:45',
    client: 'José Oliveira',
    service: 'Barboterapia',
    barber: 'João Silva',
    status: 'pendente' as const,
    phone: '(11) 99876-5432',
  },
  {
    id: 'a4',
    time: '11:25',
    client: 'André Mendes',
    service: 'Design de Barba',
    barber: 'Rafael Costa',
    status: 'confirmado' as const,
    phone: '(11) 98765-1234',
  },
  {
    id: 'a5',
    time: '14:00',
    client: 'Ricardo Ferreira',
    service: 'Corte Infantil',
    barber: 'Lucas Martins',
    status: 'confirmado' as const,
    phone: '(11) 97654-3210',
  },
  {
    id: 'a6',
    time: '14:30',
    client: 'Matheus Rocha',
    service: 'Corte + Barba',
    barber: 'João Silva',
    status: 'pendente' as const,
    phone: '(11) 96543-2109',
  },
  {
    id: 'a7',
    time: '15:30',
    client: 'Bruno Alves',
    service: 'Tingimento',
    barber: 'Carlos Santos',
    status: 'confirmado' as const,
    phone: '(11) 95432-1098',
  },
  {
    id: 'a8',
    time: '16:45',
    client: 'Felipe Gomes',
    service: 'Corte Degradê',
    barber: 'Rafael Costa',
    status: 'confirmado' as const,
    phone: '(11) 94321-0987',
  },
];

function getStatusBadge(status: 'confirmado' | 'pendente') {
  if (status === 'confirmado') {
    return {
      color: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Confirmado',
    };
  }
  return {
    color: 'bg-amber-900/30 text-amber-300 border-amber-800',
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Pendente',
  };
}

export default function SchedulePage() {
  const today = new Date();
  const statusMap = {
    confirmado: 'confirmado' as const,
    pendente: 'pendente' as const,
  };

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda de Agendamentos</h1>
        <p className="text-muted-foreground mt-2">
          {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{MOCK_APPOINTMENTS.length}</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-400">
              {MOCK_APPOINTMENTS.filter((a) => a.status === 'confirmado').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-400">
              {MOCK_APPOINTMENTS.filter((a) => a.status === 'pendente').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Timeline */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Ordenação por Hora
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {MOCK_APPOINTMENTS.map((appointment, index) => {
              const badge = getStatusBadge(appointment.status);

              return (
                <div
                  key={appointment.id}
                  className="p-6 hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Appointment Time Bar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="text-xl font-bold text-amber-400 w-16 text-center">
                          {appointment.time}
                        </div>
                        {index < MOCK_APPOINTMENTS.length - 1 && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-zinc-700 to-transparent" />
                        )}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-semibold truncate">{appointment.client}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs border flex-shrink-0 gap-1.5 ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Serviço</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Scissors className="h-3.5 w-3.5 text-amber-400" />
                            <span>{appointment.service}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Profissional</div>
                          <div className="text-sm text-foreground">{appointment.barber}</div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">Telefone</div>
                          <a
                            href={`tel:${appointment.phone.replace(/\D/g, '')}`}
                            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            {appointment.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm">Legenda de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-900/30 text-emerald-300 border border-emerald-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmado
              </Badge>
              <span className="text-sm text-muted-foreground">Cliente confirmou presença</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-900/30 text-amber-300 border border-amber-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pendente
              </Badge>
              <span className="text-sm text-muted-foreground">Aguarda confirmação</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
