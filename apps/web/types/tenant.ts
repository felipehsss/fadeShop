export type TenantStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused';

export type TenantPlanId = 'starter' | 'pro' | 'elite';

export interface BusinessHour {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TenantSettings {
  address?: string;
  phone?: string;
  logoUrl?: string;
  timezone: string;         // ex: 'America/Sao_Paulo'
  currency: string;         // ex: 'BRL'
  bookingLeadHours: number; // horas mínimas de antecedência para agendar
  maxBookingDays: number;   // até quantos dias no futuro o cliente pode agendar
  businessHours?: BusinessHour[];
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  ownerUid: string;
  ownerEmail: string;
  status: TenantStatus;
  planId: TenantPlanId;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  gatewayCustomerId: string | null;
  gatewaySubId: string | null;
  isOnboardingComplete: boolean;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}
