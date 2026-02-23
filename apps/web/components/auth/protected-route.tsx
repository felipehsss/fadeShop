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
