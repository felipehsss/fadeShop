'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PlanId = 'starter' | 'pro' | 'elite';

const PLANS: Array<{
  id: PlanId;
  name: string;
  price: string;
  bullets: string[];
  featured?: boolean;
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 49/mês',
    bullets: ['Apenas agenda', '1 barbeiro'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 99/mês',
    bullets: ['Agenda', 'PDV', 'Comissões', 'Até 5 barbeiros'],
    featured: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 'R$ 149/mês',
    bullets: ['Ilimitado', 'Estoque', 'CRM', 'Lembretes WhatsApp'],
  },
];

function normalizePlanId(value: string | null): PlanId {
  if (value === 'starter') return 'starter';
  if (value === 'elite') return 'elite';
  return 'pro';
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialPlan = normalizePlanId(searchParams.get('plan'));

  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === planId) ?? PLANS[1]!,
    [planId],
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="font-bold tracking-tight">fadeShop</span>
          </Link>
          <div className="text-sm text-zinc-400">
            Já tem conta?{' '}
            <Link href="/login" className="text-amber-300 hover:text-amber-200">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Escolha seu plano</CardTitle>
              <p className="text-sm text-zinc-400">
                Checkout seguro no Stripe. Upgrade/downgrade depois pelo painel.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {PLANS.map((plan) => {
                const isSelected = plan.id === planId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    className={cn(
                      'w-full text-left rounded-xl border px-4 py-4 transition-colors',
                      'bg-zinc-950/30 hover:bg-zinc-950/50 active:scale-[0.99]',
                      isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-zinc-800',
                    )}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{plan.name}</p>
                          {plan.featured ? (
                            <Badge className="bg-amber-500 text-black hover:bg-amber-500">
                              Mais vendido
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {plan.bullets.map((b) => (
                            <span
                              key={b}
                              className="text-xs text-zinc-300 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-amber-300">{plan.price}</p>
                    </div>
                  </button>
                );
              })}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-400">
                Selecionado: <span className="text-zinc-200 font-semibold">{selectedPlan.name}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Criar conta</CardTitle>
              <p className="text-sm text-zinc-400">
                Depois do pagamento, você será redirecionado para configurar sua barbearia.
              </p>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);

                  const cleanedEmail = email.trim();
                  if (!cleanedEmail || !password) return;
                  if (password.length < 6) {
                    setError('A senha precisa ter pelo menos 6 caracteres.');
                    return;
                  }
                  if (password !== password2) {
                    setError('As senhas não coincidem.');
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    const credential = await createUserWithEmailAndPassword(
                      auth,
                      cleanedEmail,
                      password,
                    );
                    const idToken = await credential.user.getIdToken();

                    const res = await fetch('/api/billing/create-checkout-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                      },
                      body: JSON.stringify({ planId }),
                    });

                    if (!res.ok) {
                      const body = (await res.json().catch(() => null)) as { error?: string } | null;
                      throw new Error(body?.error ?? 'Não foi possível iniciar o checkout.');
                    }

                    const data = (await res.json()) as { url: string };
                    window.location.href = data.url;
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Confirmar senha</Label>
                  <Input
                    id="password2"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 rounded-xl border-zinc-800 bg-zinc-950/40"
                    required
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Redirecionando...' : `Continuar com ${selectedPlan.name}`}
                </Button>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Ao continuar, você aceita que o pagamento e a assinatura serão processados no Stripe.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

