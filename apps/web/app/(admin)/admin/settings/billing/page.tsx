'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TenantStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
type PlanId = 'starter' | 'pro' | 'elite';

const PLAN_LABEL: Record<PlanId, { name: string; price: string }> = {
  starter: { name: 'Starter', price: 'R$ 49/mês' },
  pro: { name: 'Pro', price: 'R$ 99/mês' },
  elite: { name: 'Elite', price: 'R$ 149/mês' },
};

export default function BillingPage() {
  const [tenant, setTenant] = useState<{
    id: string;
    name: string | null;
    status: TenantStatus | null;
    planId: PlanId | null;
    currentPeriodEnd: string | null;
    gatewayCustomerId: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setError(null);
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Você precisa estar logado.');
        }
        const idToken = await user.getIdToken();
        const res = await fetch('/api/tenant/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? 'Não foi possível carregar sua assinatura.');
        }
        const data = (await res.json()) as {
          id: string;
          name: string | null;
          status: TenantStatus | null;
          planId: PlanId | null;
          currentPeriodEnd: string | null;
          gatewayCustomerId: string | null;
        };
        if (isMounted) setTenant(data);
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Erro ao carregar.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const statusBadge = useMemo(() => {
    const status = tenant?.status;
    if (status === 'active') {
      return { label: 'Ativa', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' };
    }
    if (status === 'trialing') {
      return { label: 'Em teste', className: 'border-amber-500/30 bg-amber-500/10 text-amber-200' };
    }
    if (status === 'past_due') {
      return { label: 'Pagamento pendente', className: 'border-red-500/30 bg-red-500/10 text-red-200' };
    }
    if (status === 'canceled') {
      return { label: 'Cancelada', className: 'border-zinc-700 bg-zinc-900/60 text-zinc-300' };
    }
    if (status === 'paused') {
      return { label: 'Pausada', className: 'border-zinc-700 bg-zinc-900/60 text-zinc-300' };
    }
    return { label: 'Indefinida', className: 'border-zinc-700 bg-zinc-900/60 text-zinc-300' };
  }, [tenant?.status]);

  const nextBillingText = useMemo(() => {
    if (!tenant?.currentPeriodEnd) return null;
    const dt = new Date(tenant.currentPeriodEnd);
    if (Number.isNaN(dt.getTime())) return null;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(dt);
  }, [tenant?.currentPeriodEnd]);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinatura e Cobrança</h1>
          <p className="text-muted-foreground mt-2">
            Status, plano e gestão pelo Stripe Customer Portal.
          </p>
        </div>
        <Link href="/admin/settings">
          <Button variant="outline" className="border-zinc-700">
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Sua assinatura</CardTitle>
            <p className="text-sm text-zinc-400">
              {tenant?.name ?? '—'}
            </p>
          </div>
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <p className="text-xs text-zinc-500">Plano</p>
              <p className="mt-1 text-base font-semibold">
                {tenant?.planId ? PLAN_LABEL[tenant.planId].name : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <p className="text-xs text-zinc-500">Preço</p>
              <p className="mt-1 text-base font-semibold">
                {tenant?.planId ? PLAN_LABEL[tenant.planId].price : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <p className="text-xs text-zinc-500">Próxima renovação</p>
              <p className="mt-1 text-base font-semibold">{nextBillingText ?? '—'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className={cn(
                'h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold',
                'w-full sm:w-auto',
              )}
              disabled={isLoading || isOpeningPortal || !tenant?.gatewayCustomerId}
              onClick={async () => {
                setError(null);
                setIsOpeningPortal(true);
                try {
                  const user = auth.currentUser;
                  if (!user) throw new Error('Você precisa estar logado.');
                  const idToken = await user.getIdToken();
                  const res = await fetch('/api/billing/create-portal-session', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${idToken}` },
                  });
                  if (!res.ok) {
                    const body = (await res.json().catch(() => null)) as { error?: string } | null;
                    throw new Error(body?.error ?? 'Não foi possível abrir o portal.');
                  }
                  const data = (await res.json()) as { url: string };
                  window.location.href = data.url;
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : 'Erro ao abrir portal.');
                  setIsOpeningPortal(false);
                }
              }}
            >
              {isOpeningPortal ? 'Abrindo...' : 'Gerir no Stripe'}
            </Button>

            <Link href="/#precos" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-zinc-700"
                disabled={isLoading}
              >
                Ver planos
              </Button>
            </Link>
          </div>

          {tenant?.status === 'past_due' ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Pagamento pendente. Abra o portal do Stripe para atualizar a forma de pagamento.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

