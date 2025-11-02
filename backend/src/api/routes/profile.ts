/**
 * Public Profile tRPC Router
 *
 * Handles public profile pages for users/companies.
 * Allows users to share their business profile on bzr-portal.com/@username
 */

import { router, publicProcedure } from '../trpc/builder';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { companies } from '../../db/schema/companies';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// =============================================================================
// Input Schemas
// =============================================================================

const getProfileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

// =============================================================================
// Profile Router
// =============================================================================

export const profileRouter = router({
  /**
   * Get public profile by username
   *
   * Returns public profile information for a user.
   * Only returns data if user has enabled public profile.
   *
   * Input: { username: string }
   * Output: { user, companies }
   * Errors: NOT_FOUND (user not found or profile is private)
   */
  getByUsername: publicProcedure.input(getProfileSchema).query(async ({ input }) => {
    const { username } = input;

    try {
      // Find user by username
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Корисник није пронађен',
        });
      }

      // Check if profile is public
      if (!user.isPublicProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Профил је приватан',
        });
      }

      // Get user's companies (only show company names, not sensitive data)
      const userCompanies = await db.query.companies.findMany({
        where: (companies, { eq }) => eq(companies.userId, user.id),
        columns: {
          id: true,
          name: true,
          activityCode: true,
          createdAt: true,
          // Exclude sensitive data like PIB, JMBG, etc.
        },
      });

      // Return public profile data
      return {
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          website: user.website,
          logoUrl: user.logoUrl,
          createdAt: user.createdAt,
        },
        companies: userCompanies,
        stats: {
          companiesCount: userCompanies.length,
          memberSince: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Грешка при учитавању профила',
      });
    }
  }),
});
