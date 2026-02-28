import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

function mapStripeSubStatus(status: string) {
  if (status === 'active') return 'active';
  if (status === 'trialing') return 'trialing';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'canceled') return 'canceled';
  if (status === 'paused') return 'paused';
  return 'paused';
}

async function findTenantIdBySubscriptionId(subscriptionId: string) {
  const db = getAdminDb();
  const snap = await db
    .collection('tenants')
    .where('gatewaySubId', '==', subscriptionId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0]!.id;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const signature = (await headers()).get('stripe-signature') ?? '';
  const body = await request.text();

  if (!secret) {
    return new Response('Webhook secret não configurado', { status: 500 });
  }

  let event: unknown;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response('Assinatura inválida', { status: 400 });
  }

  const db = getAdminDb();

  try {
    const e = event as { type: string; data: { object: unknown } };

    if (e.type === 'checkout.session.completed') {
      const session = e.data.object as {
        id: string;
        mode: string;
        subscription: string | null;
        customer: string | null;
        metadata?: Record<string, string>;
        client_reference_id?: string | null;
      };

      if (session.mode !== 'subscription' || !session.subscription) {
        return new Response(null, { status: 200 });
      }

      const tenantId = session.metadata?.tenantId ?? session.client_reference_id ?? null;
      if (!tenantId) {
        return new Response(null, { status: 200 });
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const status = mapStripeSubStatus(subscription.status);
      const planId = subscription.metadata?.planId ?? session.metadata?.planId ?? null;

      const update: Record<string, unknown> = {
        status,
        gatewayCustomerId: session.customer ?? null,
        gatewaySubId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      };
      if (planId) update.planId = planId;

      await db.collection('tenants').doc(tenantId).set(
        update,
        { merge: true },
      );
    }

    if (e.type === 'customer.subscription.updated' || e.type === 'customer.subscription.deleted') {
      const subscription = e.data.object as {
        id: string;
        status: string;
        current_period_end: number;
        metadata?: Record<string, string>;
      };

      const tenantId = await findTenantIdBySubscriptionId(subscription.id);
      if (!tenantId) {
        return new Response(null, { status: 200 });
      }

      const status = mapStripeSubStatus(subscription.status);
      const planId = subscription.metadata?.planId ?? null;

      const update: Record<string, unknown> = {
        status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      };
      if (planId) update.planId = planId;

      await db.collection('tenants').doc(tenantId).set(
        update,
        { merge: true },
      );
    }

    if (e.type === 'invoice.payment_failed') {
      const invoice = e.data.object as { subscription: string | null };
      if (!invoice.subscription) {
        return new Response(null, { status: 200 });
      }
      const tenantId = await findTenantIdBySubscriptionId(invoice.subscription);
      if (!tenantId) {
        return new Response(null, { status: 200 });
      }
      await db.collection('tenants').doc(tenantId).set(
        { status: 'past_due', updatedAt: new Date() },
        { merge: true },
      );
    }

    if (e.type === 'invoice.paid') {
      const invoice = e.data.object as { subscription: string | null };
      if (!invoice.subscription) {
        return new Response(null, { status: 200 });
      }
      const tenantId = await findTenantIdBySubscriptionId(invoice.subscription);
      if (!tenantId) {
        return new Response(null, { status: 200 });
      }
      await db.collection('tenants').doc(tenantId).set(
        { status: 'active', updatedAt: new Date() },
        { merge: true },
      );
    }

    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 200 });
  }
}
