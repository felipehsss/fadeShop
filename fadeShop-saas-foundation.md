# fadeShop SaaS — Guia Fundacional Completo

> Stack: Next.js 14+ (App Router) · TypeScript · Firebase · Tailwind CSS · shadcn/ui

---

## 1. ESTRUTURA DE PASTAS

```
fadeshop-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── barbers/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── super-admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tenants/
│   │   │   │   └── page.tsx
│   │   │   └── plans/
│   │   │       └── page.tsx
│   │   └── layout.tsx          ← Layout cliente com AuthProvider
│   │
│   ├── b/
│   │   └── [slug]/
│   │       ├── page.tsx        ← SSR Server Component
│   │       ├── loading.tsx
│   │       ├── not-found.tsx
│   │       └── agendar/
│   │           └── page.tsx    ← Fluxo de agendamento (client)
│   │
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx              ← Root layout
│   └── page.tsx                ← Landing page do SaaS
│
├── components/
│   ├── ui/                     ← shadcn/ui (gerado automaticamente)
│   ├── auth/
│   │   └── protected-route.tsx
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── metrics-card.tsx
│   ├── booking/
│   │   ├── service-selector.tsx
│   │   ├── barber-selector.tsx
│   │   ├── slot-picker.tsx
│   │   └── confirm-form.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts           ← Firebase Client SDK
│   │   ├── admin.ts            ← Firebase Admin SDK (SSR)
│   │   └── converters.ts       ← Firestore data converters
│   ├── availability.ts         ← getAvailableSlots (lógica core)
│   ├── stripe.ts
│   └── utils.ts
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-tenant.ts
│   ├── use-appointments.ts
│   └── use-availability.ts
│
├── providers/
│   ├── auth-provider.tsx       ← AuthContext com role + tenantId
│   └── query-provider.tsx      ← React Query setup
│
├── types/
│   ├── tenant.ts
│   ├── appointment.ts
│   ├── barber.ts
│   ├── service.ts
│   ├── availability.ts
│   └── auth.ts
│
├── middleware.ts               ← Proteção de rotas por role
├── .env.local
├── next.config.ts
└── firestore.rules
```

---

## 2. TIPAGEM (types/)

### `types/auth.ts`
```typescript
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
```

### `types/tenant.ts`
```typescript
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
```

### `types/service.ts`
```typescript
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationMin: number;    // duração em minutos (ex: 30, 45, 60)
  priceCents: number;     // preço em centavos (ex: 3500 = R$ 35,00)
  isActive: boolean;
  createdAt: Date;
}
```

### `types/barber.ts`
```typescript
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
```

### `types/availability.ts`
```typescript
// Horário de trabalho semanal (regra recorrente)
export interface WorkingHours {
  id: string;
  barberId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom ... 6=Sab
  startTime: string; // "HH:MM" ex: "09:00"
  endTime: string;   // "HH:MM" ex: "18:00"
  isActive: boolean;
}

// Bloqueios pontuais (folga, pausa, manutenção)
export interface ScheduleBlock {
  id: string;
  barberId: string;
  startsAt: Date;
  endsAt: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Slot retornado pela calculadora
export interface TimeSlot {
  time: string;         // "HH:MM" ex: "09:00"
  startsAt: Date;       // Objeto Date completo com data+hora
  endsAt: Date;         // startsAt + durationMin
  isAvailable: boolean;
}
```

### `types/appointment.ts`
```typescript
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
```

---

## 3. CONFIGURAÇÃO DO FIREBASE

### `.env.local`
```bash
# Firebase Client SDK (público — seguro expor no front-end)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (PRIVADO — nunca expor no client)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

### `lib/firebase/client.ts` — Firebase Client SDK
```typescript
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Singleton — evita múltiplas instâncias em hot reload do Next.js
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
```

---

### `lib/firebase/admin.ts` — Firebase Admin SDK (SSR)
```typescript
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Admin SDK inicializado APENAS no servidor (Server Components, API Routes).
 * NUNCA importe este arquivo em Client Components.
 */

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Em produção: usar variáveis de ambiente
  // Em dev com emulador: usar GOOGLE_APPLICATION_CREDENTIALS
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // A chave privada vem com \n escapado no .env — precisamos converter
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });

  return adminApp;
}

