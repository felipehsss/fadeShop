'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface BusinessHour {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function defaultBusinessHours(): BusinessHour[] {
  return [
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
  ];
}

export function SetupClient({ tenantId, planId }: { tenantId: string; planId: string }) {
  const router = useRouter();
  const [name, setName] = useState('Minha Barbearia');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(defaultBusinessHours());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = useMemo(() => slugify(slug), [slug]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-200"
        >
          Setup inicial
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">
          Configure sua barbearia
        </h1>
        <p className="text-sm text-zinc-400">
          Plano selecionado: <span className="text-zinc-200 font-semibold">{planId || '—'}</span>
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Dados do Estabelecimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                if (!slug.trim()) setSlug(value);
              }}
              className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (link público)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
              placeholder="ex: barbearia-do-joao"
              required
            />
            <p className="text-xs text-zinc-500">
              Link: <span className="text-zinc-300">/b/{normalizedSlug || '...'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso horário</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 text-sm text-zinc-100"
              >
                <option value="America/Sao_Paulo">São Paulo</option>
                <option value="America/Fortaleza">Fortaleza</option>
                <option value="America/Manaus">Manaus</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do logótipo (opcional)</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Horário de funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businessHours.map((h) => (
            <div
              key={h.dayOfWeek}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={cn(
                    'h-9 w-14 rounded-xl border text-sm font-semibold',
                    h.isActive
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-400',
                  )}
                  onClick={() => {
                    setBusinessHours((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === h.dayOfWeek ? { ...x, isActive: !x.isActive } : x,
                      ),
                    );
                  }}
                  aria-pressed={h.isActive}
                >
                  {DAY_LABELS[h.dayOfWeek]}
                </button>
                <span className="text-sm text-zinc-400">
                  {h.isActive ? 'Aberto' : 'Fechado'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={h.startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessHours((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === h.dayOfWeek ? { ...x, startTime: value } : x,
                      ),
                    );
                  }}
                  disabled={!h.isActive}
                  className={cn(
                    'h-10 rounded-xl border px-3 text-sm',
                    'border-zinc-800 bg-zinc-950/40 text-zinc-100',
                    !h.isActive ? 'opacity-50' : '',
                  )}
                />
                <span className="text-zinc-500">—</span>
                <input
                  type="time"
                  value={h.endTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusinessHours((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === h.dayOfWeek ? { ...x, endTime: value } : x,
                      ),
                    );
                  }}
                  disabled={!h.isActive}
                  className={cn(
                    'h-10 rounded-xl border px-3 text-sm',
                    'border-zinc-800 bg-zinc-950/40 text-zinc-100',
                    !h.isActive ? 'opacity-50' : '',
                  )}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <Button
        className="w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold"
        disabled={isSubmitting}
        onClick={async () => {
          setError(null);
          const cleanedName = name.trim();
          const cleanedSlug = normalizedSlug;
          if (!cleanedName || !cleanedSlug) {
            setError('Informe o nome e o slug.');
            return;
          }

          const currentUser = auth.currentUser;
          if (!currentUser) {
            setError('Você precisa estar logado para concluir o setup.');
            return;
          }

          setIsSubmitting(true);
          try {
            const idToken = await currentUser.getIdToken();
            const res = await fetch('/api/onboarding/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                tenantId,
                name: cleanedName,
                slug: cleanedSlug,
                logoUrl: logoUrl.trim() || null,
                phone: phone.trim() || null,
                address: address.trim() || null,
                timezone,
                businessHours,
              }),
            });

            if (!res.ok) {
              const body = (await res.json().catch(() => null)) as { error?: string } | null;
              throw new Error(body?.error ?? 'Não foi possível salvar o setup.');
            }

            router.push('/admin/dashboard');
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao concluir setup.');
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? 'Salvando...' : 'Concluir setup'}
      </Button>
    </div>
  );
}

