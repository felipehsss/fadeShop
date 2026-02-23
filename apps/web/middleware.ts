import { NextRequest, NextResponse } from 'next/server';

/**
 * O middleware do Next.js não tem acesso ao Firebase Auth diretamente.
 * Estratégia: verificar cookie de sessão gerado pelo Firebase Auth
 * (session cookie via API route após login) ou usar redirecionamento
 * baseado em cookie simples para UX fluida.
 *
 * Para MVP: proteção client-side via ProtectedRoute component.
 * Para produção: implementar Firebase Session Cookies com Admin SDK.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas de admin e super-admin são protegidas client-side pelo AuthProvider
  // O middleware aqui serve apenas para garantir rotas públicas corretas

  const isPublicPath =
    pathname.startsWith('/b/') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/webhooks');

  const isAdminPath =
    pathname.startsWith('/admin') || pathname.startsWith('/super-admin');

  // Para uma proteção server-side robusta, leia o session cookie aqui
  // Exemplo simplificado para MVP:
  if (isAdminPath) {
    // A proteção real acontece no AuthProvider (client-side)
    // e nas Firebase Security Rules (Firestore)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
