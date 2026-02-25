'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MOCK_BARBERS = [
  { id: '1', name: 'Carlos Silva', bio: 'Especialista em cortes clássicos', isActive: true },
  { id: '2', name: 'Rafael Santos', bio: 'Fade e degradê', isActive: true },
];

export default function AdminBarbersPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_BARBERS;
    return MOCK_BARBERS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar barbeiros..."
          className="sm:max-w-sm bg-zinc-900 border-zinc-700"
        />
        <p className="text-sm text-muted-foreground">
          {filtered.length} barbeiro(s)
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border-b border-zinc-800 text-sm font-medium text-muted-foreground">
          <span>Nome</span>
          <span className="hidden sm:block">Bio</span>
          <span className="text-right">Ações</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Nenhum barbeiro encontrado.
          </div>
        ) : (
          filtered.map((barber) => (
            <div
              key={barber.id}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border-b border-zinc-800/80 last:border-0 items-center"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{barber.name}</span>
                {barber.isActive ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-900/30 text-emerald-300 border border-emerald-800"
                  >
                    ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                    inativo
                  </Badge>
                )}
              </div>
            <span className="hidden sm:block text-muted-foreground truncate">
              {barber.bio}
            </span>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
