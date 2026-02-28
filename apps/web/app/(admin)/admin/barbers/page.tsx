'use client';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState } from 'react';

const MOCK_BARBERS = [
  {
    id: '1',
    name: 'João Silva',
    bio: 'Especialista em cortes clássicos e degradê',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    serviceIds: ['1', '2', '3'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Carlos Santos',
    bio: 'Expert em barboterapia e tratamentos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    serviceIds: ['1', '3', '5'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Rafael Costa',
    bio: 'Fadista e especialista em designs modernos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael',
    serviceIds: ['2', '4', '6'],
    isActive: true,
  },
  {
    id: '4',
    name: 'Lucas Martins',
    bio: 'Profissional versátil e atencioso',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
    serviceIds: ['1', '2', '5'],
    isActive: false,
  },
];

const SERVICE_NAMES: Record<string, string> = {
  '1': 'Corte Degradê',
  '2': 'Corte + Barba',
  '3': 'Barboterapia',
  '4': 'Corte Infantil',
  '5': 'Design de Barba',
  '6': 'Tingimento',
};

const SERVICE_COLORS: Record<string, string> = {
  '1': 'bg-blue-900/30 text-blue-300 border-blue-800',
  '2': 'bg-amber-900/30 text-amber-300 border-amber-800',
  '3': 'bg-purple-900/30 text-purple-300 border-purple-800',
  '4': 'bg-pink-900/30 text-pink-300 border-pink-800',
  '5': 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
  '6': 'bg-orange-900/30 text-orange-300 border-orange-800',
};

export default function AdminBarbersPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_BARBERS;
    return MOCK_BARBERS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Equipa</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os profissionais da sua barbearia
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Barbeiro
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar barbeiros..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} barbeiro(s)
        </p>
      </div>

      {/* Barbers Grid */}
      {filtered.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-4">💈</div>
            <h3 className="text-lg font-semibold mb-2">Nenhum barbeiro encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              Adicione profissionais à sua equipa
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Barbeiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((barber) => (
            <Card
              key={barber.id}
              className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden flex flex-col"
            >
              <CardHeader className="border-b border-zinc-800 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={barber.avatar} alt={barber.name} />
                      <AvatarFallback className="bg-amber-400/10 text-amber-400 font-bold">
                        {barber.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{barber.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5 line-clamp-2">
                        {barber.bio}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={barber.isActive ? 'secondary' : 'outline'}
                    className={
                      barber.isActive
                        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800 flex-shrink-0'
                        : 'border-zinc-700 text-zinc-300 flex-shrink-0'
                    }
                  >
                    {barber.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-4">
                {/* Services */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Serviços</p>
                  <div className="flex flex-wrap gap-2">
                    {barber.serviceIds.map((serviceId) => (
                      <Badge
                        key={serviceId}
                        variant="outline"
                        className={`text-xs border ${SERVICE_COLORS[serviceId]}`}
                      >
                        {SERVICE_NAMES[serviceId]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 hover:bg-amber-500/10 gap-2 text-amber-400 hover:text-amber-300"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 hover:bg-red-500/10 gap-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