// Lazy initialization para evitar erro em builds que não usam o Admin SDK
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
```

---

### `lib/firebase/converters.ts` — Converters Firestore
```typescript
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
      ownerEmail: data.ownerEmail,
      status: data.status,
      planId: data.planId,
      trialEndsAt: toDate(data.trialEndsAt),
      currentPeriodEnd: toDate(data.currentPeriodEnd),
      gatewayCustomerId: data.gatewayCustomerId ?? null,
      gatewaySubId: data.gatewaySubId ?? null,
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
```

---

## 4. AUTENTICAÇÃO — AuthProvider

### `providers/auth-provider.tsx`
```typescript
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import type { AuthUser, UserProfile } from '@/types/auth';

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  isBarber: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// Estado inicial
// ─────────────────────────────────────────────
const INITIAL_USER: AuthUser = {
  uid: '',
  email: null,
  displayName: null,
  photoURL: null,
  profile: null,
  isLoading: true, // true até confirmar estado de auth
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(INITIAL_USER);
  const router = useRouter();

  /**
   * Busca o perfil do usuário na coleção 'profiles' do Firestore.
   * O documento tem o mesmo ID que o Firebase Auth UID.
   */
  const fetchUserProfile = useCallback(
    async (firebaseUser: User): Promise<UserProfile | null> => {
      try {
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          console.warn(`Profile not found for uid: ${firebaseUser.uid}`);
          return null;
        }

        const data = profileSnap.data();
        return {
          uid: firebaseUser.uid,
          role: data.role,
          tenantId: data.tenantId ?? null,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } satisfies UserProfile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    [],
  );

  // ─── Listener do Firebase Auth ───────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Usuário deslogado
        setUser({
          uid: '',
          email: null,
          displayName: null,
          photoURL: null,
          profile: null,
          isLoading: false,
        });
        return;
      }

      // Busca perfil com role e tenantId
      const profile = await fetchUserProfile(firebaseUser);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        profile,
        isLoading: false,
      });
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // ─── Sign In ──────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(credential.user);

      // Redireciona com base no role
      if (profile?.role === 'super_admin') {
        router.push('/super-admin/dashboard');
      } else if (profile?.role === 'tenant_admin') {
        router.push('/admin/dashboard');
      } else if (profile?.role === 'barber') {
        router.push('/admin/schedule');
      } else {
        // Perfil não encontrado — desloga por segurança
        await firebaseSignOut(auth);
        throw new Error('Perfil de usuário não encontrado. Contate o suporte.');
      }
    },
    [router, fetchUserProfile],
  );

  // ─── Sign Out ─────────────────────────────────
  const signOut = useCallback(async (): Promise<void> => {
    await firebaseSignOut(auth);
    router.push('/login');
  }, [router]);

  // ─── Helpers de role ──────────────────────────
  const isSuperAdmin = user.profile?.role === 'super_admin';
  const isTenantAdmin = user.profile?.role === 'tenant_admin';
  const isBarber = user.profile?.role === 'barber';

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, isSuperAdmin, isTenantAdmin, isBarber }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### `middleware.ts` — Proteção de Rotas
```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * O middleware do Next.js não tem acesso ao Firebase Auth diretamente.
 * Estratégia: verificar cookie de sessão gerado pelo Firebase Auth
 * (session cookie via API route após login) ou usar redirecionamento
 * baseado em cookie simples para UX fluida.
 *
 * Para MVP: proteção client-side via ProtectedRoute component.
 * Para produção: implementar Firebase Session Cookies com Admin SDK.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas de admin e super-admin são protegidas client-side pelo AuthProvider
  // O middleware aqui serve apenas para garantir rotas públicas corretas
  
  const isPublicPath =
    pathname.startsWith('/b/') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/webhooks');

  const isAdminPath =
    pathname.startsWith('/admin') || pathname.startsWith('/super-admin');

  // Para uma proteção server-side robusta, leia o session cookie aqui
  // Exemplo simplificado para MVP:
  if (isAdminPath) {
    // A proteção real acontece no AuthProvider (client-side)
    // e nas Firebase Security Rules (Firestore)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### `components/auth/protected-route.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import type { UserRole } from '@/types/auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user.isLoading) return;

    if (!user.profile) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(user.profile.role)) {
      router.replace('/login');
    }
  }, [user, allowedRoles, router]);

  if (user.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user.profile || !allowedRoles.includes(user.profile.role)) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 5. CALCULADORA DE DISPONIBILIDADE (lib/availability.ts)

