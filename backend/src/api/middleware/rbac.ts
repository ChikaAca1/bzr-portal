/**
 * Role-Based Access Control Middleware (Phase 2.5: T040i)
 *
 * Restricts API endpoints based on user roles.
 * Security requirement: FR-029, FR-053b
 *
 * Roles hierarchy (from least to most privileged):
 * - viewer: Read-only access
 * - hr_manager: View positions, manage employee data
 * - bzr_officer: Create/edit risk assessments, generate documents
 * - admin: Full system access
 */

import { Context } from 'hono';
import { getAuthUser, requireAuthUser } from './auth';

export type UserRole = 'admin' | 'bzr_officer' | 'hr_manager' | 'viewer';

/**
 * Middleware to require specific role(s)
 *
 * Usage:
 *   app.post('/documents', authMiddleware, requireRole('bzr_officer', 'admin'), async (c) => { ... })
 *
 * @param allowedRoles - One or more roles that are allowed
 * @returns Middleware function
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context, next: Function) => {
    const user = requireAuthUser(c);

    if (!allowedRoles.includes(user.role as UserRole)) {
      return c.json(
        {
          error: 'Forbidden',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`,
        },
        403
      );
    }

    await next();
  };
}

/**
 * Middleware to require admin role
 *
 * Shorthand for requireRole('admin')
 */
export function requireAdmin() {
  return requireRole('admin');
}

/**
 * Middleware to require BZR Officer role (or higher)
 *
 * Allows: bzr_officer, admin
 */
export function requireBZROfficer() {
  return requireRole('bzr_officer', 'admin');
}

/**
 * Check if user has a specific permission
 *
 * @param c - Hono context
 * @param requiredRole - Role required
 * @returns boolean
 */
export function hasRole(c: Context, requiredRole: UserRole): boolean {
  const user = getAuthUser(c);

  if (!user) {
    return false;
  }

  return user.role === requiredRole || user.role === 'admin'; // Admin has all permissions
}

/**
 * Check if user is admin
 *
 * @param c - Hono context
 * @returns boolean
 */
export function isAdmin(c: Context): boolean {
  return hasRole(c, 'admin');
}
