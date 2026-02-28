import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { getPlan, stripe } from '@/lib/stripe';

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
    const body = (await request.json().catch(() => null)) as { planId?: string } | null;

    const plan = getPlan(body?.planId ?? '');
    if (!plan) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }
    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Plano não configurado no Stripe.' }, { status: 500 });
    }

    const ownerUid = decoded.uid;
    const ownerEmail = decoded.email ?? '';
    if (!ownerEmail) {
      return NextResponse.json({ error: 'E-mail do usuário ausente.' }, { status: 400 });
    }

    const db = getAdminDb();
    const tenantRef = db.collection('tenants').doc();
    const now = new Date();

    const customer = await stripe.customers.create({
      email: ownerEmail,
      metadata: {
        ownerUid,
      },
    });

    await tenantRef.set({
      slug: `pending-${tenantRef.id}`,
      name: 'Minha Barbearia',
      ownerUid,
      ownerEmail,
      status: 'trialing',
      planId: plan.id,
      trialEndsAt: null,
      currentPeriodEnd: null,
      gatewayCustomerId: customer.id,
      gatewaySubId: null,
      isOnboardingComplete: false,
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        bookingLeadHours: 2,
        maxBookingDays: 30,
      },
      createdAt: now,
      updatedAt: now,
    });

    await db.collection('profiles').doc(ownerUid).set(
      {
        role: 'tenant_admin',
        tenantId: tenantRef.id,
        isActive: true,
        createdAt: now,
      },
      { merge: true },
    );

    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/onboarding/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?plan=${plan.id}&canceled=1`,
      client_reference_id: tenantRef.id,
      metadata: {
        tenantId: tenantRef.id,
        ownerUid,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          tenantId: tenantRef.id,
          ownerUid,
          planId: plan.id,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout indisponível.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

