import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { MetricsCard } from '@/components/admin/metrics-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MOCK_METRICS = {
  agendamentosHoje: 12,
  faturamentoMes: 'R$ 8.450,00',
  clientesNovos: 7,
  mediaAtendimento: '32 min',
};

const MOCK_NEXT_APPOINTMENTS = [
  { id: 'a1', time: '09:30', client: 'João', service: 'Corte masculino', status: 'confirmado' as const },
  { id: 'a2', time: '11:00', client: 'Marcos', service: 'Barba', status: 'pendente' as const },
  { id: 'a3', time: '14:00', client: 'Pedro', service: 'Corte + Barba', status: 'confirmado' as const },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, bem-vindo de volta
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo da sua barbearia hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Agendamentos hoje"
          value={MOCK_METRICS.agendamentosHoje}
          subtitle="Em relação a ontem"
          icon="Calendar"
        />
        <MetricsCard
          title="Faturamento do mês"
          value={MOCK_METRICS.faturamentoMes}
          subtitle="Mês atual"
          icon="DollarSign"
        />
        <MetricsCard
          title="Clientes novos"
          value={MOCK_METRICS.clientesNovos}
          subtitle="Últimos 30 dias"
          icon="Users"
        />
        <MetricsCard
          title="Tempo médio"
          value={MOCK_METRICS.mediaAtendimento}
          subtitle="Por atendimento"
          icon="Clock"
        />
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-base">Próximos agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_NEXT_APPOINTMENTS.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/30 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  <span className="text-amber-400">{appt.time}</span>{' '}
                  <span className="truncate">{appt.client}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {appt.service}
                </p>
              </div>
              <Badge
                variant={appt.status === 'confirmado' ? 'secondary' : 'outline'}
                className={
                  appt.status === 'confirmado'
                    ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                    : 'border-zinc-700 text-zinc-300'
                }
              >
                {appt.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
