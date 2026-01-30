import { auth } from './auth';
import type { Session } from 'next-auth';

/**
 * Check if the current user is authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Check if the current user is an admin
 */
export async function requireAdmin() {
  const session = await requireAuth();

  // @ts-ignore - isAdmin is not in the default session type
  if (!session.user.isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Check if the current user has premium features
 * Admin users automatically have premium features
 */
export async function isPremiumUser(session: Session | null): Promise<boolean> {
  if (!session?.user) return false;

  // @ts-ignore - isPremium and isAdmin are not in the default session type
  return session.user.isPremium === true || session.user.isAdmin === true;
}

/**
 * Check if the current user is admin
 */
export async function isAdminUser(session: Session | null): Promise<boolean> {
  if (!session?.user) return false;

  // @ts-ignore - isAdmin is not in the default session type
  return session.user.isAdmin === true;
}
