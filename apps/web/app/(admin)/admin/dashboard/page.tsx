import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { MetricsCard } from '@/components/admin/metrics-card';

const MOCK_METRICS = {
  agendamentosHoje: 12,
  faturamentoMes: 'R$ 8.450,00',
  clientesNovos: 7,
  mediaAtendimento: '32 min',
};

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
          icon={Calendar}
        />
        <MetricsCard
          title="Faturamento do mês"
          value={MOCK_METRICS.faturamentoMes}
          subtitle="Mês atual"
          icon={DollarSign}
        />
        <MetricsCard
          title="Clientes novos"
          value={MOCK_METRICS.clientesNovos}
          subtitle="Últimos 30 dias"
          icon={Users}
        />
        <MetricsCard
          title="Tempo médio"
          value={MOCK_METRICS.mediaAtendimento}
          subtitle="Por atendimento"
          icon={Clock}
        />
      </div>
    </div>
  );
}
