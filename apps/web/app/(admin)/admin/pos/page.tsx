'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PosPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">PDV</h2>
        <p className="text-sm text-muted-foreground">
          Em breve: liquidar agendamentos e criar comandas rapidamente.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Próximo passo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            No ÉPICO do PDV, esta tela vira o “caixa” mobile-first com formas de pagamento,
            itens e fechamento de conta.
          </p>
          <div className="flex gap-2">
            <Link href="/admin/schedule" className="flex-1">
              <Button variant="outline" className="w-full border-zinc-800 h-11 rounded-2xl">
                Ir para Agenda
              </Button>
            </Link>
            <Link href="/admin/dashboard" className="flex-1">
              <Button className="w-full h-11 rounded-2xl bg-amber-500 text-black hover:bg-amber-400">
                Ir para Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

