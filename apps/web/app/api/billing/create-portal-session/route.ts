import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

function getOrigin(request: Request) {
  const url = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (proto && host) return `${proto}://${host}`;
  return url.origin;
}

async function verifyBearerToken(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const [kind, token] = header.split(' ');
  if (kind !== 'Bearer' || !token) {
    throw new Error('Não autenticado.');
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded;
}

export async function POST(request: Request) {
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

    const tenant = tenantSnap.data() as { gatewayCustomerId?: string | null; ownerUid?: string };
    if (!tenant.ownerUid || tenant.ownerUid !== decoded.uid) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }
    if (!tenant.gatewayCustomerId) {
      return NextResponse.json({ error: 'Customer do Stripe não encontrado.' }, { status: 400 });
    }

    const origin = getOrigin(request);
    const portal = await stripe.billingPortal.sessions.create({
      customer: tenant.gatewayCustomerId,
      return_url: `${origin}/admin/settings/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

