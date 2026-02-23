export type TenantStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused';

export interface TenantSettings {
  address?: string;
  phone?: string;
  logoUrl?: string;
  timezone: string;         // ex: 'America/Sao_Paulo'
  currency: string;         // ex: 'BRL'
  bookingLeadHours: number; // horas mínimas de antecedência para agendar
  maxBookingDays: number;   // até quantos dias no futuro o cliente pode agendar
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  ownerEmail: string;
  status: TenantStatus;
  planId: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  gatewayCustomerId: string | null;
  gatewaySubId: string | null;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}
