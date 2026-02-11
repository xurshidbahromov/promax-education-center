// Authentication helper functions for role-based access (Client-side only)

import { createClient } from '@/utils/supabase/client';

export type UserRole = 'student' | 'teacher' | 'staff' | 'admin';

/**
 * Get current user's role (client-side)
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching user role:', error);
        return null;
    }

    return data.role as UserRole;
}

/**
 * Check if user has required role
 */
export async function hasRole(userId: string, requiredRole: UserRole | UserRole[]): Promise<boolean> {
    const role = await getUserRole(userId);

    if (!role) return false;

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(role);
    }

    return role === requiredRole;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === 'admin';
}

/**
 * Check if user is staff (teacher, staff, or admin)
 */
export async function isStaff(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role ? ['teacher', 'staff', 'admin'].includes(role) : false;
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPath(role: UserRole): string {
    switch (role) {
        case 'admin':
        case 'teacher':
        case 'staff':
            return '/admin';
        case 'student':
        default:
            return '/dashboard';
    }
}
