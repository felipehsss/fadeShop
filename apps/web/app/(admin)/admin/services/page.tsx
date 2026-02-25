'use client';

import { Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';

const MOCK_SERVICES = [
  { id: '1', name: 'Corte Degradê', description: 'Corte clássico com degradação profissional', durationMin: 45, priceCents: 4500, isActive: true },
  { id: '2', name: 'Corte + Barba', description: 'Serviço combinado de corte e aparagem de barba', durationMin: 60, priceCents: 6000, isActive: true },
  { id: '3', name: 'Barboterapia', description: 'Tratamento com esfoliação e hidratação', durationMin: 50, priceCents: 5500, isActive: true },
  { id: '4', name: 'Corte Infantil', description: 'Corte especial para crianças', durationMin: 30, priceCents: 2500, isActive: true },
  { id: '5', name: 'Design de Barba', description: 'Modelagem e design personalizado', durationMin: 40, priceCents: 3500, isActive: true },
  { id: '6', name: 'Tingimento', description: 'Coloração de cabelo e barba', durationMin: 75, priceCents: 7500, isActive: true },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export default function AdminServicesPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_SERVICES;
    return MOCK_SERVICES.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Serviços</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os serviços oferecidos pela sua barbearia
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar serviços..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} serviço(s)
        </p>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-4">✂️</div>
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              Tente ajustar sua busca ou crie um novo serviço
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
              <Plus className="h-4 w-4" />
              Criar Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <Card key={service.id} className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden flex flex-col">
              <CardHeader className="border-b border-zinc-800 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </div>
                  <Badge variant={service.isActive ? 'secondary' : 'outline'} className={service.isActive ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800 flex-shrink-0' : 'border-zinc-700 text-zinc-300 flex-shrink-0'}>
                    {service.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-4">
                {/* Service Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-muted-foreground">Duração</span>
                    </div>
                    <span className="font-semibold">{service.durationMin} min</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-amber-400" />
                      <span className="text-muted-foreground">Preço</span>
                    </div>
                    <span className="text-lg font-bold text-amber-400">
                      {formatPrice(service.priceCents)}
                    </span>
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
