'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/40">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <p className="text-sm text-zinc-400">
            Acesse o painel da sua barbearia.
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setIsSubmitting(true);
              try {
                await signIn(email.trim(), password);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
              } finally {
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
                autoComplete="current-password"
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
              disabled={isSubmitting || user.isLoading}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-400">
            Não tem conta?{' '}
            <Link href="/signup?plan=pro" className="text-amber-300 hover:text-amber-200">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
