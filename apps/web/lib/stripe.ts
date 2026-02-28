import 'server-only';
import Stripe from 'stripe';

export type PlanId = 'starter' | 'pro' | 'elite';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthlyCents: number;
  stripePriceId: string;
  highlights: string[];
  limits: {
    maxBarbers: number | 'unlimited';
  };
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthlyCents: 4900,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? '',
    highlights: ['Apenas agenda', '1 barbeiro'],
    limits: { maxBarbers: 1 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthlyCents: 9900,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? '',
    highlights: ['Agenda', 'PDV', 'Comissões', 'Até 5 barbeiros'],
    limits: { maxBarbers: 5 },
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    priceMonthlyCents: 14900,
    stripePriceId: process.env.STRIPE_PRICE_ELITE ?? '',
    highlights: ['Ilimitado', 'Estoque', 'CRM', 'Lembretes WhatsApp'],
    limits: { maxBarbers: 'unlimited' },
  },
};

export function getPlan(planId: string): Plan | null {
  if (planId === 'starter') return PLANS.starter;
  if (planId === 'pro') return PLANS.pro;
  if (planId === 'elite') return PLANS.elite;
  return null;
}

export function formatPlanPrice(priceMonthlyCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceMonthlyCents / 100);
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-02-24.acacia',
});
