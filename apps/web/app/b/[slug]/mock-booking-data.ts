/**
 * Dados mockados para a página pública de agendamento (UI sem Firestore).
 */

export function getMockTenant(slug: string) {
  return {
    id: 'tenant-1',
    slug,
    name: 'Fade Shop Barbearia',
    ownerEmail: 'contato@fadeshop.com',
    status: 'active' as const,
    planId: 'plan-1',
    trialEndsAt: null,
    currentPeriodEnd: null,
    gatewayCustomerId: null,
    gatewaySubId: null,
    settings: {
      address: 'Rua das Flores, 123 — Centro',
      phone: '11999999999',
      logoUrl: undefined,
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      bookingLeadHours: 2,
      maxBookingDays: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockServices() {
  return [
    {
      id: 'svc-1',
      name: 'Corte masculino',
      description: 'Corte completo com acabamento',
      durationMin: 30,
      priceCents: 3500,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-2',
      name: 'Barba',
      description: 'Aparar e desenhar',
      durationMin: 20,
      priceCents: 2500,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-3',
      name: 'Corte + Barba',
      durationMin: 50,
      priceCents: 5500,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getMockBarbers() {
  return [
    {
      id: 'barber-1',
      name: 'Carlos',
      bio: 'Especialista em cortes clássicos',
      avatarUrl: undefined,
      serviceIds: ['svc-1', 'svc-2', 'svc-3'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'barber-2',
      name: 'Rafael',
      bio: 'Fade e degradê',
      avatarUrl: undefined,
      serviceIds: ['svc-1', 'svc-3'],
      createdAt: new Date().toISOString(),
    },
  ];
}
