import { TrendingUp } from 'lucide-react';
import { MetricsCard } from '@/components/admin/metrics-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MOCK_METRICS = {
  faturamentoDia: 'R$ 450,00',
  agendamentosHoje: 12,
  clientesNovos: 3,
  mediaAtendimento: '32 min',
};

const MOCK_NEXT_APPOINTMENTS = [
  { id: 'a1', time: '14:00', client: 'Marcos', service: 'Corte Degradê', status: 'confirmado' as const },
  { id: 'a2', time: '14:45', client: 'João', service: 'Barba + Corte', status: 'confirmado' as const },
  { id: 'a3', time: '15:30', client: 'Pedro', service: 'Corte', status: 'pendente' as const },
  { id: 'a4', time: '16:15', client: 'Carlos', service: 'Barba', status: 'confirmado' as const },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, bem-vindo de volta! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui está o resumo da sua barbearia today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Faturamento do Dia"
          value={MOCK_METRICS.faturamentoDia}
          subtitle="Hoje"
          icon="DollarSign"
        />
        <MetricsCard
          title="Agendamentos"
          value={MOCK_METRICS.agendamentosHoje}
          subtitle="Hoje"
          icon="Calendar"
        />
        <MetricsCard
          title="Novos Clientes"
          value={MOCK_METRICS.clientesNovos}
          subtitle="Últimos 30 dias"
          icon="Users"
        />
        <MetricsCard
          title="Tempo Médio"
          value={MOCK_METRICS.mediaAtendimento}
          subtitle="Por atendimento"
          icon="Clock"
        />
      </div>

      {/* Agenda Card */}
      <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {MOCK_NEXT_APPOINTMENTS.length} agendamentos marcados
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              +15% vs ontem
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {MOCK_NEXT_APPOINTMENTS.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Time Badge */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-sm font-bold text-amber-400">
                      {appt.time}
                    </p>
                  </div>

                  {/* Appointment Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {appt.service}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Cliente: {appt.client}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={appt.status === 'confirmado' ? 'secondary' : 'outline'}
                  className={cn(
                    appt.status === 'confirmado'
                      ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                      : 'border-amber-700 text-amber-300 bg-amber-900/20',
                    'ml-4 flex-shrink-0'
                  )}
                >
                  {appt.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
