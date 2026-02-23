import { Button } from '@/components/ui/button';

const MOCK_BARBERS = [
  { id: '1', name: 'Carlos Silva', bio: 'Especialista em cortes clássicos', isActive: true },
  { id: '2', name: 'Rafael Santos', bio: 'Fade e degradê', isActive: true },
];

export default function AdminBarbersPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbeiros</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os profissionais da barbearia.
          </p>
        </div>
        <Button variant="default" className="shrink-0">
          Adicionar novo
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border-b border-zinc-800 text-sm font-medium text-muted-foreground">
          <span>Nome</span>
          <span className="hidden sm:block">Bio</span>
          <span className="text-right">Ações</span>
        </div>
        {MOCK_BARBERS.map((barber) => (
          <div
            key={barber.id}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border-b border-zinc-800/80 last:border-0 items-center"
          >
            <span className="font-medium">{barber.name}</span>
            <span className="hidden sm:block text-muted-foreground truncate">
              {barber.bio}
            </span>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