```typescript
import {
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  addMinutes,
  isWithinInterval,
  areIntervalsOverlapping,
  isBefore,
  isAfter,
  parseISO,
  format,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { WorkingHours, ScheduleBlock, TimeSlot } from '@/types/availability';
import type { Appointment } from '@/types/appointment';

// ─────────────────────────────────────────────
// Tipos de entrada da calculadora
// ─────────────────────────────────────────────
export interface GetAvailableSlotsParams {
  /** Data alvo (somente o dia é considerado) */
  targetDate: Date;

  /** Horários de trabalho do barbeiro para o dia da semana da targetDate */
  workingHours: WorkingHours | null;

  /** Agendamentos existentes do barbeiro na targetDate (status: 'scheduled' | 'confirmed') */
  existingAppointments: Appointment[];

  /** Bloqueios aprovados que podem sobrepor a targetDate */
  scheduleBlocks: ScheduleBlock[];

  /** Duração do serviço em minutos */
  serviceDurationMin: number;

  /**
   * Granularidade do slot em minutos.
   * Ex: 30 → slots às 09:00, 09:30, 10:00...
   * Deve ser divisível pela duração do serviço ou igual a ela.
   * @default 30
   */
  slotIntervalMin?: number;

  /**
   * Timezone da barbearia ex: 'America/Sao_Paulo'
   * @default 'America/Sao_Paulo'
   */
  timezone?: string;

  /**
   * Horas mínimas de antecedência para aceitar um agendamento.
   * Slots antes de (agora + leadHours) são bloqueados.
   * @default 2
   */
  leadHours?: number;
}

// ─────────────────────────────────────────────
// Função auxiliar: converte "HH:MM" + Date → Date completo
// ─────────────────────────────────────────────
function timeStringToDate(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return setMilliseconds(
    setSeconds(setMinutes(setHours(new Date(baseDate), hours), minutes), 0),
    0,
  );
}

// ─────────────────────────────────────────────
// Calculadora principal
// ─────────────────────────────────────────────
/**
 * Retorna todos os slots de horário disponíveis para um barbeiro
 * em um dia específico, considerando:
 *  - Horário de trabalho do barbeiro naquele dia da semana
 *  - Agendamentos já marcados (evita double-booking)
 *  - Bloqueios pontuais aprovados (folgas, pausas)
 *  - Tempo mínimo de antecedência (leadHours)
 *  - Duração do serviço (slot inválido se não couber antes do fim do expediente)
 */
export function getAvailableSlots({
  targetDate,
  workingHours,
  existingAppointments,
  scheduleBlocks,
  serviceDurationMin,
  slotIntervalMin = 30,
  timezone = 'America/Sao_Paulo',
  leadHours = 2,
}: GetAvailableSlotsParams): TimeSlot[] {
  // ── 1. Barbeiro não trabalha neste dia ───────
  if (!workingHours || !workingHours.isActive) {
    return [];
  }

  // ── 2. Limites do expediente ─────────────────
  const workStart = timeStringToDate(workingHours.startTime, targetDate);
  const workEnd = timeStringToDate(workingHours.endTime, targetDate);

  if (isBefore(workEnd, workStart) || workEnd.getTime() === workStart.getTime()) {
    return []; // Horário inválido
  }

  // ── 3. Tempo mínimo de antecedência ──────────
  // Converte "agora" para o timezone da barbearia para comparação justa
  const nowInTz = toZonedTime(new Date(), timezone);
  const minBookingTime = addMinutes(nowInTz, leadHours * 60);

  // ── 4. Gera todos os slots candidatos ─────────
  const candidateSlots: TimeSlot[] = [];
  let cursor = new Date(workStart);

  while (isBefore(cursor, workEnd)) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, serviceDurationMin);

    // O serviço completo deve caber dentro do expediente
    if (isAfter(slotEnd, workEnd)) {
      break;
    }

    candidateSlots.push({
      time: format(slotStart, 'HH:mm'),
      startsAt: slotStart,
      endsAt: slotEnd,
      isAvailable: true, // Será atualizado nas etapas seguintes
    });

    cursor = addMinutes(cursor, slotIntervalMin);
  }

  // ── 5. Filtra agendamentos existentes ─────────
  // Apenas agendamentos ativos bloqueiam o slot
  const activeAppointments = existingAppointments.filter(
    (appt) => appt.status === 'scheduled' || appt.status === 'confirmed',
  );

  // ── 6. Filtra bloqueios aprovados ─────────────
  const approvedBlocks = scheduleBlocks.filter(
    (block) => block.status === 'approved',
  );

  // ── 7. Verifica disponibilidade de cada slot ──
  return candidateSlots.map((slot) => {
    const slotInterval = { start: slot.startsAt, end: slot.endsAt };

    // 7a. Antes do tempo mínimo de antecedência
    if (isBefore(slot.startsAt, minBookingTime)) {
      return { ...slot, isAvailable: false };
    }

    // 7b. Conflito com agendamento existente
    const hasAppointmentConflict = activeAppointments.some((appt) =>
      areIntervalsOverlapping(
        slotInterval,
        { start: appt.startsAt, end: appt.endsAt },
        { inclusive: false }, // Bordas exatas não contam como conflito
      ),
    );

    if (hasAppointmentConflict) {
      return { ...slot, isAvailable: false };
    }

    // 7c. Conflito com bloqueio de agenda aprovado
    const hasBlockConflict = approvedBlocks.some((block) =>
      areIntervalsOverlapping(
        slotInterval,
        { start: block.startsAt, end: block.endsAt },
        { inclusive: false },
      ),
    );

    if (hasBlockConflict) {
      return { ...slot, isAvailable: false };
    }

    return { ...slot, isAvailable: true };
  });
}

// ─────────────────────────────────────────────
// Utilitário: retorna apenas os slots disponíveis
// ─────────────────────────────────────────────
export function getOnlyAvailableSlots(params: GetAvailableSlotsParams): TimeSlot[] {
  return getAvailableSlots(params).filter((slot) => slot.isAvailable);
}

// ─────────────────────────────────────────────
// Utilitário: agrupa slots por período do dia
// ─────────────────────────────────────────────
export interface GroupedSlots {
  morning: TimeSlot[];   // 00:00 – 11:59
  afternoon: TimeSlot[]; // 12:00 – 17:59
  evening: TimeSlot[];   // 18:00 – 23:59
}

export function groupSlotsByPeriod(slots: TimeSlot[]): GroupedSlots {
  return slots.reduce<GroupedSlots>(
    (acc, slot) => {
      const hour = slot.startsAt.getHours();
      if (hour < 12) acc.morning.push(slot);
      else if (hour < 18) acc.afternoon.push(slot);
      else acc.evening.push(slot);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] },
  );
}
```

