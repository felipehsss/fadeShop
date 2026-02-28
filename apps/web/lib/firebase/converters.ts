import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Tenant } from '@/types/tenant';
import type { Appointment } from '@/types/appointment';
import type { Barber } from '@/types/barber';
import type { Service } from '@/types/service';

/**
 * Converte Timestamp do Firestore para Date do JavaScript.
 * Funciona tanto com Timestamp do client SDK quanto do admin SDK.
 */
export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return value.toDate();
}

/**
 * Firestore converter para Tenant.
 * Garante tipagem correta ao ler documentos da coleção 'tenants'.
 */
export const tenantConverter = {
  toFirestore(tenant: Tenant): DocumentData {
    return { ...tenant };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Tenant {
    const data = snap.data();
    return {
      id: snap.id,
      slug: data.slug,
      name: data.name,
      ownerUid: data.ownerUid ?? '',
      ownerEmail: data.ownerEmail,
      status: data.status,
      planId: data.planId,
      trialEndsAt: toDate(data.trialEndsAt),
      currentPeriodEnd: toDate(data.currentPeriodEnd),
      gatewayCustomerId: data.gatewayCustomerId ?? null,
      gatewaySubId: data.gatewaySubId ?? null,
      isOnboardingComplete: data.isOnboardingComplete ?? false,
      settings: data.settings ?? { timezone: 'America/Sao_Paulo', currency: 'BRL', bookingLeadHours: 2, maxBookingDays: 30 },
      createdAt: toDate(data.createdAt)!,
      updatedAt: toDate(data.updatedAt)!,
    };
  },
};

export const appointmentConverter = {
  toFirestore(appt: Appointment): DocumentData {
    return { ...appt };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Appointment {
    const data = snap.data();
    return {
      id: snap.id,
      tenantId: data.tenantId,
      barberId: data.barberId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      startsAt: toDate(data.startsAt)!,
      endsAt: toDate(data.endsAt)!,
      status: data.status,
      priceCents: data.priceCents,
      notes: data.notes,
      notifiedAt: toDate(data.notifiedAt),
      createdAt: toDate(data.createdAt)!,
    };
  },
};

export const barberConverter = {
  toFirestore(barber: Barber): DocumentData {
    return { ...barber };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Barber {
    const data = snap.data();
    return {
      id: snap.id,
      tenantId: data.tenantId,
      profileId: data.profileId ?? null,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      serviceIds: data.serviceIds ?? [],
      isActive: data.isActive ?? true,
      createdAt: toDate(data.createdAt)!,
    };
  },
};

export const serviceConverter = {
  toFirestore(service: Service): DocumentData {
    return { ...service };
  },
  fromFirestore(snap: QueryDocumentSnapshot): Service {
    const data = snap.data();
    return {
      id: snap.id,
      tenantId: data.tenantId,
      name: data.name,
      description: data.description,
      durationMin: data.durationMin,
      priceCents: data.priceCents,
      isActive: data.isActive ?? true,
      createdAt: toDate(data.createdAt)!,
    };
  },
};
