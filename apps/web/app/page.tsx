import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PLANS: Array<{
  id: 'starter' | 'pro' | 'elite';
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 49/mês',
    description: 'Para começar a agendar e reduzir faltas.',
    features: ['Agenda online', '1 barbeiro', 'Página pública /b/[slug]'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 99/mês',
    description: 'Para transformar agendamento em faturamento.',
    features: ['Agenda', 'PDV', 'Comissões', 'Até 5 barbeiros'],
    featured: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 'R$ 149/mês',
    description: 'Para operação completa e gestão 360º.',
    features: ['Ilimitado', 'Estoque', 'CRM', 'Lembretes WhatsApp'],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="font-bold tracking-tight">fadeShop</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="#precos" className="text-sm text-zinc-300 hover:text-zinc-100">
              Preços
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-zinc-700">
                Entrar
              </Button>
            </Link>
            <Link href="/signup?plan=pro">
              <Button className="bg-amber-500 text-black hover:bg-amber-400">
                Começar agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-200"
              >
                SaaS para barbearias reais
              </Badge>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Automatize sua barbearia e foque em cortar cabelo.
              </h1>
              <p className="mt-4 text-zinc-300 text-base sm:text-lg leading-relaxed">
                Agendamento online premium, gestão por barbeiro e cobrança recorrente.
                Feito para crescer com multi-tenancy e segurança em produção.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/signup?plan=pro" className="w-full sm:w-auto">
                  <Button className="w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold">
                    Criar conta e assinar
                  </Button>
                </Link>
                <Link href="#precos" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-zinc-700 text-zinc-100 hover:bg-zinc-900"
                  >
                    Ver preços
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: 'Mobile-first', desc: 'Experiência premium no telemóvel' },
                  { title: 'Multi-tenant', desc: 'Arquitetura SaaS escalável' },
                  { title: 'Stripe', desc: 'Assinatura e cobrança automática' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="precos" className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tabela de Preços</h2>
              <p className="mt-2 text-zinc-400">
                Planos mensais. Upgrade/downgrade a qualquer momento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={
                  plan.featured
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-zinc-800 bg-zinc-900/40'
                }
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.featured ? (
                      <Badge className="bg-amber-500 text-black hover:bg-amber-500">
                        Mais vendido
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-extrabold">{plan.price}</p>
                    <p className="text-xs text-zinc-500 mt-1">Cobrança recorrente no Stripe</p>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 text-sm text-zinc-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/signup?plan=${plan.id}`} className="block">
                    <Button
                      className={
                        plan.featured
                          ? 'w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold'
                          : 'w-full h-12 rounded-xl border border-zinc-700 bg-zinc-950/40 text-zinc-100 hover:bg-zinc-900 text-base font-semibold'
                      }
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      Assinar {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <Card className="border-zinc-800 bg-zinc-900/30">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Pronto para começar?</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Em poucos minutos você configura sua barbearia e já vende pelo link público.
                </p>
              </div>
              <Link href="/signup?plan=pro" className="w-full sm:w-auto">
                <Button className="w-full h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-base font-semibold">
                  Criar conta
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold">fadeShop</p>
            <p className="text-sm text-zinc-500 mt-1">© {new Date().getFullYear()}.</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/b/demo" className="hover:text-zinc-100">
              Ver demo
            </Link>
            <Link href="/login" className="hover:text-zinc-100">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