---

## 6. ESQUELETO DA PÁGINA PÚBLICA — SSR

### `app/b/[slug]/page.tsx`
```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, getDocs, query, where, limit } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { BookingPageClient } from './booking-page-client';
import type { Tenant } from '@/types/tenant';
import type { Service } from '@/types/service';
import type { Barber } from '@/types/barber';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
interface PageProps {
  params: { slug: string };
}

// ─────────────────────────────────────────────
// Geração de Metadata dinâmica (SEO)
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tenant = await getTenantBySlug(params.slug);

  if (!tenant) {
    return { title: 'Barbearia não encontrada' };
  }

  return {
    title: `${tenant.name} — Agendar Horário Online`,
    description: `Agende seu horário na ${tenant.name} de forma rápida e fácil. Escolha o serviço, barbeiro e horário disponível.`,
    openGraph: {
      title: `${tenant.name} — Agendar Online`,
      description: `Agende na ${tenant.name}`,
      images: tenant.settings.logoUrl ? [tenant.settings.logoUrl] : [],
    },
  };
}

// ─────────────────────────────────────────────
// Funções de busca de dados (Server-side)
// ─────────────────────────────────────────────

/**
 * Busca o tenant pelo slug usando Admin SDK.
 * Executado exclusivamente no servidor — sem expor credenciais.
 */
async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = getAdminDb();

  const tenantsRef = db.collection('tenants');
  const snap = await tenantsRef
    .where('slug', '==', slug)
    .where('status', 'in', ['active', 'trialing'])
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    ownerEmail: data.ownerEmail,
    status: data.status,
    planId: data.planId,
    trialEndsAt: data.trialEndsAt?.toDate() ?? null,
    currentPeriodEnd: data.currentPeriodEnd?.toDate() ?? null,
    gatewayCustomerId: data.gatewayCustomerId ?? null,
    gatewaySubId: data.gatewaySubId ?? null,
    settings: data.settings ?? {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      bookingLeadHours: 2,
      maxBookingDays: 30,
    },
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

async function getTenantServices(tenantId: string): Promise<Service[]> {
  const db = getAdminDb();

  const snap = await db
    .collection('tenants')
    .doc(tenantId)
    .collection('services')
    .where('isActive', '==', true)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      tenantId,
      name: data.name,
      description: data.description,
      durationMin: data.durationMin,
      priceCents: data.priceCents,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    } satisfies Service;
  });
}

async function getTenantBarbers(tenantId: string): Promise<Barber[]> {
  const db = getAdminDb();

  const snap = await db
    .collection('tenants')
    .doc(tenantId)
    .collection('barbers')
    .where('isActive', '==', true)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      tenantId,
      profileId: data.profileId ?? null,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      serviceIds: data.serviceIds ?? [],
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    } satisfies Barber;
  });
}

// ─────────────────────────────────────────────
// Server Component — Página pública da barbearia
// ─────────────────────────────────────────────
export default async function BarbeariaPubPage({ params }: PageProps) {
  const { slug } = params;

  // Busca paralela: tenant + serviços + barbeiros
  const tenant = await getTenantBySlug(slug);

  // 404 se não existir ou estiver cancelado
  if (!tenant) {
    notFound();
  }

  // Busca serviços e barbeiros em paralelo (performance)
  const [services, barbers] = await Promise.all([
    getTenantServices(tenant.id),
    getTenantBarbers(tenant.id),
  ]);

  // Passa dados serializáveis para o Client Component
  // Datas são convertidas para string ISO para evitar erro de serialização
  return (
    <BookingPageClient
      tenant={serializeTenant(tenant)}
      services={services.map(serializeService)}
      barbers={barbers.map(serializeBarber)}
    />
  );
}

// ─────────────────────────────────────────────
// Serialização: Dates → ISO strings (Next.js exige)
// ─────────────────────────────────────────────
// Next.js não serializa objetos Date diretamente em props de Server → Client Component.
// Convertemos para string ISO e re-hidratamos no client.

function serializeTenant(tenant: Tenant) {
  return {
    ...tenant,
    trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: tenant.currentPeriodEnd?.toISOString() ?? null,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
  };
}

function serializeService(service: Service) {
  return {
    ...service,
    createdAt: service.createdAt.toISOString(),
  };
}

function serializeBarber(barber: Barber) {
  return {
    ...barber,
    createdAt: barber.createdAt.toISOString(),
  };
}
```

