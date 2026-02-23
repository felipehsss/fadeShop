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
