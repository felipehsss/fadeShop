import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const SetupClient = dynamic(() => import('./setup-client').then(mod => mod.SetupClient), {
  ssr: false,
  loading: () => <div className="text-zinc-100">Carregando setup...</div>,
});

export const runtime = 'nodejs';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OnboardingSetupPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Checkout não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">
              Volte para a página de preços e tente novamente.
            </p>
            <Link
              href="/#precos"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-4 font-semibold text-black hover:bg-amber-400"
            >
              Ver preços
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const tenantId = session.metadata?.tenantId ?? session.client_reference_id ?? '';
  const planId = session.metadata?.planId ?? '';

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Não foi possível iniciar o setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">
              Seu checkout foi concluído, mas os dados do tenant não foram encontrados.
            </p>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-4 font-semibold text-black hover:bg-amber-400"
            >
              Entrar
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <SetupClient tenantId={tenantId} planId={planId} />
      </div>
    </div>
  );
}

