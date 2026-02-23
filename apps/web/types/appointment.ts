export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'no_show'
  | 'canceled';

export interface Appointment {
  id: string;
  tenantId: string;
  barberId: string;
  clientId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  priceCents: number;     // Snapshot do preço no momento do agendamento
  notes?: string;
  notifiedAt: Date | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;          // WhatsApp (somente dígitos)
  email?: string;
  notes?: string;
  createdAt: Date;
}
