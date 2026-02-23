export type UserRole = 'super_admin' | 'tenant_admin' | 'barber';

export interface UserProfile {
  uid: string;
  role: UserRole;
  tenantId: string | null; // null = super_admin
  isActive: boolean;
  createdAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
}
