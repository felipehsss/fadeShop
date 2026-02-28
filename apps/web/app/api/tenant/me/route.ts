import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

async function verifyBearerToken(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const [kind, token] = header.split(' ');
  if (kind !== 'Bearer' || !token) {
    throw new Error('Não autenticado.');
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value && 'toDate' in value) {
    const v = value as { toDate: () => Date };
    return v.toDate().toISOString();
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const decoded = await verifyBearerToken(request);
    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(decoded.uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    const profile = profileSnap.data() as { tenantId?: string | null };
    const tenantId = profile.tenantId ?? null;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não definido.' }, { status: 400 });
    }

    const tenantSnap = await db.collection('tenants').doc(tenantId).get();
    if (!tenantSnap.exists) {
      return NextResponse.json({ error: 'Tenant não encontrado.' }, { status: 404 });
    }

    const data = tenantSnap.data() as Record<string, unknown>;
    return NextResponse.json({
      id: tenantSnap.id,
      slug: data.slug ?? null,
      name: data.name ?? null,
      ownerEmail: data.ownerEmail ?? null,
      status: data.status ?? null,
      planId: data.planId ?? null,
      currentPeriodEnd: toIso(data.currentPeriodEnd),
      gatewayCustomerId: data.gatewayCustomerId ?? null,
      gatewaySubId: data.gatewaySubId ?? null,
      isOnboardingComplete: data.isOnboardingComplete ?? false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
