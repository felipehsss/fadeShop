export interface Barber {
  id: string;
  tenantId: string;
  profileId: string | null;   // Firebase Auth UID do barbeiro
  name: string;
  bio?: string;
  avatarUrl?: string;
  serviceIds: string[];       // Array com IDs dos serviços que executa
  isActive: boolean;
  createdAt: Date;
}