---

### `app/b/[slug]/booking-page-client.tsx`
```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Props serializadas vindas do Server Component
interface BookingPageClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings: {
      logoUrl?: string;
      address?: string;
      phone?: string;
      timezone: string;
    };
  };
  services: {
    id: string;
    name: string;
    description?: string;
    durationMin: number;
    priceCents: number;
  }[];
  barbers: {
    id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    serviceIds: string[];
  }[];
}

type BookingStep = 'service' | 'barber' | 'slot' | 'confirm' | 'success';

export function BookingPageClient({
  tenant,
  services,
  barbers,
}: BookingPageClientProps) {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Barbeiros filtrados pelo serviço selecionado
  const availableBarbers = selectedServiceId
    ? barbers.filter((b) => b.serviceIds.includes(selectedServiceId))
    : barbers;

  const formatPrice = (priceCents: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceCents / 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header da barbearia */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-6">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          {tenant.settings.logoUrl && (
            <Image
              src={tenant.settings.logoUrl}
              alt={tenant.name}
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">{tenant.name}</h1>
            <div className="flex gap-4 mt-1 text-sm text-zinc-400">
              {tenant.settings.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tenant.settings.address}
                </span>
              )}
              {tenant.settings.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {tenant.settings.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Indicador de progresso */}
        <div className="flex items-center justify-between mb-8">
          {(['service', 'barber', 'slot', 'confirm'] as BookingStep[]).map(
            (s, index) => {
              const steps = ['service', 'barber', 'slot', 'confirm'];
              const currentIndex = steps.indexOf(step);
              const stepIndex = index;
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;

              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'bg-amber-500 text-black'
                        : isCurrent
                        ? 'bg-zinc-100 text-black'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isCompleted ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* Step 1: Seleção de serviço */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Escolha o serviço</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setStep('barber');
                  }}
                  className="w-full text-left p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-amber-500 hover:bg-zinc-800 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium group-hover:text-amber-400 transition-colors">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-sm text-zinc-500 mt-1">
                          {service.description}
                        </p>
                      )}
                      <span className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
                        <Clock size={10} />
                        {service.durationMin} min
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      {formatPrice(service.priceCents)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Seleção de barbeiro */}
        {step === 'barber' && (
          <div>
            <button
              onClick={() => setStep('service')}
              className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-semibold mb-4">Escolha o profissional</h2>
            <div className="space-y-3">
              {availableBarbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarberId(barber.id);
                    setStep('slot');
                  }}
                  className="w-full text-left p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-amber-500 hover:bg-zinc-800 transition-all flex items-center gap-4 group"
                >
                  {barber.avatarUrl ? (
                    <Image
                      src={barber.avatarUrl}
                      alt={barber.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-amber-400">
                      {barber.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium group-hover:text-amber-400 transition-colors">
                      {barber.name}
                    </p>
                    {barber.bio && (
                      <p className="text-sm text-zinc-500">{barber.bio}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps 3 e 4 seguem o mesmo padrão — implementados no ClientComponent de cada step */}
        {step === 'slot' && (
          <div>
            <button
              onClick={() => setStep('barber')}
              className="text-sm text-zinc-500 hover:text-zinc-300 mb-4"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-semibold mb-4">Escolha data e horário</h2>
            {/* SlotPicker component busca disponibilidade via Client SDK */}
            <p className="text-zinc-500 text-sm">
              {'// SlotPicker component — usa getOnlyAvailableSlots() do lib/availability.ts'}
            </p>
            <Button
              className="mt-4 w-full bg-amber-500 text-black hover:bg-amber-400"
              onClick={() => setStep('confirm')}
            >
              Continuar (demo)
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <button
              onClick={() => setStep('slot')}
              className="text-sm text-zinc-500 hover:text-zinc-300 mb-4"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-semibold mb-4">Confirme seus dados</h2>
            <p className="text-zinc-500 text-sm">
              {'// ConfirmForm component — coleta nome e WhatsApp, cria appointment e client no Firestore'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

### `app/b/[slug]/loading.tsx`
```typescript
export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-6">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-56 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### `app/b/[slug]/not-found.tsx`
```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-6xl">💈</div>
      <h1 className="text-2xl font-bold">Barbearia não encontrada</h1>
      <p className="text-zinc-400 text-center max-w-sm">
        Este link pode estar desatualizado ou a barbearia pode ter encerrado suas atividades.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
      >
        Conhecer o fadeShop
      </Link>
    </div>
  );
}
```

---

## 7. LAYOUT DO ADMIN (Client Side)

### `app/(admin)/layout.tsx`
```typescript
import { AuthProvider } from '@/providers/auth-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

---

## 8. FIREBASE SECURITY RULES (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isSignedIn() {
      return request.auth != null;
    }

    function getProfile() {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data;
    }

    function isSuperAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/profiles/$(request.auth.uid))
        && getProfile().role == 'super_admin';
    }

    function isActiveTenantMember(tenantId) {
      return isSignedIn()
        && exists(/databases/$(database)/documents/profiles/$(request.auth.uid))
        && getProfile().tenantId == tenantId
        && getProfile().isActive == true;
    }

    function isTenantAdmin(tenantId) {
      return isActiveTenantMember(tenantId)
        && getProfile().role == 'tenant_admin';
    }

    function isBarberOfTenant(tenantId) {
      return isActiveTenantMember(tenantId)
        && (getProfile().role == 'tenant_admin' || getProfile().role == 'barber');
    }

    // ── Super Admin: acesso total ─────────────────────────────────────────────

    match /{document=**} {
      allow read, write: if isSuperAdmin();
    }

    // ── Plans: leitura pública ────────────────────────────────────────────────

    match /plans/{planId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    // ── Profiles: usuário lê/edita o próprio ─────────────────────────────────

    match /profiles/{uid} {
      allow read: if isSignedIn() && (request.auth.uid == uid || isSuperAdmin());
      allow create: if isSuperAdmin();
      // Usuário pode atualizar somente campos não-críticos
      allow update: if request.auth.uid == uid
        && !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(['role', 'tenantId', 'isActive']);
    }

    // ── Tenants ───────────────────────────────────────────────────────────────

    match /tenants/{tenantId} {
      // Membros do tenant leem os dados da barbearia
      allow read: if isActiveTenantMember(tenantId);
      // Apenas admin da barbearia atualiza settings
      allow update: if isTenantAdmin(tenantId)
        && !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(['status', 'planId', 'gatewayCustomerId', 'gatewaySubId']);
      allow create, delete: if isSuperAdmin();

      // ── Services ───────────────────────────────────────────────────────────

      match /services/{serviceId} {
        // Leitura pública (necessária para o fluxo de agendamento sem login)
        allow read: if true;
        allow write: if isTenantAdmin(tenantId);
      }

      // ── Barbers ────────────────────────────────────────────────────────────

      match /barbers/{barberId} {
        allow read: if true; // Público para o fluxo de agendamento
        allow write: if isTenantAdmin(tenantId);
      }

      // ── Working Hours ──────────────────────────────────────────────────────

      match /workingHours/{docId} {
        allow read: if true; // Necessário para calcular disponibilidade
        allow write: if isTenantAdmin(tenantId);
      }

      // ── Schedule Blocks ────────────────────────────────────────────────────

      match /scheduleBlocks/{blockId} {
        allow read: if isBarberOfTenant(tenantId);
        // Barbeiro cria bloqueio (fica 'pending' até admin aprovar)
        allow create: if isBarberOfTenant(tenantId)
          && request.resource.data.status == 'pending';
        // Admin aprova/rejeita; barbeiro só edita motivo do próprio bloqueio
        allow update: if isTenantAdmin(tenantId)
          || (isBarberOfTenant(tenantId)
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reason']));
        allow delete: if isTenantAdmin(tenantId);
      }

      // ── Clients ────────────────────────────────────────────────────────────

      match /clients/{clientId} {
        allow read: if isBarberOfTenant(tenantId);
        // Criação pública (fluxo de agendamento online sem login)
        allow create: if true;
        allow update, delete: if isTenantAdmin(tenantId);
      }

      // ── Appointments ───────────────────────────────────────────────────────

      match /appointments/{appointmentId} {
        allow read: if isBarberOfTenant(tenantId);
        // Criação pública (cliente agenda sem login)
        allow create: if true;
        // Membros atualizam status; barbeiro só atualiza o próprio
        allow update: if isTenantAdmin(tenantId)
          || (isBarberOfTenant(tenantId)
              && resource.data.barberId == request.auth.uid);
        allow delete: if isTenantAdmin(tenantId);
      }
    }
  }
}
```

---

## 9. INSTALAÇÃO E PRÓXIMOS PASSOS

### Dependências essenciais
```bash
# Criar projeto
npx create-next-app@latest fadeshop-saas \
  --typescript --tailwind --eslint --app --src-dir=false

cd fadeshop-saas

# Firebase
npm install firebase firebase-admin

# UI e utilitários
npm install date-fns date-fns-tz
npx shadcn@latest init
npx shadcn@latest add button card input label badge avatar

# Estado e cache
npm install zustand @tanstack/react-query

# Lucide Icons (já incluso no shadcn, mas explícito)
npm install lucide-react
```

### Ordem de implementação do MVP

```
Semana 1-2:  Setup + tipos + Firebase config + AuthProvider + middleware
Semana 3-4:  Firestore rules + Admin CRUD (serviços, barbeiros, horários)
Semana 5-6:  Calculadora de disponibilidade + testes unitários
Semana 7-8:  Página pública SSR (/b/[slug]) + fluxo de agendamento
Semana 9:    Integração Stripe + Cloud Functions (webhooks)
Semana 10:   WhatsApp (Evolution API) + cron de lembretes
Semana 11-12: Dashboards de métricas + polimento final
```

### Teste unitário da calculadora (jest)
```typescript
// __tests__/availability.test.ts
import { getAvailableSlots } from '@/lib/availability';

describe('getAvailableSlots', () => {
  const baseDate = new Date('2025-06-10T00:00:00-03:00'); // Terça-feira

  const workingHours = {
    id: '1', barberId: 'b1', dayOfWeek: 2 as const,
    startTime: '09:00', endTime: '12:00', isActive: true,
  };

  it('retorna todos os slots quando não há conflitos', () => {
    const slots = getAvailableSlots({
      targetDate: baseDate,
      workingHours,
      existingAppointments: [],
      scheduleBlocks: [],
      serviceDurationMin: 30,
      slotIntervalMin: 30,
      leadHours: 0,
    });

    const available = slots.filter((s) => s.isAvailable);
    expect(available.map((s) => s.time)).toEqual([
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    ]);
  });

  it('bloqueia slot com agendamento existente', () => {
    const existing = [{
      id: 'appt1', tenantId: 't1', barberId: 'b1', clientId: 'c1', serviceId: 's1',
      startsAt: new Date('2025-06-10T09:00:00-03:00'),
      endsAt: new Date('2025-06-10T09:30:00-03:00'),
      status: 'scheduled' as const, priceCents: 3500,
      notifiedAt: null, createdAt: new Date(),
    }];

    const slots = getAvailableSlots({
      targetDate: baseDate,
      workingHours,
      existingAppointments: existing,
      scheduleBlocks: [],
      serviceDurationMin: 30,
      leadHours: 0,
    });

    const nineAM = slots.find((s) => s.time === '09:00');
    expect(nineAM?.isAvailable).toBe(false);

    const nineThirty = slots.find((s) => s.time === '09:30');
    expect(nineThirty?.isAvailable).toBe(true);
  });

  it('retorna vazio quando barbeiro não trabalha neste dia', () => {
    const slots = getAvailableSlots({
      targetDate: baseDate,
      workingHours: null,
      existingAppointments: [],
      scheduleBlocks: [],
      serviceDurationMin: 30,
      leadHours: 0,
    });
    expect(slots).toHaveLength(0);
  });
});
```
